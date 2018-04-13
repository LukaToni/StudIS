var express = require('express');
var router = express.Router();

var auth = require('../controllers/authentication');

router.get('/', auth.authenticate, function(req, res, next) {
  return res.render('index', { title: 'Welcome: ' + req.session.type + ' ' + req.session.email });
});

module.exports = router;
