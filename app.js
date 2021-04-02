const express = require('express');
const app = express();
const dotenv = require('dotenv');
const request = require('request'); // package to handle http requests
const multer = require('multer');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const port = process.env.PORT || 3000;
const upload = multer({
	dest: 'static/img/'
});
const helmet = require("helmet");

// Models
const Country = require('./models/countryModel'); // import schema bucketlist
const Profile = require('./models/ProfileModel');  // import schema for users

const postLimiter = rateLimit({
	windowMs: 5 * 60 * 1000, //5 min
	max: 3, //max 3 tries
	handler: function(req, res /*, next*/ ) {
		res.render('pages/errors/login-rate-limit', {
			title: 'Please try again later',
		});
	},
});

// mongoose
const mongoose = require('mongoose');

// If we're gonna use a validator, we need to use it or not require it.
// const validator = require('validator');

// dotenv
dotenv.config();

app.set('view engine', 'ejs');
app.use(express.static('static'));
app.set('trust proxy', 1); //to make rate-limit in heroku
app.use(express.urlencoded({
	extended: true
}));
app.use(helmet({
  hsts: false,
	contentSecurityPolicy: false,
}));

const db = mongoose.connection;

// connect mongoose with the database
// eslint-disable-next-line no-undef
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(process.env.DB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

db.on('connected', () => {
	console.log('Mongoose connected');
});

// Set ejs
app.set('view engine', 'ejs');
app.use(express.static('static'));


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

app.post('/registerUsers', postLimiter, async (req, res) => {

	try {
		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		const newUser = new Profile({
			email: req.body.email,
			password: hashedPassword,
			profileData: {
				firstName: req.body.name,
				preferences: {}
			}
		});
		newUser.save().then(() => {
			console.log('Added Users');
			res.redirect('/login');
			return;

		});

	} catch (error) {
		console.log(error);
	}
});

// login feature
app.post('/login', postLimiter, checklogin);
app.get('/loginFailed', checklogin);

app.get('/login', (req, res) => {
	res.render('pages/login/login', {
		title: 'Log in'
	});
});

app.get('/welcome', loadWelcomePage);

function loadWelcomePage(req, res) {
	// TODO: get this ID from somewhere else
	let id = '6064fc6f95fcc753d0e6bee2';

	Profile.findById( id, (err, data) => {
		console.log(data);
		res.render('pages/welcome', {
			title: 'Welcome page',
			...data.profileData,
			firstName: data.FirstName || 'New Traveler'
		});
	});
}

// checks username and password with the database and if they agree
function checklogin(req, res, next) {
	console.log('Name being checked: ', req.body.name);

	// Searching the name in the db, when this is found goes to done function
	Profile.findOne({ email: req.body.name }).then(
		async (users, err) => {
			if (err) {
				console.log('An Error occured');
				next(err);
			} else {
				const validPassword = await bcrypt.compare(req.body.password, users.password);

				// If the name is connected to the password then the login is succesfull
				if (validPassword) {
					console.log('Login geslaagd');
					res.redirect('/add');
				} else { //If these are not the same the login is failed
					res.redirect('/loginFailed'); //and the user will be redirected to the login failed page
				}
			}
		}
	);

}

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
			res.redirect('bucketlistOverview');
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
const api_url = 'https://api.unsplash.com/search/photos?client_id=';
// function to show the images from the unsplash API on the imagesGrid page
//The JSON.parse() method parses a JSON string, constructing the JavaScript value or object described by the string.
function showImages(req, res){
	const searchInspiration = req.query.searchinspiration;
	request(api_url + api_key + '&query=' + searchInspiration, function (error, response, body){
		if(error){
			console.log(error);
		} else{
			res.render('pages/bucketlist/imagesGrid', {title: 'images grid', imagesGridData: JSON.parse(body)});
		}
	});
}

// profile feature
app.get('/add', profileForm);
app.get('/profile', showProfile);
app.post('/add', upload.single('photo'), add);

function profileForm(req, res) {
	// TODO: get this ID from somewhere else
	let id = '6064fc6f95fcc753d0e6bee2';

	Profile.findById(id, (err, data) => {
		res.render('pages/add-profile.ejs', {
			title: 'addprofile',
			preferences: data.profileData.preferences
		});
	}
	);
}

// eslint-disable-next-line no-unused-vars
function add(req, res) {
	const additions = {
		profileData: {
			firstName: req.body.name,
			profilePicturePath: req.file ? req.file.filename : null,
			age: req.body.age,
			bio: req.body.bio
		}
	};

	// TODO: get this ID from somewhere else
	let id = '6064fc6f95fcc753d0e6bee2';
	Profile.findByIdAndUpdate(id, additions)
		.then(() => {
			res.redirect('/profile');
		})
		.catch((err) => {
			console.log(err);
		});
}

function showProfile(req, res) {
	// TODO: get this ID from somewhere else
	let id = '6064fc6f95fcc753d0e6bee2';

	Profile.findById(id, (err, result) => {
		if (err) {
			// eslint-disable-next-line no-undef
		} else {
			res.render('pages/profile', {
				title: 'Profile',
				profileData: result.profileData
			});
			console.log(result.photo);
		}
	});
}

//preferences
app.get('/preferences', showPreferences);
app.post('/preferences', submitPreferences);
app.get('/yourpreferences', yourPreferences);



function showPreferences(req, res) {
	// TODO: get this ID from somewhere else
	let id = '6064fc6f95fcc753d0e6bee2';

	Profile.findById(id, (err, data) => {
		if (data.profileData) {

			res.render('pages/preferences-form', {
				title: 'preferences',
				...data.profileData
			});
		} else {
			res.render('pages/preferences-form', {
				title: 'preferences',
				preferences: ''
			});
		}
	});
}

function submitPreferences(req, res) {
	// TODO: get this ID from somewhere else
	let id = '6064fc6f95fcc753d0e6bee2';

	Profile.findByIdAndUpdate(id, {
		gender: req.body.genderSelect,
		profileData:{
			preferences: {
				gender:req.body.genderPreference,
				maxDistance: req.body.distance,
				minAge: req.body.minAge,
				maxAge: req.body.maxAge
			}
		}
	}, (err, data) => {
		if (err) {
			throw err;
		} else {
			res.redirect('/yourpreferences');
		}
	});

}

function yourPreferences(req, res) {
	// TODO: get this ID from somewhere else
	let id = '6064fc6f95fcc753d0e6bee2';

	Profile.findById(id, (err, data) => {
		let preferences;
		if (data.profileData) {
			preferences = data.profileData.preferences;
		} else {
			preferences = {};
		}

		if (err) {
			throw err;
		} else {
			res.render('pages/your-preferences', {
				title: 'Your preferences',
				preferences: preferences
			});
		}
	});
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
