const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

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

//bucketlist
app.get('/bucketlist', showBucketlistOverzicht);
app.get('/bucketlistResultaat', showBucketlistResultaat);

app.post('/bucketlistResultaat', function(req, res, next){
    res.render('pages/bucketlist/bucketlistResultaat', {title: 'bucketlistoverzicht'}, {data: data});  
});

//function render bucketlistOvezicht page
function showBucketlistOverzicht(req, res) {
    res.render('pages/bucketlist/bucketlistOverzicht', {title: 'bucketlist'});
  };

  //function render bucketlistResultaat page
function showBucketlistResultaat(req, res) {
    res.render('pages/bucketlist/bucketlistResultaat', {title: 'bucketlistoverzicht'}, {interestView: data});
  };
  

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
