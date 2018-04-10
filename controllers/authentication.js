var express = require('express');
var bcrypt = require('bcrypt');
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
	
  db.getUserByUsername(req.body.username, (user) => {
    if(user && req.body.password && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.authenticated = true;
    req.session.userId = user.id;
    req.session.type = user.type;
    req.session.username = user.username;
    res.redirect('/');
    } else {
      logFailedLogin(userIp);
      res.render('login' , { message: "Wrong username or password."});
    }
  });
}

function forgot(req, res) {
  if(req.body.email) {
    db.getUserByEmail(req.body.email, (user) => {
      if(user) {
        generateToken( (token) => {
          if(token) {
            user.resetToken = token;
            db.updateUser(user, () => {
              var smtpTransport = nodemailer.createTransport('SMTP', {
                service: 'Gmail',
                auth: {
                  user: 'studis.tpo.2018',
                  pass: 'secretpass1'
                }
              });
              var mailOptions = {
                to: user.email,
                from: 'passwordreset@demo.com',
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                  'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                  'If you did not request this, please ignore this email and your password will remain unchanged.\n'
              };
              smtpTransport.sendMail(mailOptions, function(err) {
                redirect('/');
              });
            })
          } else {
            res.redirect('forgot');
          }
        });
      } else {
        res.redirect('forgot');
      }
    });
  }
  res.redirect('login');
}

function generateToken(callback) {
  crypto.randomBytes(20, function(err, buf) {
    var token = buf.toString('hex');
    callback(token);
  });
}

exports.authenticate = authenticate;
exports.login = login;
exports.forgot = forgot;