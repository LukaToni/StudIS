var express = require('express');

function authenticate(req, res, next) {
  if(req.session.authenticated && req.session.authenticated == true) {
    next();
  } else {
    res.redirect('/login');
  }
}

module.exports = authenticate;