var mongoose = require('mongoose');

var AccountSchema = new mongoose.Schema({
    username: String,
    password: String,
    contact: String,
    host: Boolean
});

module.exports = mongoose.model('Account', AccountSchema);
