var mongoose = require('mongoose');

var RequestSchema = new mongoose.Schema({
    userid: String,
    username: String,
    car: String,
    type: String,
    description: String,
    image: String,
    date: String,
    status: String,
    price: Number,
    paid: Number,
    outstanding: Number,
    appdate: String,
    paiddate: String,

    messages: [{
        authoruserid: String,
        content: String,
        sentdate: Date,
    }]
});

module.exports = mongoose.model('Request', RequestSchema);
