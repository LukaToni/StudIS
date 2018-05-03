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
                    res.render('enrol', { 
                      title: 'Welcome: ' + req.session.type + ' ' + req.session.username,
                      type: req.session.type,
                      student:student,
                      enrols:[],
                      courses:[{name:'ARS1',number:1234},{name:'DS', number:23412},{name:'OMA', number:2354}]
                    });
                });
            }
        }
    })
})


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