var express = require('express');
var router = express.Router();

var auth = require('../controllers/authentication');
let db = require('../controllers/db');

router.get('/', auth.authenticate, function(req, res, next) {
    res.redirect('/enrol/prepare');
})

router.post('/', auth.authenticate, function(req,res,next){
    db.getUser({email: req.session.email}, (err, user)=>{
        if(user){
            if(user.type == 'student'){
                db.getStudentById(user.student_id)
                .then(student=>{
                    return db.getCoursesByYear(student.year,student.study_programme)
                        .then(courses=>{return {student,courses}})
                })
                .then(data=>{
                    return db.getOptionalCourses()
                        .then(optional=>{return Object.assign({optional},data)})
                })
                .then(data=>{
                    pretvori(data.student);
                    res.render('enrol', { 
                      title: 'Welcome: ' + req.session.type + ' ' + req.session.username,
                      type: req.session.type,
                      student:data.student,
                      enrols:[],
                      courses:data.courses,
                      selected:required(data.courses),
                      untaken:untaken(data.courses).concat(data.optional),
                    });
                });
            }
        }
    })
})
router.post('/store', auth.authenticate, function(req, res, next){
    debugger;
    db.getUser({email:req.session.email}, (err, user)=>{
        if(user){
            db.getStudentById(user.student_id)
            .then(student=>{
                return db.getCoursesId(req.body)
                .then(data=>{
                    db.setEnrol(student,data)
                    .then(()=>{
                        res.redirect('/personal');

                    });
                })
            })
        }
    })/*
    db.getCoursesId(req.body)
        .then(data=>{
            db.setEnrol(req.session.student,data)
            .then(()=>{
                res.redirect('/personal_data');
            });
        })*/
})
function required(courses){
    return courses.filter(c=>c.type == 0);
}
function untaken(courses){
    return courses.filter(c=>c.type == 1);
}
function optional(courses){
    return courses.filter(c=>c.type == 2);
}
function pretvori(student){
    switch (student.study_programme) {
        case 1000468:
        student.study_programme = 'Računalništvo in informatika (UNI)';
            break;
        case 1000470:
        student.study_programme = 'Računalništvo in informatika (VS)';
        default:
            break;
    }
    switch (student.enrol_type) {
        case 1:
        student.enrol_type = 'Prvi vpis'    
            break;
        case 2:
        student.enrol_type = 'Ponovni vpis'    
            break;
        case 3:
            student.enrol_type = 'Absolvent'    
                break;    
        default:
            break;
    }
    switch (student.study_type) {
        case 1:
        student.study_type = 'Redni'    
            break;
        case 2:
        student.study_type = 'Izredni'    
            break;    
        default:
            break;
    }
}

router.get('/prepare', auth.authenticate, function(req, res, next) {
    db.getUser({email: req.session.email}, (err, user)=>{
        if(user){
            if(user.type == 'student'){
                db.getStudentById(user.student_id)
                .then(student=>{
                    return db.getPostOffice()
                        .then(post=>{return {student,post}})
                })
                .then(data=>{
                    return db.getCountry()
                        .then(country=>{return Object.assign({country},data)})
                })
                .then(data=>{
                    return db.getCounty()
                        .then(county=>{return Object.assign({county},data)})
                })
                .then(data=>{
                    pretvori(data.student);
                    res.render('enrol_data', { 
                      title: 'Welcome: ' + req.session.type + ' ' + req.session.username,
                      type: req.session.type,
                      student:data.student,
                      enrols:[],
                      courses:[],
                      post:data.post,
                      country:data.country,
                      county:data.county
                    });
                });

            }
        }
    })
})

module.exports = router;