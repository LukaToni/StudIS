var express = require('express');
var router = express.Router();

var auth = require('../controllers/authentication');

router.get('/', auth.authenticate, function(req, res, next) {
  res.render('index', { title: 'Welcome: ' + req.session.type + ' ' + req.session.username });
});

module.exports = router;
