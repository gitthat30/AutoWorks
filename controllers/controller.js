const { connect } = require('mongoose');
const { ObjectId } = require('mongodb');
const app = require('../routes/routes.js');
const db = require('../models/db.js');
const path = require('path');
const account = require('../models/Accounts.js');
const request = require('../models/Requests.js');

const controller = {
    getIndex: async function(req, res) {
        db.findOne(account, {username: 'HOST', host: true}, {}, (result) => {
            if (result) {
                res.render('home');
            }
            else {
                console.log(result);
                newuser = {
                    username: 'HOST',
                    password: '1234567890',
                    host: true,
                }

                account.create(newuser);
                res.render('home');
            }
        })     
        
    },

    getUser: async function(req, res) {
        console.log(req.session.name);
        res.render('./onSession/uhome');
    },

    getHost: async function(req, res) {
        console.log(req.session.name);
        res.render('./onSession/hhome');
    },

    getTest: async function(req, res) {
        one = req.session.name;
        two = req.session.user;
        res.render('test', {one: one, two: two});
    },

    getUserRequestCreation: async function(req, res) {
        res.render('./onSession/ucreaterequest');
    },

    submitRequest: async function(req, res) {
        //CCAPDEV thing to get the image dir
        const {image} = req.files;

        //Getting Date
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth();
        var yyyy = today.getFullYear();
        today = yyyy+'-'+mm+'-'+dd;

        var nrequest = {
            userid: req.session.user,
            car: req.body.rcar,
            type: req.body.rtype,
            description: req.body.rdesc,
            image: 'uploaded/'+image.name,
            date: today,
            status: 'Pending',
            price: -1,
            paid: 0,
            oustanding: -1,
            appdate: 'N/A',
            paiddate: 'N/A'
        }

        image.mv(path.resolve(__dirname,'../public/uploaded',image.name),(error) => {
            request.create(nrequest, (error,request) => {
                res.redirect('/home');
            })
          })

    },
    
    getUserRequests: async function(req, res) {
        var requests = await request.find({userid: req.session.user, status: 'Pending'});
        console.log(requests);
        res.render('./onSession/uviewpending', {req: requests});
    },

    getUserAcceptedRequests: async function(req, res) {
        var requests = await request.find({userid: req.session.user, status: 'Accepted'});
        console.log(requests);
        res.render('./onSession/uviewongoing', {active: requests});
    },

    getPendingRequests: async function(req, res) {
        var requests = await request.find({status: 'Pending'});
        res.render('./onSession/hpendingrequests', {req: requests});
    },

    acceptRequest: async function(req, res) {
        db.updateOne(request, {_id: req.body.reqid}, {status: 'Accepted', price: req.body.price, outstanding: req.body.price, appdate: req.body.appdate}, (result) => {
            res.redirect('/viewpending');
        });
        
    },

    settleRequest: async function(req, res) {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth();
        var yyyy = today.getFullYear();
        today = yyyy+'-'+mm+'-'+dd;

        db.updateOne(request, {_id: req.body.reqid}, {status: 'Settled', paiddate: today}, (result) => {
            res.redirect('/viewactive');
        });
    },

    addPaidBalance: async function(req, res) {
        var amountPaid = req.body.amount;
        db.updateOne(request, {_id: req.body.reqid}, {$inc: {paid: amountPaid, outstanding: (-1 * amountPaid)}}, (result) => {
            res.redirect('/viewactive');
        });
    },

    viewActiveRequests: async function(req, res) {
        var requests = await request.find({status: 'Accepted'});
        requests.forEach(async function(r) {
            var user = await account.findOne({_id: r.userid});
            r.username = user.username;
            r.canSettle = (r.paid >= r.price);
        })
        res.render('./onSession/hactiverequests', {req: requests});
    },

    // Not done
    viewGenerateReport: async function(req, res) {
        // var request = await request.find();
        res.render('./onSession/hreport');
    },

    generateReport: async function(req, res) {
        res.send("Nothing yet");
    },

    viewSuppliers: async function(req, res) {
        res.render('./onSession/hsuppliers');
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
                    req.session.host = result.host;
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

    logoutUser: function(req, res) {
        // Destroy the session and redirect to login page
          if (req.session) {
            req.session.destroy(() => {
              res.clearCookie('connect.sid');
              res.redirect('/');
            });
          }
    },
    
    getLogin: async function(req, res) {
        res.render('login');
    },

    getRegister: async function(req, res) {
        res.render('register');
    },

    // To update to use AJAX/fetch
    sendMessage: function(req, res) {
        var message = {
            authoruserid: req.session.user,
            content: req.body.content,
            sentdate: new Date()
        };
        db.updateOne(request, {_id: req.body.reqid}, {$push: {messages: message}});
        // res.render();
    }
}

module.exports = controller;