const express = require('express');
const app = express();
const dotenv = require('dotenv');
const request = require('request'); // package to handle http requests
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const port = process.env.PORT || 3000;
const helmet = require('helmet');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const cookieSession = require('cookie-session');

// Models
const Country = require('./models/countryModel'); // import schema bucketlist
const Profile = require('./models/profileModel');  // import schema for users

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

// cloudinary configuration
cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUD_API_KEY,
	api_secret: process.env.CLOUD_API_SECRET
});

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
app.use(cookieSession({
	name: 'session',
	keys: ['key1', 'key2'],
	maxAge: 24 * 60 * 60 * 1000 // 24 hours
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

//onboarding
app.get('/onboardingPageOne', onboardingPageOne);
app.get('/onboardingPageTwo', onboardingPageTwo);
app.get('/onboardingPageThree', onboardingPageThree);

function onboardingPageOne(req, res) {
	res.render('pages/onboarding/onboardingPageOne', {
		title: 'onboarding step 1'
	});
}

function onboardingPageTwo(req, res) {
	res.render('pages/onboarding/onboardingPageTwo', {
		title: 'onboarding step 2'
	});
}

function onboardingPageThree(req, res) {
	res.render('pages/onboarding/onboardingPageThree', {
		title: 'onboarding step 3'
	});
}

app.get('/welcome', loadWelcomePage);

function loadWelcomePage(req, res) {

	Profile.findById( req.session.profileId, (err, result) => {
		if (err) {
			console.log(err);
		} else {
			res.render('pages/welcome', {
				title: 'Welcome page',
				profileData: result.profileData
			});
		}
	});
}

// login feature
app.post('/login', postLimiter, checklogin);

app.get('/login', (req, res) => {
	res.render('pages/login/login', {
		title: 'Log in'
	});
});


// checks username and password with the database and if they agree
function checklogin(req, res, next) {
	console.log('Name being checked: ', req.body.email);

	// Searching the name in the db, when this is found goes to done function
	Profile.findOne({ email: req.body.email }).then(
		async (data, err) => {
			if (err) {
				console.log('An Error occured');
				next(err);
			} else {
				const validPassword = await bcrypt.compare(req.body.password, data.password);

				// If the name is connected to the password then the login is succesfull
				if (validPassword) {
					console.log('Login succes');
					req.session.profileId = data.id;
					res.redirect('/onboardingPageOne');
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
	const countryAddition = {
		countries:{
			countryToWhere: req.body.countryToWhere,
			countryWhyThere: req.body.countryWhyThere,
			countryWithWho: req.body.countryWithWho,
		}
	};
  
	Profile.findByIdAndUpdate(req.session.profileId, countryAddition)
		// eslint-disable-next-line no-unused-vars
		.then(() => {
			res.redirect('bucketlistOverview');
		})
		.catch((err) => {
			console.log(err);
		});
}

// function to find the saved data and show it
function showInformation(req, res) {

	Profile.findById(req.session.profileId, (err, result) => {
		if(err){
			console.log('not working');
		} else{
			res.render('pages/bucketlist/bucketlistResults', {
				title: 'Bucketlist',
				countryView: result.countries
			});
		}
			
	});
}

// function to show detail page for each created ID
function singleCountryInfo(req, res) {
	const id = req.params.id;
	Profile.findById(id)
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

// Cloudinary functions
const uploadToCloud = filePath => {
	return new Promise((resolve, reject) => {
		cloudinary.uploader
			.upload(filePath)
			.then(result => {
				fs.unlinkSync(filePath);
				// Remove uploaded file from the server once it gets uploaded to cloudinary server.
				resolve(result);
			})
			.catch(error => {
				reject(error);
			});
	});
};

const upload = multer({
	storage: multer.diskStorage({
		destination: 'static/img/',
		filename: function(req, file, cb) {
			cb(
				null,
				'myfile-' + Date.now() + path.parse(file.originalname).ext
			);
		}
	})
});

// profile feature
app.get('/add', profileForm);
app.get('/profile', showProfile);
app.post('/add',  upload.single('photo'), add);

function profileForm(req, res) {

	Profile.findById(req.session.profileId, (err, data) => {
		res.render('pages/add-profile.ejs', {
			title: 'addprofile',
			preferences: data.profileData.preferences
		});
	}
	);
}

// eslint-disable-next-line no-unused-vars
function add(req, res, next) {
	uploadToCloud(req.file.path)
		.then(result => {
			req.session.profilePicturePath = result.url;
			Profile.findByIdAndUpdate(req.session.profileId, {
				profileData: {
					firstName: req.body.name,
					profilePicturePath: req.session.profilePicturePath,
					age: req.body.age,
					bio: req.body.bio
				}
			})
				.then(() => {
					res.redirect('/profile');
				})
				.catch((err) => {
					console.log(err);
				});
		});
}

function showProfile(req, res) {

	Profile.findById(req.session.profileId, (err, result) => {
		if (err) {
			// eslint-disable-next-line no-undef
		} else {
			res.render('pages/profile', {
				title: 'Profile',
        profileData: result.profileData,
        countryView: result.countries,
        preferences: result.preferences,
			});
		}
	});
}

//preferences feature
app.get('/preferences', showPreferences);
app.post('/preferences', submitPreferences);
app.get('/yourpreferences', yourPreferences);



function showPreferences(req, res) {
	
	const id = req.session.profileId;

	Profile.findById(id, (err, data) => {
		if (data.preferences) {

			res.render('pages/preferences-form', {
				title: 'preferences',
				preferences: data.preferences
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

	const id = req.session.profileId;

	Profile.findByIdAndUpdate(id, {
		gender: req.body.genderSelect,
			preferences: {

				ownGender: req.body.genderSelect,
				preferredGender: req.body.genderPreference,
				maxDistance: req.body.distance,
				minAge: req.body.minAge,
				maxAge: req.body.maxAge
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

	const id = req.session.profileId;

	Profile.findById(id, (err, data) => {
		let preferences;
		if (data.showPreferences) {
			preferences = data.preferences;
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

// Logout session destroy
app.get('/logout' , logOut);

function logOut (req, res){
  req.session.destroy((err) =>{
    if(err) throw err;
    res.redirect('/login');
  })
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

