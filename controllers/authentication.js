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
	
  var user = db.getUser(req.body.username);
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
}

exports.authenticate = authenticate;
exports.login = login;