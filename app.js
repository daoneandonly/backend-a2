const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('static'));

// Resolve GET request
app.get('/', (req, res) => {
  res.render('pages/index')
});

app.get('/register', (req, res) => {
  res.render('pages/register')
});

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


