var express = require('express');
var router = express.Router();
var path = require('path');

var db = require('../controllers/db');

router.get('/', function(req, res, next) {
  res.redirect('/exam_enrol/' + req.session.student_id);
});

router.get('/:vpisnaId', function(req, res, next) {
  db.getExamsForStudent(req.params.vpisnaId).then((exams) => {
    if(!exams) {
      return res.render('exam_enrol',{ type: req.session.type, email: req.session.email, message:'Na voljo nimate nobenega izpitnega roka.'});
    }
    succMsg = req.session.succMsg;
    return res.render('exam_enrol',{ type: req.session.type, email: req.session.email, exams: exams, examEnrolSuccMsg: succMsg});
  },
  (err) => {
    console.log(err);
    return res.render('exam_enrol',{ type: req.session.type, email: req.session.email, message:'Napaka na strežniku.'});
  });
});

router.get('/doEnrol/:examId/:studentId', function(req, res, next)  {
  db.doEnrol(parseInt(req.params.examId), req.params.studentId).then(() => {
    req.session.succMsg = 'Prijava uspešna.';
    return res.redirect('/../../exam_enrol');
  },
  (err) => {
    console.log(err);

    req.session.succMsg = undefined;
    
    return res.render('exam_enrol',{ type: req.session.type, email: req.session.email, message:'Napaka na strežniku.', examEnrolErr: 'Napaka na strežniku.'});
  });
});

router.get('/undoEnrol/:examId/:studentId', function(req, res, next)  {
  console.log('session user_id: ' + req.session.user_id);
  db.undoEnrol(parseInt(req.params.examId), req.session.user_id).then(() => {
    req.session.succMsg = 'Odjava uspešna.';
    return res.redirect('/../../exam_enrol');
  },
  (err) => {
    console.log(err);
  
    req.session.succMsg = undefined;
  
    return res.render('exam_enrol',{ type: req.session.type, email: req.session.email, message:'Napaka na strežniku.', examEnrolErr: 'Napaka na strežniku.'});
  });
});

module.exports = router;