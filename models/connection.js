// This file is initializing the mongodb connection
// and exporting it for use in all other files through the module.exports

const mongoose = require('mongoose');
const databaseURL = 'mongodb://localhost:27017/carRepair';

const options = { useNewUrlParser: true,
  useUnifiedTopology: true};

mongoose.connect(databaseURL, options);

module.exports = mongoose;
