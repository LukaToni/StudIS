var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
const saltRounds = 10;

var auth = require('../controllers/authentication');
var db = require('../controllers/db');

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.post('/login', function(req, res, next) {
  if(!req.body.username) res.render('login' , { message: "Wrong username or password." });
	
  var user = db.getUser(req.body.username);
  if(user && req.body.password && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.authenticated = true;
	req.session.userId = user.id;
	req.session.type = user.type;
	req.session.username = user.username;
    res.redirect('/');
  } else {
    res.render('login' , { message: "Wrong username or password."});
  }
});

router.get('/logout', function(req, res, next) {
  if(req.session) {
    req.session.destroy();
  }
  res.redirect('/login');
})

module.exports = router;