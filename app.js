const express = require('express');
const app = express();
// eslint-disable-next-line no-undef
const port = process.env.PORT || 3000;
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const Country = require('./models/countryModel'); // import schema bucketlist
const Profile = require('./models/profileModel'); // import schema profile
const Users = require('./models/usersModel');  // import schema for users
const request = require('request'); // package to handle http requests
const upload = multer({
	dest: 'static/img/'
});
const bcrypt = require('bcrypt');
const express = require("express");
const helmet = require("helmet");

const LoginLimiter = rateLimit({
	windowMs: 5 * 60 * 1000, //1 min
	max: 3,
	handler: function(req, res /*, next*/ ) {
		res.render('pages/errors/login-rate-limit', {
			title: 'Please try again later',
		});
	},
});

const registerLimiter = rateLimit({
	windowMs: 5 * 60 * 1000, //1 min
	max: 3,
	handler: function(req, res /*, next*/ ) {
		res.render('pages/errors/register-rate-limit', {
			title: 'Please try again later',
		});
	},
});

// mongoose
const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const validator = require('validator');

// dotenv
const dotenv = require('dotenv');
dotenv.config();

app.set('view engine', 'ejs');
app.use(express.static('static'));
app.use(express.urlencoded({
	extended: true
}));
app.use(helmet());

const db = mongoose.connection;

// connect mongoose with the database
// eslint-disable-next-line no-undef
mongoose.connect(process.env.DB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

db.on('connected', () => {
	console.log('Mongoose connected');
});

// ejs
app.set('view engine', 'ejs');
app.use(express.static('static'));

// resolve GET request
app.get('/', (req, res) => {
	res.render('pages/index', {
		title: 'home'
	});
});

app.get('/register', (req, res) => {
	res.render('pages/register', {
		title: 'register'
	});
});

// telling app to take the forms and acces them inside of the request variable inside of the post method
app.use(express.urlencoded({
	extended: false
}));

app.post('/registerUsers', registerLimiter, async (req, res) => {

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const newUsers = new Users({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    newUsers.save().then(() => {
      console.log('Added Users');
      res.redirect('/login')
      return;

    })

  } catch (error) {
    console.log(error);
  }
});

// login feature
app.post('/login', LoginLimiter, checklogin);
app.get('/loginFailed', checklogin);

app.get('/login', (req, res) => {
	res.render('pages/login/login', {
		title: 'Log in'
	});
});


// checks username and password with the database and if they agree
function checklogin(req, res, next) {
  console.log('req.body.name: ', req.body.name)
  Users.findOne({ name: req.body.name }, done) //Searching the name in the db, when this is found goes to done function

  async function done(err, users) {
    //  console.log(users)

    if (err) {
      next(err)
    } else {
      const validPassword = await bcrypt.compare(req.body.password, users.password);
      if (validPassword) { //If the name is connected to the password then the login is succesfull
        console.log('Login geslaagd');
        res.redirect('/add')
      } else { //If these are not the same the login is failed
        res.redirect('/loginFailed') //and the user will be redirected to the login failed page
      }
    }
  }
};

app.get('/loginFailed', (req, res) => {
	res.render('pages/login/loginFailed', {
		title: 'Log in failed'
	});
});


// bucketlist
app.get('/bucketlist', showBucketlistOverview);
app.get('/bucketlistResults', showBucketlistResults);
app.get('/bucketlistOverview', showInformation);
app.get('/bucketlistOverview/:id', singleCountryInfo);
app.get('/imagesGrid', showImages);
app.post('/bucketlistOverview', saveBucketlistResults);

function showBucketlistResults(req, res) {
	res.render('pages/bucketlist/bucketlistResults', {
		title: 'bucketlistResults'
	});
}

// function render bucketlistOverview page
function showBucketlistOverview(req, res) {
	res.render('pages/bucketlist/bucketlistOverview', {
		title: 'bucketlist'
	});
}


// save the form data to the database
function saveBucketlistResults(req, res) {
	const country = new Country(req.body);

	country.save()
		// eslint-disable-next-line no-unused-vars
		.then((result) => {
			res.redirect('bucketlistOverview')
		})
		.catch((err) => {
			console.log(err);
		});
}

// function to find the saved data and show it
function showInformation(req, res) {
	Country.find()
		.then((result) => {
			res.render('pages/bucketlist/bucketlistResults', {
				title: 'Bucketlist',
				countryView: result
			});
		});
}

// function to show detail page for each created ID
function singleCountryInfo(req, res) {
	const id = req.params.id;
	Country.findById(id)
		.then(result => {
			res.render('pages/bucketlist/countryDetails', {
				title: 'country details',
				countryInfo: result
			});
		})
		// eslint-disable-next-line no-unused-vars
		.catch(error => {
			res.render('pages/404.ejs');
		});

}

// eslint-disable-next-line no-undef
const api_key = process.env.API_KEY;
const api_url = 'https://api.unsplash.com/photos?client_id=';
// function to show the images from the unsplash API on the imagesGrid page
function showImages(req, res){
	request(api_url + api_key, function (error, response, body){
		if(error){
			console.log(error);
		}else{
			res.render('pages/bucketlist/imagesGrid', {title: 'images grid', imagesGridData: JSON.parse(body)});
		}
	});
}

// profile feature
app.get('/add', profileForm);
app.get('/profile', showProfile);
app.post('/add', upload.single('photo'), add);

function profileForm(req, res) {
	res.render('pages/add-profile.ejs', {
		title: 'addprofile'
	});
}

// eslint-disable-next-line no-unused-vars
function add(req, res, next) {
	const profile = new Profile({
		name: req.body.name,
		photo: req.file ? req.file.filename : null,
		age: req.body.age,
		bio: req.body.bio
	});

	profile.save()
		// eslint-disable-next-line no-unused-vars
		.then((result) => {
			res.redirect('/profile');
		})
		.catch((err) => {
			console.log(err);
		});
}

function showProfile(req, res) {
	let id = '6061afeeb42e3d5664e276b8'
	Profile.findOne({
		_id: id
	}, done);

	function done(err, result) {
		if (err) {
			// eslint-disable-next-line no-undef
			next(err);
		} else {
			res.render('pages/profile', {
				title: 'Profile',
				profileData: result
			});
			console.log(result.photo);
		}
	}
}


// if there is no page found give an error page as page
app.get('*', (req, res) => {
	res.status(404).render('pages/404', {
		url: req.url,
		title: 'Error 404',
	});
});

// listen to port 3000
app.listen(port, () => {
	console.log(`App.js starting at http://localhost:${port}`);
});
