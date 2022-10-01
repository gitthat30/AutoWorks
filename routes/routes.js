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

app.get("/crequests", isPrivate, controller.getUserRequestCreation);
app.get("/vrequestsu", isPrivate, controller.getUserRequests);
app.get("/varequestsu", isPrivate, controller.getUserAcceptedRequests);

app.post("/submitrequest", isPrivate, controller.submitRequest);


app.get("/viewpending", isHost, controller.getPendingRequests);
app.get("/settletrans", isHost, controller.settleTransaction);
app.get("/viewtrans", isHost, controller.viewSettled);
app.post("/acceptreq", isHost, controller.acceptRequest);
app.post("/settle", isHost, controller.settleTransactionFinish);
app.get("/viewsuppliers", isHost, controller.viewSuppliers);

app.post("/sendmesage", isPublic, controller.sendMessage);



module.exports = app;