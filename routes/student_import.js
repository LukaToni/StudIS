var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: 'uploads/' })

var auth = require('../controllers/authentication');

//var auth = require('../controllers/authentication');
var studentImport = require('../controllers/studentImport');

router.get('/', auth.authenticate, function(req, res, next) {
  res.render('student_import',{ type: req.session.type, email: req.session.email });
});

router.post('/', auth.authenticate, upload.single('import_file'), studentImport.doImport);

module.exports = router;