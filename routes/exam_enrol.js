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

router.get('/doEnrol/:examId', function(req, res, next)  {
  db.doEnrol(req.params.examId, req.session.student_id).then(() => {
    req.session.succMsg = 'Prijava uspešna.';
    return res.redirect('/../exam_enrol');
  },
  (err, errMsg) => {
    if(errMsg) {
      return res.render('exam_enrol',{ type: req.session.type, email: req.session.email, examEnrolErr: errMsg});
    }
    console.log(err);
    return res.render('exam_enrol',{ type: req.session.type, email: req.session.email, message:'Napaka na strežniku.'});
  });
});

router.get('/undoEnrol/:examId', function(req, res, next)  {
  db.undoEnrol(req.params.examId, req.session.student_id).then(() => {
    req.session.succMsg = 'Odjava uspešna.';
    return res.redirect('/../exam_enrol');
  },
  (err, errMsg) => {
    if(errMsg) {
      return res.render('exam_enrol',{ type: req.session.type, email: req.session.email, examEnrolErr: errMsg});
    }
    console.log(err);
    return res.render('exam_enrol',{ type: req.session.type, email: req.session.email, message:'Napaka na strežniku.'});
  });
});

module.exports = router;