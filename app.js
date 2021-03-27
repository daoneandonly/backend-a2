const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const multer = require('multer');
const mongoose = require('mongoose');
const Countrydata = require('./models/countryModel'); //import schema
const upload = multer({
  dest: 'static/img/'
});

// dotenv
const dotenv = require('dotenv');
dotenv.config();


app.set('view engine', 'ejs');
app.use(express.static('static'));
app.use(express.urlencoded({ extended: true}));

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

  app.post('/bucketlistOverview', saveBucketlistResults);
  
    //function render bucketlistOverview page
  function showBucketlistOverview(req, res) {
    res.render('pages/bucketlist/bucketlistOverview', {
      title: 'bucketlist'
    });
  };

  function showBucketlistResults(req, res) {
    res.render('pages/bucketlist/bucketlistResults', {
      title: 'bucketlistResults'
    });
  };

  function saveBucketlistResults(req, res){
    const countrydata = new Countrydata(req.body);

    countrydata.save()
      .then((result)=> {
        res.redirect('bucketlistResults')
      })
      .catch((err)=> {
        console.log(err);
      })
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
})
.catch(console.error);
