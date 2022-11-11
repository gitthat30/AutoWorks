const { connect } = require('mongoose');
const { ObjectId, GridFSBucketReadStream } = require('mongodb');
const imgur = require('imgur');
const cloudinary = require('../util/cloudinary')
const app = require('../routes/routes.js');
const db = require('../models/db.js');
const path = require('path');
const fs = require('fs');
const http = require('http');
const account = require('../models/Accounts.js');
const request = require('../models/Requests.js');
const { totalmem } = require('os');

const UserController = {
    getUser: async function(req, res) {
        console.log(req.session.name);
        notifcount = 0
        if(req.session.host)
            res.redirect('/hhome')
        else {
            db.findOne(account, {_id: req.session.user}, {}, function(result) {
                console.log(typeof result.notifications)
                result.notifications.forEach(n => {
                    if(!n.read)
                        notifcount++;
                })
                res.render('./onSession/uhome', {isHost: false, username: req.session.name, notifcount});
            })
        }
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
            db.updateOne(request, {_id: req.body.reqid}, {$push: {messages: message}}, function(result) {
                //Start of Notification Code
                db.findOne(request, {_id: req.body.reqid}, {}, function(result) { //Find the request in DB to get vars
                    var notification = { //Create notification for a sent message
                        message: "You recieved a message from \"" + req.session.name +"\" on order \"" + result.description +"\"",
                        read: false,
                        sentdate: today,
                        reqid: result._id    
                    }
                    
                    if(req.session.user != result.userid) { //If someone other than user messages, push it into the notifications array of user
                        db.updateOne(account, {_id: result.userid}, {$push: {notifications: notification}}, function(result) {
                            console.log(result)
                            if(req.session.host)
                                res.redirect(307, '/hviewpending'); // status code 307 redirects with original body data
                            else
                                res.redirect(307, '/uviewpending');
                        });
                    }
                    else { //If the user places a message on his own request, notify HOST
                        console.log("NOTIFYING HOST")
                        db.updateOne(account, {username: "HOST"}, {$push: {notifications: notification}}, function(result) {
                            console.log(result)
                            if(req.session.host)
                                res.redirect(307, '/hviewpending'); // status code 307 redirects with original body data
                            else
                                res.redirect(307, '/uviewpending');
                        });
                    }
                });
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
                    message.url = file.url;

                    console.log(message);
                    db.updateOne(request, {_id: req.body.reqid}, {$push: {messages: message}}, function() {
                        db.findOne(request, {_id: req.body.reqid}, {}, function(result) {
                            var notification = {
                                message: "You recieved a message on your order \"" + result.description +"\"",
                                read: false,
                                sentdate: today,
                                reqid: result._id    
                            }
                            if(req.session.user != result.userid) { //If someone other than user messages
                                db.updateOne(account, {_id: result.userid}, {$push: {notifications: notification}}, function(result) {
                                    console.log(result)
                                    if(req.session.host)
                                        res.redirect(307, '/hviewpending'); // status code 307 redirects with original body data
                                    else
                                        res.redirect(307, '/uviewpending');
                                });
                            }
                            else { //If the user places a message on his own request, notify HOST
                                db.updateOne(account, {username: "HOST"}, {$push: {notifications: notification}}, function(result) {
                                    console.log(result)
                                    if(req.session.host)
                                        res.redirect(307, '/hviewpending'); // status code 307 redirects with original body data
                                    else
                                        res.redirect(307, '/uviewpending');
                                });
                            }
                        });
                    });
                });
            });
        }
    },

    download: async function(req, res) {
        var img_url = req.body.img_url;
        var img_name = req.body.img_name;
        var filePath = path.resolve(__dirname,'../public/UPLOADED', img_name);

        console.log(req.body);
    
        const file = fs.createWriteStream(filePath);
        http.get(img_url, function(response) {
            response.pipe(file);
            file.on("finish", () => {
                file.close();
                console.log(img_name + " in file system.");
                res.send({filename: img_name});
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
                cloudinary.uploader.upload(filePath, {
                    tags: 'basic_sample',
                    resource_type: "raw",
                    use_filename: true
                }).then(function (image) {
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
        res.render('./onSession/uviewpending', {req: requests.reverse(), isHost: false, username: req.session.name});
    },

    renderUserRequest: async function(req, res) {
        db.findOne(request, {_id: req.body.reqid}, {}, (result) => {
            if (result) {
                var response = {
                    car: result.car,
                    image: result.image,
                    image_id: result.image_id,
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
        //Getting Date
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        today = yyyy+'-'+mm+'-'+dd;
        
        db.updateOne(request, {_id: req.query.reqid}, {status: "Deleted"}, (error) => {
            console.log(req.query.reqid)
            db.findOne(request, {_id: req.query.reqid}, {}, function(result) { //Find the request in DB to get vars
                console.log(result)
                var notification = { //Create notification for a sent message
                    message: "User \"" + req.session.name + "\" declined order \"" + result.description + "\"",
                    read: false,
                    sentdate: today,
                    reqid: result._id    
                }
                
                if(req.session.user != result.userid) { //If someone other than user declines, push it into the notifications array of user
                    db.updateOne(account, {_id: result.userid}, {$push: {notifications: notification}}, function(result) {
                        console.log(result)
                        res.redirect("/uviewallpending");
                    });
                }
                else { //If the user declines his own request, notify HOST
                    console.log("NOTIFYING HOST")
                    db.updateOne(account, {username: "HOST"}, {$push: {notifications: notification}}, function(result) {
                        console.log(result)
                        res.redirect("/uviewallpending");
                    });
                }
            });
            
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

    viewNotifications: async function(req, res) {
        db.findOne(account, {_id: req.session.user}, {}, function(result) {
            read = [];
            unread = [];
            result.notifications.forEach(n => {
                if(!n.read)
                    read.push(n)
                else
                    unread.push(n)
            })
            db.updateOne(account, {_id: req.session.user}, {$set: {"notifications.$[].read": true}}, (result) => { //Sets all notifications as read
                res.render('./onSession/unotifications', {isHost: false, username: req.session.name, read: read.reverse(), unread: unread.reverse()});
            })
            
        })
    },
}

module.exports = UserController;