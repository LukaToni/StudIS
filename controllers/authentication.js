var express = require('express');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
const saltRounds = 10;

var db = require('../controllers/db');

var invalidLogins = [];

function logFailedLogin(userIp) {
  if(invalidLogins[userIp]) {
    invalidLogins[userIp] = invalidLogins[userIp] + 1;
  } else {
    invalidLogins[userIp] = 1;
  }
}

function authenticate(req, res, next) {
  if(req.session.authenticated && req.session.authenticated == true) {
    next();
  } else {
    res.redirect('/login');
  }
}

function login(req, res, next) {
  userIp = req.connection.remoteAddress;
  if(invalidLogins[userIp] && invalidLogins[userIp] >= 3) {
    res.render('login' , { message: "Too many bad logins." });
	return;
  }
  
  if(!req.body.username) {
    logFailedLogin(userIp);
    res.render('login' , { message: "Wrong username or password." });
  } 
	
  db.getStudent({ email: req.body.username}, (student) => {
    if(student && req.body.password && bcrypt.compareSync(req.body.password, student.password)) {
    req.session.authenticated = true;
    req.session.registrationNumber = student.registrationNumber;
    req.session.email = student.email;
    res.redirect('/');
    } else {
      logFailedLogin(userIp);
      res.render('login' , { message: "Wrong username or password."});
    }
  });
}

function forgot(req, res) {
  if(req.body.email) {
    db.getStudent({ email: req.body.email}, (student) => {
      if(student) {
        generateToken( (token) => {
          if(token) {
            student.resetToken = token;
            db.updateUser(student, () => {
              var smtpTransport = nodemailer.createTransport('smtps://studis.tpo.2018%40gmail.com:secretpass1@smtp.gmail.com');
              var mailOptions = {
                to: student.email,
                from: 'studis.tpo.2018@gmail.com',
                subject: 'TPO Studis Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                  'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                  'If you did not request this, please ignore this email and your password will remain unchanged.\n'
              };
              smtpTransport.sendMail(mailOptions, function(err) {
                if(err) {
                    console.log(err);
                } else {
                    console.log('Pass reset email sent.');
                }
                res.redirect('/');
              });
            })
          } else {
            res.redirect('/forgot');
          }
        });
      } else {
        res.redirect('/forgot');
      }
    });
  } else {
    res.redirect('/forgot');
  }
}

function generateToken(callback) {
  crypto.randomBytes(20, function(err, buf) {
    var token = buf.toString('hex');
    callback(token);
  });
}

function reset(req, res) {
  db.getStudent({ resetToken: req.params.token}, (student) => {
    if(!student || req.body.password != req.body.confirm) {
      res.redirect('/');
    } else {
      student.password = bcrypt.hashSync(req.body.password, saltRounds);
      student.resetToken = undefined;
      
      db.updateUser(student, () => {
        res.redirect('/');
      })
    }
  })
}

exports.authenticate = authenticate;
exports.login = login;
exports.forgot = forgot;
exports.reset = reset;