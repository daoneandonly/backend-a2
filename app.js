const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const multer = require('multer');
const upload = multer({
  dest: 'static/img/'
});

// Mongoose
const mongoose = require('mongoose')

// dotenv
const dotenv = require('dotenv');
dotenv.config();

app.set('view engine', 'ejs');
app.use(express.static('static'));

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
const Users = mongoose.model('Users', { name: String, email: String, password: String });

app.post('/registerUsers', (req, res) => {

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
app.post('/login', checklogin);

app.get('/login', (req, res) => {
  res.render('pages/login/login', {
    title: 'Log in'
  })
});

//checkt de ingegeven username en het wachtwoord met die uit de database 
function checklogin(req, res, next) {
  Users.findOne({ name: req.body.name }, done) //zoekt naar de naam in de database zodra deze gevonden is door naar function done

  function done(err, users) {
    // const name = req.body.name;
    // const password = req.body.pasword;
    if (err) {
      next(err)
    } else {
      if (users.password == req.body.password) { //als de naam overeenkomt met het wachtwoord dan is de login geslaagd
        console.log('Login geslaagd');
        res.render('add-profile.ejs')
    } else {
        console.log('Login mislukt'); //zodra deze niet overeenkomen dan is de login mislukt.
        res.render('loginFailed.ejs') //en wordt de pagina loginFailed terug gestuurd

      }
    }
  }
};


app.get('/add', profileForm);
app.post('/add', upload.single('photo'), add);

//bucketlist
app.get('/bucketlist', showBucketlistOverview);
app.get('/bucketlistResults', showBucketlistResults);

app.post('/bucketlistResults', showBucketlistResults);


// If there is no page found give an error page as page
app.get('*', (req, res) => {
  res.status(404).render('pages/404', {
    url: req.url,
    title: 'Error 404',
  })
});

//function render bucketlistOverview page
function showBucketlistOverview(req, res) {
  res.render('pages/bucketlist/bucketlistOverview', {
    title: 'bucketlist'
  });
};

//function render bucketlistResultaat page
function showBucketlistResults(req, res) {
  res.render('pages/bucketlist/bucketlistResults', {
    title: 'bucketlistoverview'
  }, {
    interestView: data
  });
};

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

// Listen to port 3000
app.listen(port, () => {
  console.log(`App.js starting at http://localhost:${port}`);
});
