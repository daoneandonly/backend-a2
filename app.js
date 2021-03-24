const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const multer = require('multer')
const upload = multer({
  dest: 'static/img/'
})

app.set('view engine', 'ejs');
app.use(express.static('static'));
app.get('/add', profileForm)
app.post('/add', upload.single('photo'), add)

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

//bucketlist
app.get('/bucketlist', showBucketlistOverview);
app.get('/bucketlistResults', showBucketlistResults);

app.post('/bucketlistResults', function(req, res, next) {
  res.render('pages/bucketlist/bucketlistResults', {
    title: 'bucketlistoverview'
  }, {
    data: data
  });
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

function profileform(req, res) {
  res.render('add.ejs')
}

function add(req, res, next) {
  db.collection('profiles').insertOne({
    name: req.body.name,
    photo: req.file ? req.file.filename : null,
    age: req.body.age,
    bio: req.body.bio
  }, done)

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
