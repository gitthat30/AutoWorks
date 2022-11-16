var mongoose = require('mongoose');

var AccountSchema = new mongoose.Schema({
    username: String,
    password: String,
    contact: String,
    host: Boolean,
    email: String,
    questions: [{
        question: String,
        answer: String
    }],
    answer: String,
    notifications: [{
        message: String,
        read: Boolean,
        sentdate: String,
        reqid: String  
    }]
});

module.exports = mongoose.model('Account', AccountSchema);
