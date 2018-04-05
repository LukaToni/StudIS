var express = require('express');
var router = express.Router();


/* GET personal data. */
router.get('/', function(req, res, next) {
  res.render('personal_data', { title: 'Express' });
});


module.exports = router;
