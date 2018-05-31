var express = require('express');
var router = express.Router();

var auth = require('../controllers/authentication');

var db = require('../controllers/db');

router.get('/', auth.authenticate, function(req, res, next) {
  let renderObj = {
    type: req.session.type, 
    email: req.session.email,
    studentId: req.query.studentId,
    message:''
  }
  
  if(req.session.student_id) {
    renderObj.studentId = req.session.student_id;
    renderObj.hideSearch = true;
  }
  
  
  db.getEnrolYears(req.session.type, req.session.professor_id).then((enrolYears) => {
    if(enrolYears) {
      renderObj.message = '';
      renderObj.enrolYears = enrolYears;
    } else {
      renderObj.message = 'Napaka na srežniku!';
    }
    
    return res.render('kartotecni_list', renderObj);
  },
  (err) => {
    console.log(err);
    renderObj.message = 'Napaka na srežniku'
    
    return res.render('kartotecni_list', renderObj);
  });
});


router.post('/', auth.authenticate, function(req, res, next) {
  let renderObj = {
    type: req.session.type, 
    email: req.session.email,
    searchQuery: req.body.studentSearchQuery, 
    message:''
  }
  
  console.log("searching for:", req.body.studentSearchQuery)
  db.searchForStudents(req.body.studentSearchQuery).then( (students) => {
    
      if(students) renderObj.students = students;
      
      console.log(students)
      
      return res.render('kartotecni_list', renderObj);
  },
  (err) => {
    console.log(err);
    renderObj.message = 'Napaka na srežniku'
    return res.render('kartotecni_list', renderObj);
  });
});

module.exports = router;