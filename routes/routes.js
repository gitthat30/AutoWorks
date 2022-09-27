// import module `express`
const express = require('express');
const app = express();

// import module `controller` from `../controllers/controller.js`
const controller = require('../controllers/controller.js');

app.get('/', controller.getIndex);
app.post('/test', controller.getTest);

module.exports = app;