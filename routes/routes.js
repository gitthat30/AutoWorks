// import module `express`
const express = require('express');
const app = express();
const { isPublic, isPrivate, isHost } = require('../middlewares/sessionCheck.js');

// import module `controller` from `../controllers/controller.js`
const controller = require('../controllers/controller.js');

app.get('/', isPublic, controller.getIndex);
app.get('/test', controller.getTest);
app.post('/registeruser', isPublic, controller.registerUser);
app.get('/login', isPublic, controller.getLogin);
app.post('/loginpost', isPublic, controller.loginUser);
app.get('/register', isPublic, controller.getRegister);

app.get('/home', isPrivate, controller.getUser);
app.get('/hhome', isHost, controller.getHost);
app.get('/logout', isPrivate, controller.logoutUser);
app.post("/sendmessage", isPrivate, controller.sendMessage);

// [CLIENT] Create Estimation Request
app.get("/createreq", isPrivate, controller.getUserRequestCreation);
app.post("/submitreq", isPrivate, controller.submitRequest);

// [CLIENT] Pending for Confirmation
app.get("/uviewallpending", isPrivate, controller.getUserRequests);
app.get("/uviewpending", isPrivate, controller.renderUserRequest);
app.get("/acceptreq", isPrivate, controller.acceptRequest);
app.get("/declinereq", isPrivate, controller.declineRequest);

// [CLIENT] Active Jobs
app.get("/uviewactive", isPrivate, controller.getUserAcceptedRequests);

// [HOST] Customer Estimation Requests
app.get("/hviewallpending", isHost, controller.getPendingRequests);
app.get("/hviewpending", isHost, controller.viewRequest);
app.post("/sendquotation", isHost, controller.sendQuotation);
app.post("/addpaidbalance", isHost, controller.addPaidBalance);
app.post("/settle", isHost, controller.settleRequest);

// [HOST] Active Jobs
app.get("/hviewactive", isHost, controller.viewActiveRequests);

// [HOST] Generate Report
app.get("/viewgeneratereport", isHost, controller.viewGenerateReport);
app.get("/generatereport", isHost, controller.generateReport);

// [HOST] View Suppliers' Contacts
app.get("/viewsuppliers", isHost, controller.viewSuppliers);


module.exports = app;