var express = require('express');
var router = express.Router();

var auth = require('../controllers/authentication');

var db = require('../controllers/db');


function groupCourses(courses) {
 
  let c = {};
  for(let i=0; i<courses.length; i++) {
    let course = courses[i];
    course.profs = {};
    course.profs_names = "";
    
    if(!c[course.course_id]) {
      // add course to list if the corse is uniqe 
      c[course.course_id] = course;
    } else if(c[course.course_id].taking <= course.taking) {
      // if the saved course has lower taking we need to replace it with this new one
      // since we are only interested in the score of the last taking
      
      // save the saved course porfs(were profs ids are saved) and prof_names(where profs names are already made ready for display - they are seperated with \n)
      let profs = c[course.course_id].profs;
      let profs_names =  c[course.course_id].profs_names; 
      
      // check if the course has Id of a new professor and add it to profs
      // we dont want to add professor that is already added
      if(!profs[course.prof_id]) {
        let prof_id = course.prof_id;
        let prof_fullName = course.prof_surname + course.prof_name;
        
        profs[prof_id] = prof_fullName;
        profs_names += prof_fullName + "\n";
      }
      
      c[course.course_id] = course;
      
      // restore the profs and profs_names that were overwritten one line above
      c[course.course_id].profs = profs;
      c[course.course_id].profs_names = profs_names;
    } 
    

  }
  
  // wirte courses back to array
  let out = [];
  for(let c_key in c) {
    out.push(c[c_key]);
  }
  
  return out;
}


function sortCourses(courses) {
  return courses.sort(
    function compare(a,b) {
      let a_c = Number(a.course_id);
      let b_c = Number(b.course_id);
      
      if (a_c < b_c)
        return -1;
      if (a_c > b_c)
        return 1;
      return 0;
    }
  );
}

function splitByStudyYear(courses) {
  let out = {};
  
  for(let i=0; i<courses.length; i++) {
    let course = courses[i];
    
    if(!out[course.study_year]) out[course.study_year] = []
    out[course.study_year].push(course);
  }
  
  for(let course_year in out) {
    out[course_year] = sortCourses(out[course_year]);
  }
  
  return out;
}

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
  
  if(!renderObj.studentId) {
    return res.render('kartotecni_list', renderObj);
  }
  
  renderObj.courses = [];
  db.getEnroledCourses(renderObj.studentId).then((courses) => {
    db.getNotEnroledCourses(renderObj.studentId).then((not_courses) => {
      if(not_courses) {
        renderObj.courses = renderObj.courses.concat(not_courses);
      }
      
      if(courses) {
        renderObj.courses = renderObj.courses.concat(courses);
      } 
      
      console.log("Currently we have", renderObj.courses.length);
      
      renderObj.courses = groupCourses(renderObj.courses);
      renderObj.coursesSplit = splitByStudyYear(renderObj.courses);
      console.log("Currently we have", renderObj.courses.length);
      
      if(!not_courses || !courses) {
        renderObj.message = 'Napaka na srežniku!';
      }
      
      return res.render('kartotecni_list', renderObj);
    });
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