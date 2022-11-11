var mongoose = require('mongoose');

var AccountSchema = new mongoose.Schema({
    username: String,
    password: String,
    contact: String,
    host: Boolean,
    notifications: [{
        message: String,
        read: Boolean,
        sentdate: String,
        reqid: String  
    }]
});

module.exports = mongoose.model('Account', AccountSchema);
