var express = require('express');
var router = express.Router();
var path = require('path');

var db = require('../controllers/db');
var auth = require('../controllers/authentication');

router.get('/', function(req, res, next) {
  db.getCourses(req.session.type, req.session.professor_id).then((courses) => {
    if(!courses) {
      return res.render('edit_exams',{ type: req.session.type, email: req.session.email, message:'Ne upravljate nad nobenim predmetom.'});
    }
    return res.render('edit_exams',{ type: req.session.type, email: req.session.email, message:'Izberite predmet za prikaz vpisov:', courses: courses});
  },
  (err) => {
    console.log(err);
    return res.render('edit_exams',{ type: req.session.type, email: req.session.email, message:'Napaka na strežniku.'});
  });
});

router.post('/', function(req, res, next) {
  prevErr = '';
  if(req.session.examsErr) {
    prevErr = req.session.examsErr;
  }

  if(req.body.selectedCourseNumberId) {
    req.session.courseId = req.body.selectedCourseNumberId;
  }
  
  if(!req.body.selectedCourseNumberId) {
    req.body.selectedCourseNumberId = req.session.courseId;
  }
  
  db.getExams(req.body.selectedCourseNumberId).then( (exams) => {    
    courseId = req.body.selectedCourseNumberId;
  
    //console.log(exams.length);
    console.log(exams);
  
    if(!exams || exams.length === 0) {
      return res.render('edit_exams',{ type: req.session.type, email: req.session.email, course_id: courseId, examErr: prevErr, message: ' Ni vpisanih izpitnih rokov.'});
    }
    return res.render('edit_exams',{ type: req.session.type, email: req.session.email, course_id: courseId, examErr: prevErr, exams: exams});
  },
  (err) => {
    console.log(err);
    return res.render('edit_exams',{ type: req.session.type, email: req.session.email, course_id: courseId, examErr: prevErr, message: ' Napaka na strežniku.'});
  });
});

router.post('/add', function(req, res, next) {
  
  currDate = new Date();
  date = new Date(req.body.date);
  
  if(currDate > date) {
    req.session.examsErr = 'Izberite kasnejši datum.';
    return res.redirect(307, '/edit_exams');
  }
  
  if(date.getDay() === 0 || date.getDay() === 6) {
    req.session.examsErr = 'Ne sme biti vikend.';
    return res.redirect(307, '/edit_exams');
  }
  
  hour = parseInt(req.body.hour);
  if(hour < 0 || hour > 23) {
    req.session.examsErr = 'Napačna ura.';
    return res.redirect(307, '/edit_exams');
  }
  date.setHours(hour);
  
  minutes = parseInt(req.body.minutes);
  if(minutes < 0 || minutes > 59) {
    req.session.examsErr = 'Napačne minute.';
    return res.redirect(307, '/edit_exams');
  }
  date.setMinutes(minutes);
  

  db.addExam(req.body.course_id, date).then( () => {
    req.session.examsErr = undefined;
    return res.redirect(307, '/edit_exams');
  },
  (err) => {
    req.session.examsErr = 'Napaka, izpitni rok ni bil dodan.';
    return res.redirect(307, '/edit_exams');
  })
});


module.exports = router;