var express = require('express');
var router = express.Router();

var auth = require('../controllers/authentication');

/* GET personal data. */
router.get('/', auth.authenticate, function(req, res, next) {
  res.render('personal_data', { title: 'Welcome: ' + req.session.type + ' ' + req.session.username });
});


module.exports = router;
