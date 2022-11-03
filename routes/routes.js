const express = require('express');
const app = express();
const { isPublic, isPrivate, isHost } = require('../middlewares/sessionCheck.js');

const PublicController = require('../controllers/PublicController.js');
const UserController = require('../controllers/UserController.js');
const HostController = require('../controllers/HostController.js');

app.get('/', isPublic, PublicController.getIndex);
app.post('/registeruser', isPublic, PublicController.registerUser);
app.get('/login', isPublic, PublicController.getLogin);
app.post('/loginpost', isPublic, PublicController.loginUser);
app.get('/register', isPublic, PublicController.getRegister);

app.get('/home', isPrivate, UserController.getUser);
app.get('/hhome', isHost, HostController.getHost);
app.get('/logout', isPrivate, UserController.logoutUser);
app.post("/sendmessage", isPrivate, UserController.sendMessage);

// [CLIENT] Create Estimation Request
app.get("/createreq", isPrivate, UserController.getUserRequestCreation);
app.post("/submitreq", isPrivate, UserController.submitRequest);

// [CLIENT] Pending for Confirmation
app.get("/uviewallpending", isPrivate, UserController.getUserRequests);
app.post("/uviewpending", isPrivate, UserController.renderUserRequest);
app.get("/acceptreq", isPrivate, UserController.acceptRequest);
app.get("/declinereq", isPrivate, UserController.declineRequest);
app.post("/ueditrequest", isPrivate, UserController.getEditRequest);
app.post("/ueditrequestconfirm", isPrivate, UserController.getEditRequestAction);

// [CLIENT] Active Jobs
app.get("/uviewactive", isPrivate, UserController.getUserAcceptedRequests);

// [HOST] Customer Estimation Requests
app.get("/hviewallpending", isHost, HostController.getPendingRequests);
app.post("/hviewpending", isHost, HostController.viewRequest);
app.post("/sendquotation", isHost, HostController.sendQuotation);
app.post("/addpaidbalance", isHost, HostController.addPaidBalance);
app.post("/settle", isHost, HostController.settleRequest);
app.get("/deletereq", isHost, HostController.hostDeleteRequest);

// [HOST] Active Jobs
app.get("/hviewactive", isHost, HostController.viewActiveRequests);

// [HOST] Generate Report
app.get("/viewgeneratereport", isHost, HostController.viewGenerateReport);
app.get("/generatereport", isHost, HostController.generateReport);

// [HOST] View Suppliers' Contacts
app.get("/viewsuppliers", isHost, HostController.viewSuppliers);
app.get("/viewsupplier", isHost, HostController.viewSupplier);


module.exports = app;