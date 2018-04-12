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
	
  db.getUser({ email: req.body.username}, (user) => {
    if(user && req.body.password && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.authenticated = true;
    req.session.id = user.id;
    req.session.email = user.email;
    req.session.type = user.type;
    res.redirect('/personal');
    } else {
      logFailedLogin(userIp);
      res.render('login' , { message: "Wrong username or password."});
    }
  });
}

function forgot(req, res) {
  if(req.body.email) {
    db.getUser({ email: req.body.email}, (user) => {
      if(user) {
        generateToken( (token) => {
          if(token) {
            user.resetToken = token;
            db.updateUser(user, () => {
              var smtpTransport = nodemailer.createTransport('smtps://studis.tpo.2018%40gmail.com:secretpass1@smtp.gmail.com');
              var mailOptions = {
                to: user.email,
                from: 'studis.tpo.2018@gmail.com',
                subject: 'TPO Studis Ponastavitev Gesla',
                text: 'To pošto ste prejeli ker ste zahtevali ponovno nastavitev gesla (vi ali kdo drug).\n\n' +
                  'Prosim kliknite na naslednjo povezavo da si nastavite novo geslo:\n\n' +
                  'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                  'Če tega niste zahtevali to sporočilo spreglejte.\n'
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
  db.getUser({ resetToken: req.params.token}, (user) => {
    if(!user || req.body.password != req.body.confirm) {
      res.redirect('/');
    } else {
      user.password = bcrypt.hashSync(req.body.password, saltRounds);
      user.resetToken = undefined;
      
      db.updateUser(user, () => {
        res.redirect('/');
      })
    }
  })
}

exports.authenticate = authenticate;
exports.login = login;
exports.forgot = forgot;
exports.reset = reset;