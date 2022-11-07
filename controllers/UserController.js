const { connect } = require('mongoose');
const { ObjectId } = require('mongodb');
const imgur = require('imgur');
const cloudinary = require('../util/cloudinary')
const app = require('../routes/routes.js');
const db = require('../models/db.js');
const path = require('path');
const fs = require('fs');
const https = require('https');
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

        // If message sent is not attachment
        if(!req.files) {
            console.log('Sending message as plain text.');
            console.log(message);
            db.updateOne(request, {_id: req.body.reqid}, {$push: {messages: message}}, function() {
                if(req.session.host)
                    res.redirect(307, '/hviewpending'); // status code 307 redirects with original body data
                else
                    res.redirect(307, '/uviewpending');
            });
        }
        // If message sent is attachment
        else {
            console.log('Sending message as attachment.');
            var {file} = req.files;
            var filePath = path.resolve(__dirname,'../public/UPLOADED', file.name);

            console.log(filePath);

            file.mv(filePath, (error) => {
                console.log("File in filesystem");
                cloudinary.uploader.upload(filePath, {
                    resource_type: "raw",
                    use_filename: true
                }).then(function(file) {
                    console.log("Attachment available at: " + file.secure_url);
                    message.content = file.public_id;
                    message.url = file.secure_url;

                    console.log(message);
                    db.updateOne(request, {_id: req.body.reqid}, {$push: {messages: message}}, function() {
                        if(req.session.host)
                            res.redirect(307, '/hviewpending'); // status code 307 redirects with original body data
                        else
                            res.redirect(307, '/uviewpending');
                    });
                });
            });
        }
    },

    download: async function(req, res) {
        var request_id = req.body.request_id;
        var message_id = req.body.message_id;
        var foundReq = await request.findById(request_id);

        var message = {};

        foundReq.messages.forEach(m => {
            if(m._id == message_id)
                message = m;
        });
    
        var filePath = path.resolve(__dirname,'../public/UPLOADED', message.content);
    
        const file = fs.createWriteStream(filePath);
        https.get(message.url, function(response) {
            response.pipe(file);
            file.on("finish", () => {
                file.close();
                console.log(message.content + " in file system.");
                res.send({filename: message.content});
            });
        });
    },

    getUserRequestCreation: async function(req, res) {
        res.render('./onSession/ucreaterequest', {isHost: false, username: req.session.name});
    },

    submitRequest: async function(req, res) {
        //CCAPDEV thing to get the image dir
        const {image} = req.files;

        if(image.mimetype.startsWith('image')) {
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
                date: today,
                status: 'Pending',
                price: -1,
                paid: 0,
                oustanding: -1,
                paiddate: 'N/A'
            }

            var filePath = path.resolve(__dirname,'../public/UPLOADED', image.name);

            image.mv(filePath,(error) => {
                cloudinary.uploader.upload(filePath, { tags: 'basic_sample' })
                        .then(function (image) {
                            console.log(filePath);
                            console.log("** File Upload (Promise)");
                            console.log("* public_id for the uploaded image is generated by Cloudinary's service.");
                            console.log("* " + image.public_id);
                            console.log("* " + image.url);

                            nrequest.image_id = image.public_id;
                            nrequest.image = image.url; 
                            request.create(nrequest, (error,request) => {
                                res.redirect('/home');
                            })
                        })
                        .catch(function (err) {
                            console.log();
                            console.log("** File Upload (Promise)");
                            if (err) { console.warn(err); }
                    });
            })   
        }
        else {
            req.flash('error_msg', 'Only select image files.');
            res.redirect('/createreq');
        }
    },
    
    getUserRequests: async function(req, res) {
        var requests = await request.find({userid: req.session.user, status: 'Pending'});
        console.log("requests")
        console.log(requests);
        res.render('./onSession/uviewpending', {req: requests, isHost: false, username: req.session.name});
    },

    renderUserRequest: async function(req, res) {
        db.findOne(request, {_id: req.body.reqid}, {}, (result) => {
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
                    _id: req.body.reqid,
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
            else {
                req.flash('error_msg', 'This request has not yet been quoted.');
                res.redirect('/uviewallpending');
            }
        });
        
    },

    declineRequest: function(req, res) {
        db.deleteOne(request, {_id: req.query.reqid}, (error) => {
            res.redirect("/uviewallpending");
        });
    },

    getEditRequest: function(req, res) {
        console.log(req.body.reqid);
        db.findOne(request, {_id: req.body.reqid}, {}, (result) => {
            if (result) {
                res.render("./onSession/ueditrequest", {image: result.image, car: result.car, type: result.type, description: result.description, ogid:result._id, isHost: false, username: req.session.name});
            }
            else {
                console.log("not found")
            }
        });
    },

    getEditRequestAction: function(req, res) {
        var updatedReq = {
            car: req.body.rcar,
            type: req.body.rtype,
            description: req.body.rdesc,
        };

        // If no new image
        if(!req.files) {
            console.log("Updating with no new image");
            db.updateOne(request, {_id: req.body.ogid}, updatedReq, (result) => {
                res.redirect('/uviewallpending');
            });
        }
        // If have new image
        else {
            console.log('Updating with new image')
            const {image} = req.files;
            if(image.mimetype.startsWith('image')) {
                //Getting Date
                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth() + 1;
                var yyyy = today.getFullYear();
                today = yyyy+'-'+mm+'-'+dd;

                var filePath = path.resolve(__dirname,'../public/UPLOADED', image.name);

                image.mv(filePath,(error) => {
                    cloudinary.uploader.upload(filePath, { tags: 'basic_sample' })
                        .then(function (image) {
                            console.log("** File Upload (Promise)");
                            console.log("* public_id for the uploaded image is generated by Cloudinary's service.");
                            console.log("* " + image.public_id);
                            console.log("* " + image.url);

                            updatedReq.image_id = image.public_id;
                            updatedReq.image = image.url; 
                            
                            db.updateOne(request, {_id: req.body.ogid}, updatedReq, (result) => {
                                res.redirect('/uviewallpending');
                            });
                        })
                        .catch(function (err) {
                            console.log();
                            console.log("** File Upload (Promise)");
                            if (err) { console.warn(err); }
                    });
                })
            }
            else {
                req.flash('error_msg', 'Only select image files.');
                res.redirect('/ueditrequest?reqid=' + req.body.ogid);
            }
        }
        
    },

    getUserAcceptedRequests: async function(req, res) {
        var requests = await request.find({userid: req.session.user, status: 'Accepted'});
        res.render('./onSession/uviewongoing', {req: requests, isHost: false, username: req.session.name}); 
    },
}

module.exports = UserController;