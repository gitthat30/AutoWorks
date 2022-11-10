const { connect } = require('mongoose');
const { ObjectId } = require('mongodb');
const app = require('../routes/routes.js');
const db = require('../models/db.js');
const path = require('path');
const account = require('../models/Accounts.js');
const request = require('../models/Requests.js');
const { totalmem } = require('os');

const HostController = {
    getHost: async function(req, res) {
        console.log(req.session.name);
        res.render('./onSession/hhome', {isHost: true, username: req.session.name});
    },

    getPendingRequests: async function(req, res) {
        var requests = await request.find({status: 'Pending'});
        res.render('./onSession/hpendingrequests', {req: requests, isHost: true, username: req.session.name});
    },

    viewRequest: async function(req, res) {
        if(!req.body.reqid)
            console.log("ASFIONASOFN")

        db.findOne(request, {_id: req.body.reqid}, {}, async (result) => {
            if (result) {        
                var response = {
                    car: result.car,
                    type: result.type,
                    image: result.image,
                    image_id: result.image_id,
                    description: result.description,
                    client_username: result.username,
                    contact: result.contact,
                    date: result.date,
                    status: result.status,
                    price: result.price,
                    isHost: true,
                    username: req.session.name,
                    _id: req.body.reqid,
                    messages: result.messages
                };        
                res.render('./onSession/hviewrequest', response) 
            }
            else {
                console.log("failed");
            }
        })     
    },

    sendQuotation: async function(req, res) {
        console.log(req.body.reqid)
        db.updateOne(request, {_id: req.body.reqid}, {price: req.body.price, outstanding: req.body.price}, (result) => {
            db.findOne(request, {_id: req.body.reqid}, {}, async (result) => {
                if (result) {        
                    var response = {
                        car: result.car,
                        type: result.type,
                        image: result.image,
                        description: result.description,
                        client_username: result.username,
                        contact: result.contact,
                        date: result.date,
                        status: result.status,
                        price: result.price,
                        isHost: true,
                        username: req.session.name,
                        _id: req.body.reqid,
                        messages: result.messages
                    };        
                    res.render('./onSession/hviewrequest', response) 
                }
                else {
                    console.log("failed");
                }
            })  
        });
    },

    addPaidBalance: async function(req, res) {
        var amountPaid = req.body.amount;
        db.updateOne(request, {_id: req.body.reqid}, {$inc: {paid: amountPaid, outstanding: (-1 * amountPaid)}}, (result) => {
            db.findOne(request, {_id: req.body.reqid}, {}, async (result) => {
                console.log("test")
                console.log(result)
                console.log("test")
                if(result.outstanding == 0) {
                    console.log("test2")
                    db.updateOne(request, {_id: req.body.reqid}, {status: 'Settled'}, (result) => {
                        res.redirect('/hviewactive')
                    })  
                }
                else
                    res.redirect('/hviewactive');
            }) 
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
        res.render('./onSession/hactiverequests', {req: requests, isHost: true, username: req.session.name});
    },

    viewGenerateReport: async function(req, res) {
        var today = new Date();
        var yyyy = today.getFullYear();
        var mm = today.getMonth() + 1;
        res.render('./onSession/hreport', {date: yyyy+'-'+mm,isHost: true, username: req.session.name});
    },

    generateReport: async function(req, res) {
        var requests = await request.find();
        var year = parseInt(req.query.date.substring(0,4));
        var month = parseInt(req.query.date.substring(5,7));
        var revenue = 0;
        var outstanding = 0;
        var total = 0;
        var settled = 0;

        console.log("Requested date: " + year + "/" + month)

        requests.forEach(r => {
            tempdate = new Date(r.date); // month is 0 indexed using getMonth()
            if(tempdate.getFullYear() == year && tempdate.getMonth() + 1 == month) {
                if(r.status == 'Accepted' || r.status == 'Settled') {
                    revenue += r.paid;
                    total += r.price;
                    if(r.status == 'Accepted')
                        outstanding += r.outstanding;
                    if(r.status == 'Settled')
                        settled += 1;
                }
            }
        })
        res.render('./onSession/hviewreport', {total, settled, date: req.query.date, outstanding, revenue, isHost: true, username: req.session.name});
    },

    viewSuppliers: async function(req, res) {
        res.render('./onSession/hsuppliers', {isHost: true, username: req.session.name});
    },

    viewSupplier: function(req, res) {
        res.render('./onSession/hsuppliers', {name: req.query.sname, number: req.query.snumber, address: req.query.saddress, isHost: true, username: req.session.name});
    },

    hostDeleteRequest: async function(req, res) {
        db.deleteOne(request, {_id: req.query.reqid}, (error) => {
            res.redirect("/hviewallpending");
        });
    },
}

module.exports = HostController;