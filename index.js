
//Express for server functions (Ports, etc.)
const express = require(`express`);

//File Upload - I'm assuming that users can upload a picture of their car/what they want fixed
const fileUpload = require('express-fileupload'); 

const app = express();

//Parsing body. Used for getting info from forms, etc.
const bodyParser = require(`body-parser`); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Routes to assign functions to URLS and also to reduce clutter and make implementation more organized
const routes = require(`./routes/routes.js`);
app.use('/', routes);

// import module `database` from `./model/db.js`
const db = require('./models/db.js');
// connects to the database
db.connect();

//Local path directory for our static resource folder
const path = require('path');

//Handlebars for rendering views
const hbs = require(`hbs`);

app.set(`view engine`, `hbs`); 
hbs.registerPartials(__dirname + `/views/partials`);

app.listen(1337, function () {
    console.log('app listening at port ' + 1337);
});