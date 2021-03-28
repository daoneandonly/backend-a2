const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser= require ('body-parser');
const multer = require('multer');
const upload = multer({
  dest: 'static/img/'
});

// dotenv
const dotenv = require('dotenv');
dotenv.config();


app.set('view engine', 'ejs');
app.use(express.static('static'));
app.use(bodyParser.urlencoded({extended:false}))

// Mongodb
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const uri = process.env.DB_URI;
const client = new MongoClient(uri,{ useUnifiedTopology: true });

app.set('view engine', 'ejs');
app.use(express.static('static'));

client.connect()
.then(async client => {
  let data = []
  const db = client.db("dateApp");

  data = await db.collection("users").find({}).toArray();
  
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
  app.post('/bucketlistResults', showBucketlistResults);
  
  //preferences
  app.get('/preferences', showPreferences);
  app.post('/preferences', submitPreferences);
  
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

  function showPreferences(req, res) {
  
    const id = '606093b37dffc346d27fbfb2'; //Insert the user ID here of the logged in user here

    db.collection('users').findOne({
        _id: mongo.ObjectID(id)
    }, done);

    function done(err, data) {
        if (err) {
            next(err);
        } else {
          console.log(data);
          res.render('pages/preferences', {
            user: data,
            title: 'change preferences'
          });
        }
    }

  
  };

  function submitPreferences(req, res) {
   
    const id = '606093b37dffc346d27fbfb2'; //Insert the user ID here of the logged in user here
  
    db.collection('users').updateOne({

      _id: mongo.ObjectID(id)},
      {
          $set: {
              
              preferences: {
                genderSelect: req.body.genderSelect,
                genderPreference: req.body.genderPreference,
                distance: req.body.distance, 
                minimumAge: req.body.minAge,
                maximumAge: req.body.maxAge
              }
          }
      });

      res.redirect('/preferences');

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
})
.catch(console.error);
