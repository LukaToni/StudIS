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

module.exports = router;