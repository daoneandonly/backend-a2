const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('static'));

// Resolve GET request
app.get('/', (req, res) => {
  res.render('pages/index.ejs')
});

//bucketlist
app.get('/bucketlist', showBucketlistOverzicht);
app.get('/bucketlistResultaat', showBucketlistResultaat);

//function render bucketlistOvezicht page
function showBucketlistOverzicht(req, res) {
    res.render('pages/bucketlist/bucketlistOverzicht');
  };

  //function render bucketlistResultaat page
function showBucketlistResultaat(req, res) {
    res.render('pages/bucketlist/bucketlistResultaat');
  };

// Listen to port 3000
app.listen(port, () => {
  console.log(`App.js starting at http://localhost:${port}`);
});
