const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Resolve GET request
app.get('/', (req, res) => {
  res.send('Hello world!! 👋')
});

// Listen to port 3000
app.listen(port, () => {
  console.log(`App.js starting at http://localhost:${port}`);
});