const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const Country = require('./models/countryModel'); //import schema
const upload = multer({
  dest: 'static/img/'
});

const LoginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, //1 min
    max: 3,
    handler: function(req, res /*, next*/) {
        res.render('pages/errors/login-rate-limit', {
            title: 'Please try again later',
        })
    },
});

const registerLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, //1 min
    max: 3,
    handler: function(req, res /*, next*/) {
        res.render('pages/errors/register-rate-limit', {
            title: 'Please try again later',
        })
    },
});

// Mongoose
const mongoose = require('mongoose')

// dotenv
const dotenv = require('dotenv');
dotenv.config();

app.set('view engine', 'ejs');
app.use(express.static('static'));
app.use(express.urlencoded({
  extended: true
}));

const db = mongoose.connection

// Connect mongoose with the database
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

db.on('connected', () => {
  console.log('Mongoose connected')
})

// ejs
app.set('view engine', 'ejs');
app.use(express.static('static'));

// Resolve GET request
app.get('/', (req, res) => {
  res.render('pages/index', {
    title: 'home'
  })
});

app.get('/register', (req, res) => {
  res.render('pages/register', {
    title: 'register'
  })
});

// Telling app to take the forms and acces them inside of the request variable inside of the post method
app.use(express.urlencoded({ extended: false }))

// Create users collection with schema
const Users = mongoose.model('Users', { name: String, email: String, password: String }, 'users' );

app.post('/registerUsers', registerLimiter, (req, res) => {

  try {
    const newUsers = new Users({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
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

//login feature
app.post('/login', LoginLimiter, checklogin);
app.get('/loginFailed', checklogin);
app.get('/add-profile', checklogin);

app.get('/login', (req, res) => {
  res.render('pages/login/login', {
    title: 'Log in'
  })
});


//checkt de ingegeven username en het wachtwoord met die uit de database
function checklogin(req, res, next) {
  console.log('req.body.name: ', req.body.name)
  Users.find({ name: req.body.name }, done) //zoekt naar de naam in de database zodra deze gevonden is door naar function done

  async function done(err, users) {
     console.log(users)

    if (err) {
      next(err)
    } else {
      if (users.password == req.body.password) { //als de naam overeenkomt met het wachtwoord dan is de login geslaagd
        console.log('Login geslaagd');
        res.redirect('/')
    } else {
        console.log('Login mislukt'); //zodra deze niet overeenkomen dan is de login mislukt.
        res.redirect('/loginFailed') //en wordt de pagina loginFailed terug gestuurd
      }
    }
  }
};

app.get('/loginFailed', (req, res) => {
  res.render('pages/login/loginFailed', {
    title: 'Log in failed'
  })
});


    //bucketlist 
    app.get('/bucketlist', showBucketlistOverview);
    app.get('/bucketlistResults', showBucketlistResults);
    app.get('/bucketlistOverview', showInformation);
    app.get('/bucketlistOverview/:id', singleCountryInfo);

    app.post('/bucketlistOverview', saveBucketlistResults);

    function showBucketlistResults(req, res) {
      res.render('pages/bucketlist/bucketlistResults', {
        title: 'bucketlistResults'
      });
    };

    //function render bucketlistOverview page
    function showBucketlistOverview(req, res) {
      res.render('pages/bucketlist/bucketlistOverview', {
        title: 'bucketlist'
      });
    };

    // save the form data to the database
    function saveBucketlistResults(req, res) {
      const country = new Country(req.body);

      country.save()
        .then((result) => {
          res.redirect('bucketlistOverview')
        })
        .catch((err) => {
          console.log(err);
        })
    };

    //function to find the saved data en show
    function showInformation(req, res) {
      Country.find()
        .then((result) => {
          res.render('pages/bucketlist/bucketlistResults', {title: 'Bucketlist', countryView: result})
        })
    };

    // function to show detail page for each created ID
    function singleCountryInfo (req, res) {
      const id = req.params.id;
      Country.findById(id)
      .then(result => {
        res.render('pages/bucketlist/countryDetails',{title: 'country details', countryInfo: result})
      })
      .catch(error => {
        res.render('pages/404.ejs');
      });
    
    };

app.get('/add', profileForm);
app.post('/add', upload.single('photo'), add);

function profileForm(req, res) {
  res.render('add.ejs')
}

function add(req, res, next) {
  db.collection('profiles').insertOne({
    name: req.body.name,
    photo: req.file ? req.file.filename : null,
    age: req.body.age,
    bio: req.body.bio
  }, done);

  function done(err, data) {
    if (err) {
      next(err)
    } else {
      res.redirect('/' + data.insertedId)
    }
  }
}

// If there is no page found give an error page as page
app.get('*', (req, res) => {
  res.status(404).render('pages/404', {
    url: req.url,
    title: 'Error 404',
  })
});

// Listen to port 3000
app.listen(port, () => {
  console.log(`App.js starting at http://localhost:${port}`);
});
