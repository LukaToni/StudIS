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

  if(req.body.selectedCourse) {
    req.body.selectedCourse = JSON.parse(req.body.selectedCourse)
    
    console.log(req.body.selectedCourse.numberid);
    console.log(req.body.selectedCourse.name);
    console.log(req.body.selectedCourse);
    
    req.session.courseId = req.body.selectedCourse.numberid;
    req.session.courseName = req.body.selectedCourse.name;
  }
  
  /*
  if(!req.body.selectedCourse.numberid) {
    req.body.selectedCourse.numberid = req.session.courseId;
    req.body.selectedCourse.name = req.session.courseName;
  }
  */
  
  db.getExams(req.session.courseId).then( (exams) => {    
    courseId = req.session.courseId;
    courseName = req.session.courseName;
  
    //console.log(exams.length);
    console.log(exams);
  
    if(!exams || exams.length === 0) {
      return res.render('edit_exams',{ type: req.session.type, email: req.session.email, course_id: courseId, examErr: prevErr, message: ' Ni vpisanih izpitnih rokov.'});
    }
    return res.render('edit_exams',{ type: req.session.type, email: req.session.email, course_name: courseName, course_id: courseId, examErr: prevErr, exams: exams});
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
  
  prazniki = [];
  
  
  db.addExam(req.session.courseId, date).then( () => {
    req.session.examsErr = undefined;
    return res.redirect(307, '/edit_exams');
  },
  (err) => {
    console.log(err);
    req.session.examsErr = 'Napaka, izpitni rok ni bil dodan.';
    return res.redirect(307, '/edit_exams');
  })
});


module.exports = router;