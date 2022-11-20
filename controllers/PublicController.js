const { connect } = require('mongoose');
const { ObjectId } = require('mongodb');
const app = require('../routes/routes.js');
const db = require('../models/db.js');
const path = require('path');
const account = require('../models/Accounts.js');
const request = require('../models/Requests.js');
const { totalmem } = require('os');
const { localsAsTemplateData } = require('hbs');

const PublicController = {
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

    loginUser: async function(req, res) {
        var user = req.body.name;
        var pass = req.body.pass;
        
        db.findOne(account, {username: user}, {}, (result) => {
            if (result) {
                console.log(result);
                if(result.password == pass) {
                    req.session.user = result._id;
                    req.session.name = result.username;
                    req.session.fname = result.fname;
                    req.session.lname = result.lname;
                    req.session.host = result.host;
                    req.session.contact = result.contact;
                    console.log(req.session);

                    if(result.host)
                        res.redirect('/hhome');
                    else 
                        res.redirect('/home');
                }
                else {
                    req.flash('error_msg', 'Incorrect password.');   
                    res.redirect('/login');
                }
            }
            else {
                req.flash('error_msg', 'This user does not exist. Please register.');
                res.redirect('/login');
            }
        })        
    },

    registerUser: async function(req, res) {
        newaccount = {
            fname: req.body.fname.trim(),
            lname: req.body.lname.trim(),
            user: req.body.name.trim(),
            pass: req.body.pass.trim(),
            con: req.body.contact.trim(),
            email: req.body.email.trim()
        }
        console.log(req.body)
        db.findOne(account, { $or: [{username: newaccount.user}, {contact: newaccount.con}, {email: newaccount.email}]}, {}, (result) => {
            if (result) {
                console.log(result);
                if (result.username == newaccount.user)
                    req.flash('error_msg', 'User already exists. Please login.');
                else if (result.contact == newaccount.con)
                    req.flash('error_msg', 'This contact number is already registered.');
                else if (result.email == newaccount.email)
                    req.flash('error_msg', 'This email is already registered.');
                res.redirect('/register');
            }
            else {
                console.log("RENDER")
                res.render('register1', newaccount);
            }
        })  
    },

    getQuestion1: async function(req, res) {
        var newaccount = {
            fname: req.body.fname,
            lname: req.body.lname,
            user: req.body.user,
            pass: req.body.pass,
            con: req.body.con,
            email: req.body.email
        }

        console.log(req.body.question)
        console.log(newaccount)

        
        var questions = []
        count = 0;
        req.body.question.forEach(element => {
            
            var temp = {
                question: String,
                answer: String,
                pos: Number
            }
            temp.question = element;
            temp.pos = count;
            questions.push(temp)
            count++;
        });
        newaccount.questions = questions
        res.render('question1', newaccount);
    },

    getQuestion2: async function(req, res) {
        //Assign answer to first question, then render the next question
        assign = 0;

        var newaccount = {
            fname: req.body.fname,
            lname: req.body.lname,
            user: req.body.user,
            pass: req.body.pass,
            con: req.body.con,
            email: req.body.email
        }

        questions = []
        
        count = 0;
        req.body.questions.forEach(element => {
            
            var temp = {
                question: String,
                answer: String,
                pos: Number
            }
            temp.question = element;
            temp.pos = count;
            if(temp.pos == assign)
                temp.answer = req.body.answer
            questions.push(temp)
            count++;
        });
        count = 0;

        newaccount.questions = questions
        console.log(assign)
        console.log(newaccount)
        res.render('question2', newaccount);
    },

    getQuestion3: async function(req, res) {
       //Assign answer to second question, then render the next question
        assign = 1;
        console.log(assign)
        console.log(req.body.answers)
        newaccount = {
            fname: req.body.fname,
            lname: req.body.lname,
            user: req.body.user,
            pass: req.body.pass,
            con: req.body.con,
            email: req.body.email
        }

        questions = []
        
        count = 0;
        req.body.questions.forEach(element => {
            
            var temp = {
                question: String,
                answer: String,
                pos: Number
            }
            temp.question = element;
            temp.pos = count;
            if(temp.pos == assign)
                temp.answer = req.body.answer
            questions.push(temp)
            count++;
        });
        count = 0;
        req.body.answers.forEach(element => {
            if(count != assign)
                questions[count].answer = element;
            count++;
        });
        newaccount.questions = questions
        console.log(newaccount)
        res.render('question3', newaccount);
    },

    checkforQuestion4: async function(req, res) {
        //Assign answer to third question, then render the next question (if there is one)
         assign = 2;
         newaccount = {
            fname: req.body.fname,
            lname: req.body.lname,
            username: req.body.user,
            password: req.body.pass,
            contact: req.body.con,
            email: req.body.email
         }
 
         questions = []
         
         count = 0;
         req.body.questions.forEach(element => {
             
             var temp = {
                 question: String,
                 answer: String,
                 pos: Number
             }
             temp.question = element;
             temp.pos = count;
             if(temp.pos == assign)
                 temp.answer = req.body.answer
             questions.push(temp)
             count++;
         });
         count = 0;
         req.body.answers.forEach(element => {
             if(count != assign)
                 questions[count].answer = element;
             count++;
         });
         newaccount.questions = questions
         console.log("Testinagina")
         console.log(newaccount)
         if(req.body.question3flag)
            res.render('question4', newaccount);
         else {
            create = await account.create(newaccount);
            
            var user = newaccount.username;
            var pass = newaccount.password;

            console.log(user);
            
            db.findOne(account, {username: user}, {}, (result) => {
                if (result) {
                    console.log(result);
                    if(result.password == pass) {
                        req.session.user = result._id;
                        req.session.name = result.username;
                        req.session.fname = result.fname;
                        req.session.lname = result.lname;
                        req.session.host = result.host;
                        req.session.contact = result.contact;
                        console.log(req.session);

                        if(result.host)
                            res.redirect('/hhome');
                        else 
                            res.redirect('/home');
                    }
                    else {
                        req.flash('error_msg', 'Incorrect password.');   
                        res.redirect('/login');
                    }
                }
                else {
                    req.flash('error_msg', 'This user does not exist. Please register.');
                    res.redirect('/login');
                }
            })  
         }
     },

     registerUser2: async function(req, res) {
        //Assign answer to third question, then render the next question (if there is one)
        assign = 3;
        console.log(assign)
        newaccount = {
           fname: req.body.fname,
           lname: req.body.lname,
           username: req.body.user,
           password: req.body.pass,
           contact: req.body.con,
           email: req.body.email
        }

        questions = []
        
        count = 0;
        req.body.questions.forEach(element => {
            
            var temp = {
                question: String,
                answer: String,
                pos: Number
            }
            temp.question = element;
            temp.pos = count;
            if(temp.pos == assign)
                temp.answer = req.body.answer
            questions.push(temp)
            count++;
        });
        count = 0;
        req.body.answers.forEach(element => {
            if(count != assign)
                questions[count].answer = element;
            count++;
        });
        newaccount.questions = questions
        console.log("Testinagina")
        console.log(newaccount)  
        create = await account.create(newaccount);
        
        console.log(create);

        var user = newaccount.username;
        var pass = newaccount.password;

        console.log(user);
        
        db.findOne(account, {username: user}, {}, (result) => {
            if (result) {
                console.log(result);
                if(result.password == pass) {
                    req.session.user = result._id;
                    req.session.name = result.username;
                    req.session.fname = result.fname;
                    req.session.lname = result.lname;
                    req.session.host = result.host;
                    req.session.contact = result.contact;
                    console.log(req.session);

                    if(result.host)
                        res.redirect('/hhome');
                    else 
                        res.redirect('/home');
                }
                else {
                    req.flash('error_msg', 'Incorrect password.');   
                    res.redirect('/login');
                }
            }
            else {
                req.flash('error_msg', 'This user does not exist. Please register.');
                res.redirect('/login');
            }
        })
    },
    /* 
    registerUser2: async function(req, res) {
        //Assign answer to third question, then render the next question (if there is one)
         assign = 2;
         console.log("Testinagina")
         console.log(assign)
         newaccount = {
            username: req.body.user,
            password: req.body.pass,
            contact: req.body.con,
            email: req.body.email
         }
 
         questions = []
         
         count = 0;
         req.body.questions.forEach(element => {
             
             var temp = {
                 question: String,
                 answer: String,
                 pos: Number
             }
             temp.question = element;
             temp.pos = count;
             if(temp.pos == assign)
                 temp.answer = req.body.answer
             questions.push(temp)
             count++;
         });
         count = 0;
         req.body.answers.forEach(element => {
             if(count != assign)
                 questions[count].answer = element;
             count++;
         });
         newaccount.questions = questions
         console.log("Testinagina")
         console.log(newaccount)       
    },*/

    getLogin: async function(req, res) {
        res.render('login');
    },

    getRegister: async function(req, res) {
        res.render('register');
    },

    forgotPassword: async function(req, res) {
        res.render('forgotpass');
    },

    chooseRecovery: async function(req, res) {
        db.findOne(account, { $or: [{username: req.body.user}, {email: req.body.user}]}, {}, (result) => {
            console.log(result)
            if (!result) {
                req.flash('error_msg2', 'Please enter a valid username or email!');
                res.redirect('/forgot')
            }
            else {
                res.render('chooserecovery', {userid: result._id})
            }
        });
    },

    getAnswer1: async function(req, res) {
        //Answer question 1
        db.findOne(account, {_id: req.body.userid}, {}, (result) => {
            console.log(result) //No need to check with an if statement cus this is inaccessible without having a valid user (I THINK)
            
            res.render('answer1', result)
        });
    },

    getAnswer2: async function(req, res) {
        //Check Question 1 -> Add Boolean if Correct -> Render Question 2 Regardless
        assign = 0;
        
        if(req.body.answers[assign] == req.body.answer)
            correct = true
        else
            correct = false

        corrects = []
        questions = []

        count = 0;
        req.body.questions.forEach(element => {
            var temp = {
                question: String,
                answer: String,
                correct: Boolean
            }
            temp.question = element;
            questions.push(temp)
            count++;
        });
        
        count = 0;
        req.body.answers.forEach(element => {
            questions[count].answer = element;
            count++;
        });
        
        //No corrects to count yet (First Correct)
        questions[assign].correct = correct;

        vars = {
            userid: req.body.userid,
            questions: questions
        }

        console.log(vars)
        res.render('answer2', vars)
    },

    getAnswer3: async function(req, res) {
        //Check Question 2 -> Add Boolean if Correct -> Render Question 3 Regardless
        assign = 1;
        if(req.body.answers[assign] == req.body.answer)
            correct = true
        else
            correct = false

        corrects = []
        questions = []

        count = 0;
        req.body.questions.forEach(element => {
            var temp = {
                question: String,
                answer: String,
                correct: Boolean
            }
            temp.question = element;
            questions.push(temp)
            count++;
        });
        
        count = 0;
        req.body.answers.forEach(element => {
            questions[count].answer = element;
            count++;
        });
        
        //Count Corrects
        count = 0;
        req.body.corrects.forEach(element => {
            questions[count].correct = element;
            count++;
        });
        questions[assign].correct = correct;

        vars = {
            userid: req.body.userid,
            questions: questions
        }

        console.log(vars)
        res.render('answer3', vars)
    },

    getAnswer4: async function(req, res) {
        //Check Question 3 -> Add Boolean if Correct -> if theres a question 4 -> render else? give pass
        assign = 2;
        if(req.body.answers[assign] == req.body.answer)
            correct = true
        else
            correct = false

        corrects = []
        questions = []

        count = 0;
        req.body.questions.forEach(element => {
            var temp = {
                question: String,
                answer: String,
                correct: Boolean
            }
            temp.question = element;
            questions.push(temp)
            count++;
        });
        
        count = 0;
        req.body.answers.forEach(element => {
            questions[count].answer = element;
            count++;
        });
        
        //Count Corrects
        count = 0;
        req.body.corrects.forEach(element => {
            questions[count].correct = element;
            count++;
        });
        questions[assign].correct = correct;

        vars = {
            userid: req.body.userid,
            questions: questions
        }

        console.log("3")
        console.log(vars)
        if(vars.questions[3])
            res.render('answer4', vars);
        else {
            passed = true;
            vars.questions.forEach(element => {
                if(!element.correct)
                    passed = false;
            });
            if(passed) {
                db.findOne(account, {_id: req.body.userid}, {}, (result) => {
                    result.passed = passed;
                    
                    res.render('passworddisplay', result)
                })    
            }
            else
                res.render('passworddisplay', passed)
        }
    },

    finishAnswer4: async function(req, res) {
        //Check Question 2 -> Add Boolean if Correct -> Render Question 3 Regardless
        assign = 3;
        if(req.body.answers[assign] == req.body.answer)
            correct = true
        else
            correct = false

        corrects = []
        questions = []

        count = 0;
        req.body.questions.forEach(element => {
            var temp = {
                question: String,
                answer: String,
                correct: Boolean
            }
            temp.question = element;
            questions.push(temp)
            count++;
        });
        
        count = 0;
        req.body.answers.forEach(element => {
            questions[count].answer = element;
            count++;
        });
        
        //Count Corrects
        count = 0;
        req.body.corrects.forEach(element => {
            questions[count].correct = element;
            count++;
        });
        questions[assign].correct = correct;

        vars = {
            userid: req.body.userid,
            questions: questions
        }

        
        passed = true;
        vars.questions.forEach(element => {
            if(!element.correct)
                passed = false;
        });
        if(passed) {
            db.findOne(account, {_id: req.body.userid}, {}, (result) => {
                result.passed = passed;
                
                res.render('passworddisplay', result)
            })    
        }
        else
            res.render('passworddisplay', passed)
    },
}

module.exports = PublicController;