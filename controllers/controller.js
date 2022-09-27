const { connect } = require('mongoose');
const app = require('../routes/routes.js');
const db = require('../models/db.js');
const path = require('path');
const account = require('../models/Accounts.js');

const controller = {
    getIndex: async function(req, res) {
        console.log(req.session.name);
        res.render('home');
    },

    getTest: async function(req, res) {
        one = req.session.name;
        two = req.session.user;
        res.render('test', {one: one, two: two});
    },

    registerUser: async function(req, res) {
        var user = req.body.name;
        var pass = req.body.pass;
        
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
                    host: false,
                }

                account.create(newuser);
                res.redirect('/');
            }
        })        
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

                    console.log(req.session);

                    res.redirect('/');
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
    
    getLogin: async function(req, res) {
        res.render('login');
    },

    getRegister: async function(req, res) {
        res.render('register');
    },
}

module.exports = controller;