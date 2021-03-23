const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('static'));

// Resolve GET request
app.get('/', (req, res) => {
  res.render('pages/index.ejs')
});

// Listen to port 3000
app.listen(port, () => {
  console.log(`App.js starting at http://localhost:${port}`);
});