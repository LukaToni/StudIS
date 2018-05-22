var express = require('express');
var router = express.Router();

var auth = require('../controllers/authentication');

var db = require('../controllers/db');

router.get('/', auth.authenticate, function(req, res, next) {
  db.getStudentsWithTokens().then(students => {
    return res.render('tokens/list', {studentsWithTokens: students});
  })
  
});


router.get('/list', auth.authenticate, function(req, res, next) {
  db.getStudentsWithTokens().then(students_haveTokens => {
    db.getStudentsWithNoTokens().then(students_noTokens => {
      
      return res.render('token_list', {
        students_noTokens,
        students_haveTokens,
      });
      
    })
  })
  //return res.render('token_list',{ type: req.session.type });
});

router.get('/:tokenId', auth.authenticate, function(req, res, next) {
  let tokenId = req.params.tokenId;
  return res.render('personal_data', { type: req.session.type, tokenId: "Token id is" + tokenId });
});

module.exports = router;