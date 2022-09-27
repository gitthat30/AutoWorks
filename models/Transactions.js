var mongoose = require('mongoose');

var RequestSchema = new mongoose.Schema({
    userid: String,
    name: String,
    description: String,
    image: String,
    date: String,
    status: String,
    price: Number,
    appdate: String
});

module.exports = mongoose.model('Request', RequestSchema);
