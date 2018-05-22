var express = require('express');
var router = express.Router();

var auth = require('../controllers/authentication');

var db = require('../controllers/db');

router.get('/', auth.authenticate, function(req, res, next) {
  return res.render('st_vpisanih',{ type: req.session.type });
});

module.exports = router;