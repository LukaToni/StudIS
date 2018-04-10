var express = require('express');
var router = express.Router();

var auth = require('../controllers/authentication');

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.post('/login', auth.login);

router.get('/logout', function(req, res, next) {
  if(req.session) {
    req.session.destroy();
  }
  res.redirect('/login');
})

router.get('/forgot', function(req, res, next) {
  res.render('forgot');
});

router.post('/forgot', auth.forgot);

router.get('/reset/:token', function(req, res, next) {
  res.render('reset');
});

router.post('/reset/:token', auth.reset);


module.exports = router;