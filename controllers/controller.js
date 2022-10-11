const { connect } = require('mongoose');
const { ObjectId } = require('mongodb');
const app = require('../routes/routes.js');
const db = require('../models/db.js');
const path = require('path');
const account = require('../models/Accounts.js');
const request = require('../models/Requests.js');
const { response } = require('../routes/routes.js');

const controller = {
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

    getTest: async function(req, res) {
        one = req.session.name;
        two = req.session.user;
        res.render('test', {one: one, two: two});
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

    getUser: async function(req, res) {
        console.log(req.session.name);
        res.render('./onSession/uhome', {isHost: false, username: req.session.name});
    },

    getHost: async function(req, res) {
        console.log(req.session.name);
        res.render('./onSession/hhome', {isHost: true, username: req.session.name});
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

    // To update to use AJAX/fetch, [edit: if may time : D]
    sendMessage: function(req, res) {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        var hr = today.getHours();
        var min = today.getMinutes();
        today = yyyy+'-'+mm+'-'+dd +' ('+hr+':'+min+')';

        var message = {
            username: req.session.name,
            content: req.body.content,
            sentdate: today
        };

        db.updateOne(request, {_id: req.body.reqid}, {$push: {messages: message}}, function() {
            if(req.session.host)
                res.redirect('/hviewpending?reqid=' + req.body.reqid); // is this too hardcode-y?
            else
                res.redirect('/uviewpending?reqid=' + req.body.reqid);
        });
    },

    getUserRequestCreation: async function(req, res) {
        res.render('./onSession/ucreaterequest', {isHost: false, username: req.session.name});
    },

    submitRequest: async function(req, res) {
        //CCAPDEV thing to get the image dir
        const {image} = req.files;

        //Getting Date
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        today = yyyy+'-'+mm+'-'+dd;

        var nrequest = {
            userid: req.session.user,
            username: req.session.name,
            contact: req.session.contact,
            car: req.body.rcar,
            type: req.body.rtype,
            description: req.body.rdesc,
            image: 'uploaded/'+image.name,
            date: today,
            status: 'Pending',
            price: -1,
            paid: 0,
            oustanding: -1,
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
        res.render('./onSession/uviewpending', {req: requests, isHost: false, username: req.session.name});
    },

    renderUserRequest: async function(req, res) {
        db.findOne(request, {_id: req.query.reqid}, {}, (result) => {
            if (result) {
                var response = {
                    car: result.car,
                    type: result.type,
                    description: result.description,
                    date: result.date,
                    status: result.status,
                    price: result.price,
                    isHost: false,
                    username: req.session.name
                };
                res.render('./onSession/uviewrequest', response)
            }
            else {
                console.log("failed");
            }
        })   
    },

    acceptRequest: function(req, res) {
        db.findOne(request, {_id: req.query.reqid}, {}, (result) => {
            // If request has been quoted already
            if (result.price != -1) {
                db.updateOne(request, {_id: req.query.reqid}, {status: "Accepted"}, (result) => {
                    res.redirect('/uviewallpending');
                });
            }
            else
                res.redirect('/uviewallpending');
        });
        
    },

    declineRequest: function(req, res) {
        res.send("What happens when it gets declined?");
    },

    getEditRequest: function(req, res) {
        db.findOne(request, {_id: req.query.reqid}, {}, (result) => {
            if (result) {
                res.render("./onSession/ueditrequest", {car: result.car, type: result.type, description: result.description, ogid:result._id, isHost: false, username: req.session.name});
            }
            else
                res.redirect('/uviewallpending');
        });
    },

    getEditRequestAction: function(req, res) {
        useogpic = false;

        if(!req.files)
            useogpic = true;

        //Getting Date
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        today = yyyy+'-'+mm+'-'+dd;

        if(!useogpic) {
            const {image} = req.files;
            var nrequest = {
                userid: req.session.user,
                username: req.session.name,
                contact: req.session.contact,
                car: req.body.rcar,
                type: req.body.rtype,
                description: req.body.rdesc,
                image: 'uploaded/'+image.name,
                date: today,
                status: 'Pending',
                price: -1,
                paid: 0,
                oustanding: -1,
                paiddate: 'N/A'
            }
        }
        else {
            var nrequest = {
                userid: req.session.user,
                username: req.session.name,
                contact: req.session.contact,
                car: req.body.rcar,
                type: req.body.rtype,
                description: req.body.rdesc,
                image: req.body.ogpic,
                date: today,
                status: 'Pending',
                price: -1,
                paid: 0,
                oustanding: -1,
                paiddate: 'N/A'
            }
        }

        db.updateOne(request, {_id: req.body.ogid}, 
            {userid: req.session.user,
            username: req.session.name,
            contact: req.session.contact,
            car: nrequest.car,
            type: nrequest.type,
            description: nrequest.description,
            image: nrequest.image,
            date: nrequest.date,
            status: 'Pending'
            }, (result) => {
            res.redirect('/uviewallpending');
        });
    },

    getUserAcceptedRequests: async function(req, res) {
        var requests = await request.find({userid: req.session.user, status: 'Accepted'});
        res.render('./onSession/uviewongoing', {req: requests, isHost: false, username: req.session.name}); 
    },

    getPendingRequests: async function(req, res) {
        var requests = await request.find({status: 'Pending'});
        res.render('./onSession/hpendingrequests', {req: requests, isHost: false, username: req.session.name});
    },

    viewRequest: async function(req, res) {
        db.findOne(request, {_id: req.query.reqid}, {}, async (result) => {
            if (result) {        
                var response = {
                    car: result.car,
                    type: result.type,
                    description: result.description,
                    client_username: result.username,
                    date: result.date,
                    status: result.status,
                    price: result.price,
                    isHost: true,
                    username: req.session.name
                };        
                res.render('./onSession/hviewrequest', response)
            }
            else {
                console.log("failed");
            }
        })     
    },

    sendQuotation: async function(req, res) {
        db.updateOne(request, {_id: req.body.reqid}, {price: req.body.price, outstanding: req.body.price}, (result) => {
            res.redirect('/hviewpending?reqid=' + req.body.reqid);
        });
    },

    addPaidBalance: async function(req, res) {
        var amountPaid = req.body.amount;
        db.updateOne(request, {_id: req.body.reqid}, {$inc: {paid: amountPaid, outstanding: (-1 * amountPaid)}}, (result) => {
            console.log(result);
            res.redirect('/hviewactive');
        });
    },

    settleRequest: async function(req, res) {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        today = yyyy+'-'+mm+'-'+dd;

        db.updateOne(request, {_id: req.body.reqid}, {status: 'Settled', paiddate: today}, (result) => {
            res.redirect('/hviewactive');
        });
    },

    // Might remove canSettle field if not needed in design
    viewActiveRequests: async function(req, res) {
        var requests = await request.find({status: 'Accepted'});

        requests.forEach(r => {
            if (r.outstanding == 0)
                r.canSettle = true;
        });

        res.render('./onSession/hactiverequests', {req: requests, isHost: false, username: req.session.name});
    },

    // Not done
    viewGenerateReport: async function(req, res) {
        // var request = await request.find();
        res.render('./onSession/hreport', {isHost: false, username: req.session.name});
    },

    generateReport: async function(req, res) {
        res.send("Nothing yet");
    },

    viewSuppliers: async function(req, res) {
        res.render('./onSession/hsuppliers', {isHost: false, username: req.session.name});
    },
}

module.exports = controller;