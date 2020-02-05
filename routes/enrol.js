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
                db.updateStudentAll(req.body)
                .then(()=>{
                    db.getStudentById(user.student_id)
                .then(student=>{
                    return db.getTokenByKey(student.token)
                        .then(token=>{return Object.assign({token},{student})})
                })
                .then(data=>{
                    return db.getCoursesByYear(data.token.year,data.token.study_programme)
                        .then(courses=>{return Object.assign({courses},data)})
                })
                .then(data=>{
                    return db.getOptionalCourses()
                        .then(optional=>{return Object.assign({optional},data)})
                })
               
                .then(data=>{
                    if(data.token.enrol_type == 1){
                        pretvori(data.token);
                        console.log("Naj bi bil redni vpis ali 3 z prosto izbiro")
                        res.render('enrol', { 
                            title: 'Welcome: ' + req.session.type + ' ' + req.session.username,
                            type: req.session.type,
                            student:data.student,
                            enrols:[],
                            courses:data.courses,
                            selected:required(data.courses),
                            untaken:untaken(data.courses).concat(data.optional),
                            token:data.token
                        });
                    }
                    else{
                        db.getCoursesLastYear(data.student)
                            .then(coursesLastYear=>{return Object.assign({coursesLastYear},data)})
                            .then(data=>{
                                pretvori(data.token);
                                res.render('enrol', { 
                                    title: 'Welcome: ' + req.session.type + ' ' + req.session.username,
                                    type: req.session.type,
                                    student:data.student,
                                    enrols:[],
                                    courses:data.courses,
                                    selected:data.coursesLastYear,
                                    untaken:[],
                                    token:data.token
                                  });

                            })
                    }
                });
                })
            }
        }
    })
})
router.post('/store', auth.authenticate, function(req, res, next){
    //debugger;
    db.getUser({email:req.session.email}, (err, user)=>{
        if(user){
            db.getStudentById(user.student_id)
            .then(student=>{
                return db.getCoursesId(req.body)
                .then(data=>{
                    db.setEnrolCourses(student,data)
                    .then(()=>{
                        db.usedToken(student.token)
                        .then(()=>{
                            res.redirect('/personal');
                        })
                    });
                })
            })
        }
    })/*
    //debugger;
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
function pretvori(token){
    switch (token.study_programme) {
        case 1000468:
        token.study_programme = 'Računalništvo in informatika (UNI)';
            break;
        case 1000470:
        token.study_programme = 'Računalništvo in informatika (VS)';
        default:
            break;
    }
    switch (token.enrol_type) {
        case 1:
        token.enrol_type = 'Prvi vpis'    
            break;
        case 2:
        token.enrol_type = 'Ponovni vpis'    
            break;
        case 3:
            token.enrol_type = 'Absolvent'    
                break;    
        default:
            break;
    }
    switch (token.study_type) {
        case 1:
        token.study_type = 'Redni'    
            break;
        case 2:
        token.study_type = 'Izredni'    
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
                    return db.getTokenByKey(data.student.token)
                        .then(token=>{return Object.assign({token},data)})
                })
                .then(data=>{
                    pretvori(data.token);
                    res.render('enrol_data', { 
                      title: 'Welcome: ' + req.session.type + ' ' + req.session.username,
                      type: req.session.type,
                      student:data.student,
                      enrols:[],
                      courses:[],
                      post:data.post,
                      country:data.country,
                      county:data.county,
                      token:data.token
                    });
                });

            }
        }
    })
})

module.exports = router;