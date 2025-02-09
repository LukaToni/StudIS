var express = require('express');
var router = express.Router();

var auth = require('../controllers/authentication');
let db = require('../controllers/db');

/* GET personal data. */
router.get('/', auth.authenticate, function(req, res, next) {
  db.getUser({email: req.session.email}, (err, user)=>{
    console.log(user);
    if(user){
      console.log(user.type);
      if(user.type == 'student'){
        db.getStudentById(user.student_id)
          .then(student => {
            return db.getStudentEnrols(user.student_id)
              .then(enrols=>{return {student, enrols}})
          })
          .then(data=>{
            if(data.student.token){
              return db.getTokenByKey(data.student.token)
                .then(token=>{return Object.assign({token},data)})
                .then(data=>{
                res.render('personal_data', { 
                  title: 'Welcome: ' + req.session.type + ' ' + req.session.username,
                  type: req.session.type,
                  student:data.student,
                  enrols:data.enrols,
                  token:data.token
                 });
                })
            }
            else{
                res.render('personal_data', { 
                  title: 'Welcome: ' + req.session.type + ' ' + req.session.username,
                  type: req.session.type,
                  student:data.student,
                  enrols:data.enrols,
                 });
            }
        })}
      else {
        res.render('personal_data', { 
          title: 'Welcome: ' + req.session.type + ' ' + req.session.username,
          type: req.session.type,
          email: req.session.email,
          student: {},
          enrols: []
         });
      }
    } else {
      res.render('personal_data', { 
        title: 'Welcome: ' + req.session.type + ' ' + req.session.username,
        type: req.session.type,
        student: {},
        enrols: []
       });
    }
  })
  
});

//GET search students
router.get('/query', auth.authenticate, function(req, res, next){
  let queryData = req.query.search;
  db.findStudent(queryData)
    .then(students=>{
      res.status(200).json(students);
    })
})

router.get('/:studentId', auth.authenticate, function(req, res, next) {
  let studentId = req.params.studentId;
  db.getUser({email: req.session.email}, (err, user)=>{
    db.getStudentById(studentId)
        .then(student => {
          return db.getStudentEnrols(studentId)
            .then(enrols=>{return {student, enrols}})
        })
        .then(data=>{
          res.render('personal_data', { 
            title: 'Welcome: ' + req.session.type + ' ' + req.session.username,
            type: req.session.type,
            type: req.session.type,
            email: req.session.email,
            student:data.student,
            enrols:data.enrols
          });
        })
  })
      
})

module.exports = router;
