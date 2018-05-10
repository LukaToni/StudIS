var express = require('express');
var router = express.Router();

var auth = require('../controllers/authentication');

var db = require('../controllers/db');

router.get('/', auth.authenticate, function(req, res, next) {
  db.getCourses(req.session.type, req.session.professor_id).then((courses) => {
    if(!courses) {
      return res.render('number_students',{ type: req.session.type, email: req.session.email, message:'Ne upravljate nad nobenim predmetom.'});
    }
    return res.render('number_students',{ type: req.session.type, email: req.session.email, message:'Izberite predmet za prikaz vpisov:', courses: courses});
  },
  (err) => {
    console.log(err);
    return res.render('number_students',{ type: req.session.type, email: req.session.email, message:'Napaka na strežniku.'});
  });
});

router.post('/', auth.authenticate, function(req, res, next) {
  db.getCourseEnrols(req.body.selectedCourseNumberId).then( (enrols) => {
    if(!enrols) {
      return res.render('number_students',{ type: req.session.type, email: req.session.email, message:'Ni vpisanih študentov.'});
    }
    return res.render('number_students',{ type: req.session.type, email: req.session.email, enrols: enrols});
  },
  (err) => {
    console.log(err);
    return res.render('number_students',{ type: req.session.type, email: req.session.email, message:'Napaka na strežniku.'});
  });
});

module.exports = router;