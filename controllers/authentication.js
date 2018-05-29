var express = require('express');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
const saltRounds = 10;

var db = require('../controllers/db');

var invalidLogins = [];
const timeToKeepIp = 30 * 1000;

function logFailedLogin(userIp) {
  console.log(userIp);
  if(invalidLogins[userIp] && invalidLogins[userIp].counter) {
    invalidLogins[userIp].counter = invalidLogins[userIp].counter + 1;
  } else {
    invalidLogins[userIp] = {
      'counter': 1,
      'date': new Date()
    }
  }
}

function authenticate(req, res, next) {
  if(req.session.authenticated && req.session.authenticated == true) {
    return next();
  }
  return res.redirect('/login');
}

function login(req, res, next) {
  userIp = req.connection.remoteAddress;
  if(invalidLogins[userIp]) {
    if(new Date().getTime() - invalidLogins[userIp].date.getTime() > timeToKeepIp) {
      invalidLogins[userIp] = undefined;
    } else {
      if(invalidLogins[userIp].counter >= 3) {
        return res.render('login' , { message: "Too many bad logins." });
      }
    }
  }
  
  if(!req.body.username) {
    logFailedLogin(userIp);
    return res.render('login' , { message: "Wrong username or password." });
  } 
	
  db.getUser({ email: req.body.username}, (err, user) => {
    if(err) {
      return res.render('login' , { message: "Napaka na strežniku." });
    }
    
    if(user && req.body.password && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.authenticated = true;
    req.session.id = user.id;
    req.session.student_id = user.student_id;
    req.session.professor_id = user.professor_id;
    req.session.clerk_id = user.clerk_id;
    req.session.email = user.email;
    req.session.type = user.type;
    res.redirect('/personal');
    } else {
      logFailedLogin(userIp);
      return res.render('login' , { message: "Wrong username or password."});
    }
  });
}

function forgot(req, res) {
  if(!req.body.email) {
    return res.render('forgot' , { message: "Vnesite vaš elektronski naslov."});
  }
  db.getUser({ email: req.body.email}, (err, user) => {
    if(err || !user) {
      return res.render('forgot' , { message: "Napaka na strežniku."});
    }

    generateToken( (err, token) => {
      
      if(err || !token) {
        return res.render('forgot' , { message: "Napaka na strežniku."});
      }
      user.resetToken = token;
      db.updateUser(user, (err) => {
        if(err) {
          return res.render('forgot' , { message: "Napaka na strežniku."});
        }
        
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
              return res.render('forgot' , { message: "Pošiljanje poziva na vaš naslavni biu uspešen."});
          }
          return res.render('login' , { message: "Poziv za nastavitev gesla je bil poslan na vaš naslov."});
        });
      });
    });
  });
}

function generateToken(callback) {
  crypto.randomBytes(20, function(err, buf) {
    var token = buf.toString('hex');
    callback(err, token);
  });
}

function reset(req, res) {
  db.getUser({ resetToken: req.params.token}, (err, user) => {
    if(err || !user) {
      return res.render('reset' , { message: "Napaka na strežniku."});
    }
    
    if(req.body.password != req.body.confirm) {
      return res.render('reset' , { message: "Vnešena gesla nista enaka."});
    }
    user.password = bcrypt.hashSync(req.body.password, saltRounds);
    user.resetToken = undefined;
    
    db.updateUser(user, (err) => {
      if(err) {
        return res.render('forgot' , { message: "Napaka na strežniku."});
      }
      return res.redirect('/login');
    });
  });
}

exports.authenticate = authenticate;
exports.login = login;
exports.forgot = forgot;
exports.reset = reset;