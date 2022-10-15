const { connect } = require('mongoose');
const { ObjectId } = require('mongodb');
const app = require('../routes/routes.js');
const db = require('../models/db.js');
const path = require('path');
const account = require('../models/Accounts.js');
const request = require('../models/Requests.js');
const { totalmem } = require('os');

const UserController = {
    getUser: async function(req, res) {
        console.log(req.session.name);
        res.render('./onSession/uhome', {isHost: false, username: req.session.name});
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

        console.log("msg")
        console.log(req.body.reqid)
        console.log("msg")

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
        console.log("requests")
        console.log(requests);
        res.render('./onSession/uviewpending', {req: requests, isHost: false, username: req.session.name});
    },

    renderUserRequest: async function(req, res) {
        db.findOne(request, {_id: req.query.reqid}, {}, (result) => {
            if (result) {
                var response = {
                    car: result.car,
                    image: result.image,
                    type: result.type,
                    description: result.description,
                    date: result.date,
                    status: result.status,
                    price: result.price,
                    isHost: false,
                    username: req.session.name,
                    _id: req.query.reqid,
                    messages: result.messages
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
        db.deleteOne(request, {_id: req.query.reqid}, (error) => {
            res.redirect("/uviewallpending");
        });
    },

    getEditRequest: function(req, res) {
        console.log("Here");
        console.log(req.query.reqid);
        db.findOne(request, {_id: req.query.reqid}, {}, (result) => {
            if (result) {
                res.render("./onSession/ueditrequest", {image: result.image, car: result.car, type: result.type, description: result.description, ogid:result._id, isHost: false, username: req.session.name});
            }
            else {
                console.log("not found")
            }
        });
    },

    getEditRequestAction: function(req, res) {
        useogpic = false;

        if(!req.files)
            useogpic = true;

        console.log("testogpic2")
        console.log(req.body.rcar)
        console.log("testogpic2")

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

            image.mv(path.resolve(__dirname,'../public/uploaded',image.name),(error) => {
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
            })
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
        }

        
    },

    getUserAcceptedRequests: async function(req, res) {
        var requests = await request.find({userid: req.session.user, status: 'Accepted'});
        res.render('./onSession/uviewongoing', {req: requests, isHost: false, username: req.session.name}); 
    },
}

module.exports = UserController;