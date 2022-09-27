// import module `express`
const express = require('express');
const app = express();

// import module `controller` from `../controllers/controller.js`
const controller = require('../controllers/controller.js');

app.get('/', controller.getIndex);
app.get('/test', controller.getTest);
app.post('/registeruser', controller.registerUser);
app.get('/login', controller.getLogin);
app.post('/loginpost', controller.loginUser);
app.get('/register', controller.getRegister);


module.exports = app;