var express = require('express');
var router = express.Router();

var auth = require('../controllers/authentication');

var db = require('../controllers/db');

router.get('/', auth.authenticate, function(req, res, next) {
  return res.redirect('/tokens/list'); 
  
});


router.get('/list', auth.authenticate, function(req, res, next) {
  // TODO: Do something when error occurs
  db.getStudentsWithTokens().then(students_haveTokens => {
    db.getStudentsWithNoTokens().then(students_noTokens => {
      
      return res.render('token_list', {
        students_noTokens,
        students_haveTokens,
      });
      
    })
  })
});

router.get('/edit', auth.authenticate, function(req, res, next) {
  let tokenId = req.query.tokenId;
  
  if(!tokenId) {
    console.error("No tokenId provided in query")
    return res.redirect('/tokens/list')
  }
  
  db.getTokenWithId(tokenId).then(tokens => {
    
    if(!tokens || !tokens[0]) {
      console.error("Unable to fetch token with id=" + tokenId + " from server")
      return res.redirect('/tokens/list');
    }
    
    let token = tokens[0];
    
    // TODO: these two type lists should be assignt dynamicly 
    let enrol_types = [
      {"name":"Prvi vpis", "value":1},
      {"name":"Ponovni vpis", "value":2},
      {"name":"Absulvent", "value":3},
    ]
    
    let study_types = [
      {"name":"Redni", "value":1},
      {"name":"Izredni", "value":2},
    ]
    
    let study_programmes = [
      {"name":"Računalništvo in matematika (UNI)", "value":1000407},
      {"name":"Računalništvo in informatika (DOK)", "value":1000474},  
      {"name":"Računalništvo in informatika (UNI)", "value":1000468}, 
      {"name":"Računalništvo in informatika (MAG)", "value":1000471},  
      {"name":"Računalništvo in informatika (VS)", "value":1000470},     
    ]
    
    let years = [
      {"name":"1", "value":1},
      {"name":"2", "value":2},
      {"name":"3", "value":3},
    ]
    
    return res.render('token_edit', { 
      type: req.session.type, 
      tokenId,
      token,
      study_types,
      enrol_types,
      study_programmes,
      years
    });
  })
});

router.post('/update', auth.authenticate, function(req, res, next) {
  console.log(req.body);
  console.log(req.query.tokenId)
  
  let tokenId = req.query.tokenId;
  
  if(!tokenId) {
    console.error("No tokenId provided in query")
    return res.redirect('/tokens/list')
  }
  
  let newTokenData = req.body;
  if(!newTokenData) {
    console.error("No new token data in POST body!")
    return res.redirect('/tokens/list')
  }
  
  db.updateTokenWithId(tokenId, newTokenData).then(() => {
    //return res.redirect('/tokens/edit?tokenId=' + tokenId);
    return res.redirect('/tokens/list')
  });
  
});

router.get('/create', auth.authenticate, function(req, res, next) {
  console.log(req.query.student_id)
  
  let student_id = req.query.student_id;
  
  if(!student_id) {
    console.error("No student_id provided in query")
    return res.redirect('/tokens/list');
  }

  db.createNewToken(student_id).then(() => {
    return res.redirect('/tokens/list');
  });
  
});

module.exports = router;