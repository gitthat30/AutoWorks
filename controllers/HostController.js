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
        res.render('./onSession/hpendingrequests', {req: requests, isHost: false, username: req.session.name});
    },

    viewRequest: async function(req, res) {
        db.findOne(request, {_id: req.query.reqid}, {}, async (result) => {
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
                    _id: req.query.reqid,
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

        res.render('./onSession/hactiverequests', {req: requests, isHost: true, username: req.session.name});
    },

    viewGenerateReport: async function(req, res) {
        res.render('./onSession/hreport', {isHost: true, username: req.session.name});
    },

    generateReport: async function(req, res) {

        var requests = await request.find();
        year = parseInt(req.query.date.substring(0,4));
        month = parseInt(req.query.date.substring(5,7));
        total = 0;
        total2 = 0;
        num = 0;

        requests.forEach(r => {
            tempdate = new Date(r.date);
            if(tempdate.getFullYear() <= year && tempdate.getMonth() <= month)  {
                if(r.status == 'Settled')
                    total += r.price;
                    
                total2 += r.paid;
                num++;


            }
            
        })
        
        res.render('./onSession/hviewreport', {date: req.query.date, num: num, total: total, total2: total2, isHost: true, username: req.session.name});
    },

    viewSuppliers: async function(req, res) {
        res.render('./onSession/hsuppliers', {isHost: true, username: req.session.name});
    },

    hostDeleteRequest: async function(req, res) {
        db.deleteOne(request, {_id: req.query.reqid}, (error) => {
            res.redirect("/hviewallpending");
        });
    },
}

module.exports = HostController;