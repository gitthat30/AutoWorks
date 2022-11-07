var mongoose = require('mongoose');

var RequestSchema = new mongoose.Schema({
    userid: String,
    username: String,
    contact: String,
    car: String,
    type: String,
    description: String,
    image: String,
    image_id: String,
    date: String,
    status: String,
    price: Number,
    paid: Number,
    outstanding: Number,
    paiddate: String,

    messages: [{
        username: String,
        content: String,
        url: String,
        sentdate: String,
    }]
});

module.exports = mongoose.model('Request', RequestSchema);
