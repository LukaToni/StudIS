var express = require('express');
var router = express.Router();

var auth = require('../controllers/authentication');

var db = require('../controllers/db');

router.get('/', auth.authenticate, function(req, res, next) {
  let renderObj = {
    type: req.session.type, 
    email: req.session.email, 
    message:''
  }
  
  db.getEnrolYears(req.session.type, req.session.professor_id).then((enrolYears) => {
    if(enrolYears) {
      renderObj.message = 'Izberite leto:';
      renderObj.enrolYears = enrolYears;
    } else {
      renderObj.message = 'Napaka na srežniku!';
    }
    
    return res.render('count_course_enrols', renderObj);
  },
  (err) => {
    console.log(err);
    renderObj.message = 'Napaka na srežniku'
    
    return res.render('count_course_enrols', renderObj);
  });
});


router.post('/', auth.authenticate, function(req, res, next) {
  let renderObj = {
    type: req.session.type, 
    email: req.session.email,
    selectedYear: req.body.selectedEnrolYear, 
    message:''
  }
  
  db.getCountCourseEnrols(req.body.selectedEnrolYear).then( (enrols) => {
    db.getEnrolYears(req.session.type, req.session.professor_id).then((enrolYears) => {
      if(enrols) renderObj.enrols = enrols;
      if(enrolYears) renderObj.enrolYears = enrolYears;
      
      return res.render('count_course_enrols', renderObj);
    });
  },
  (err) => {
    console.log(err);
    renderObj.message = 'Napaka na srežniku'
    return res.render('count_course_enrols', renderObj);
  });
});

module.exports = router;