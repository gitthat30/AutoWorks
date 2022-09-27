const { connect } = require('mongoose');
const app = require('../routes/routes.js');
const db = require('../models/db.js');
const path = require('path');
const account = require('../models/Accounts.js');

const controller = {
    getIndex: async function(req, res) {
        res.render('./home');
    },

    getTest: async function(req, res) {
        var user = req.body.name;
        var pass = req.body.pass;
        newuser = {
            username: user,
            password: pass,
            host: false,
        }
        
        account.create(newuser);

        res.redirect('/');
    },
}

module.exports = controller;