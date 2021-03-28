const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const multer = require('multer');
const mongoose = require('mongoose');
const Country = require('./models/countryModel'); //import schema
const upload = multer({
  dest: 'static/img/'
});

// dotenv
const dotenv = require('dotenv');
dotenv.config();


app.set('view engine', 'ejs');
app.use(express.static('static'));
app.use(express.urlencoded({
  extended: true
}));

// mongoose
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
})

// Mongodb
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
  useUnifiedTopology: true
});

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

    app.get('/add', profileForm);
    app.post('/add', upload.single('photo'), add);

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
