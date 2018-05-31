var express = require('express');
var router = express.Router();

var auth = require('../controllers/authentication');

var db = require('../controllers/db');
var dateFormat = require('dateformat');

function isProfessor(session) {
  return session.professor_id != null;
}

function formatDate(date) {
  return {
    "date": dateFormat(date, "shortDate"),
    "time": dateFormat(date, "HH:MM")
  }
}

/**
 * Adds formated date to exams so it can be directly displayed 
 **/
function addFormatedDate(exams) {
  for(let i=0; i < exams.length; i++) {
    if(exams[i] && exams[i].exam_date)
      exams[i]["formatted_date"] = formatDate(exams[i].exam_date);
  }
  
  return exams;
}

/**
 * Depending on the role different exames are shown
 * Professor can only see its own but 
 * Referal can see all the exames
 **/
function getExamsFunctionPromise(session) {
  // TODO change function
  return isProfessor(session)? 
      db.getExamsForProffesor(session.professor_id) : db.getAllExams();  
}

router.get('/', auth.authenticate, function(req, res, next) {
  let renderObj = {
    session: req.session,
    type: req.session.type, 
    email: req.session.email, 
    message:''
  }


  getExamsFunctionPromise(req.session).then((exams) => {
    if(exams) {
      renderObj.message = 'Izberite izpitni rok:';
      renderObj.exams = addFormatedDate(exams);
    } else {
      renderObj.message = 'Napaka na srežniku! Problemi pri pridobivanju izpitnih rokov.';
    }
    
    return res.render('grade_exam', renderObj);
  },
  (err) => {
    console.log(err);
    renderObj.message = 'Napaka na srežniku'
    
    return res.render('grade_exam', renderObj);
  });
});


router.post('/', auth.authenticate, function(req, res, next) {
  let renderObj = {
    type: req.session.type, 
    email: req.session.email,
    selectedExamId: req.body.selectedExamId, 
    message:''
  }
  
  console.log(req.body.selectedExamId)
  db.getStudentsForExam(req.body.selectedExamId).then( (students) => {
    getExamsFunctionPromise(req.session).then((exams) => {
      if(exams) renderObj.exams = addFormatedDate(exams);
      if(students) renderObj.students = students;
      
      return res.render('grade_exam', renderObj);
    },  
    (err) => {
      console.log(err);
      renderObj.message = 'Napaka na srežniku, pri pridobivanju izpitnih rokov'
      return res.render('grade_exam', renderObj);
    });
  },
  (err) => {
    console.log(err);
    renderObj.message = 'Napaka na srežniku, pri pridobivanju študentov'
    return res.render('grade_exam', renderObj);
  });
});

router.post('/store', auth.authenticate, function(req, res, next){
    //debugger;
    let grades = [];
    Object.keys(req.body).forEach(a=>{
        let id = a.split('_')[0];
        let value = req.body[a];
        let grade = grades.find(g=>g.id == id);
        if(!grade){
            grade = {
                id: id,
                valid: true,
                total: 0,
                grade: 5
            }
            grades.push(grade);
        }

        if (a.indexOf('valid')>-1){
            grade.valid = false;
        }
        else if(a.indexOf('gradeTotal')>-1){
            grade.grade = parseInt(value);
        }
        else if(a.indexOf('examGrade')>-1){
            grade.total = parseInt(value);
        }

    })
    db.saveGrades(grades).then(()=>{
        return res.redirect('/grade_exam');
    });
})

module.exports = router;