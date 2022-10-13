const { connect } = require('mongoose');
const { ObjectId } = require('mongodb');
const app = require('../routes/routes.js');
const db = require('../models/db.js');
const path = require('path');
const account = require('../models/Accounts.js');
const request = require('../models/Requests.js');
const { totalmem } = require('os');

const PublicController = {
    getIndex: async function(req, res) {
        db.findOne(account, {username: 'HOST', host: true}, {}, (result) => {
            if (result) {
                res.render('login');
            }
            else {
                console.log(result);
                newuser = {
                    username: 'HOST',
                    password: '1234567890',
                    host: true,
                }

                account.create(newuser);
                res.render('login');
            }
        })     
        
    },

    registerUser: async function(req, res) {
        var user = req.body.name;
        var pass = req.body.pass;
        var con = req.body.contact;
        
        db.findOne(account, {username: user}, {}, (result) => {
            if (result) {
                console.log(result);
                req.flash('error_msg', 'User already exists. Please login.');            
                res.redirect('/register');
            }
            else {
                console.log(result);
                newuser = {
                    username: user,
                    password: pass,
                    contact: con,
                    host: false,
                }

                account.create(newuser);
                res.redirect('/');
            }
        })        
    },

    getLogin: async function(req, res) {
        res.render('login');
    },

    loginUser: async function(req, res) {
        var user = req.body.name;
        var pass = req.body.pass;
        
        db.findOne(account, {username: user}, {}, (result) => {
            if (result) {
                console.log(result);
                if(result.password == pass) {
                    req.session.user = result._id;
                    req.session.name = result.username;
                    req.session.host = result.host;
                    req.session.contact = result.contact;
                    console.log(req.session);

                    if(result.host)
                        res.redirect('/hhome');
                    else 
                        res.redirect('/home');
                }
                else {
                    console.log("work2");
                }
            }
            else {
                console.log("nw2");
            }
        })        
    },

    getRegister: async function(req, res) {
        res.render('register');
    },
}

module.exports = PublicController;