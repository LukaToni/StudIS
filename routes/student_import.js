var express = require('express');
var router = express.Router();

//var auth = require('../controllers/authentication');
var studentImport = require('../controllers/studentImport');

router.get('/', function(req, res, next) {
  res.render('student_import');
});

router.post('/', studentImport.doImport);

module.exports = router;