var express = require('express');
var router = express.Router();

var auth = require('../controllers/authentication');

var db = require('../controllers/db');

router.get('/', auth.authenticate, function(req, res, next) {
  return res.redirect('/verify_token/list'); 
  
});


router.get('/list', auth.authenticate, function(req, res, next) {
  // TODO: Do something when error occurs
  db.getStudentsWithUsedToken().then(getStudentsWithUsedToken => {
    db.getStudentsWithNoTokens().then(students_noTokens => {
      
      return res.render('verify_token', {
        students_noTokens,
        getStudentsWithUsedToken,
      });
      
    })
  })
});

router.get('/verify', auth.authenticate, function(req, res, next){
    let tokenId = req.query.tokenId;
    //debugger;
    db.getTokenWithId(tokenId).then(tokens =>{
        let token = tokens[0];
        //debugger;
        db.setStudentEnrol(token).then(()=>{
            db.verifyToken(tokenId).then(()=>{
                res.redirect('/verify_token/list');
            })
        })
    })

})

module.exports = router;