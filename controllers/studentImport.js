var express = require('express');
var fs = require('fs');

var db = require('../controllers/db');

function doImport(req, res) {  
  if(!req.file) {
    return res.render('student_import', { message: 'Izberite datoteko.' });
  }
  fs.readFile(req.file.path, 'utf-8', function (err, data) {
    if (err) {
      return res.render('student_import', { message: 'Napaka na strežniku' });
    }
    
    var lines = data.split(/\r?\n/);
        
    var students = [];
    
    
    
    while(lines.length > 0) {
      var studentData = lines[0].split(' ');
      
      if(studentData.length != 4) {
        return res.render('student_import', { message: 'Format datoteke ni skladen z zahtevami.' });
      }
      
      var existLines = studentData[0] && studentData[1] && studentData[2] && studentData[3];
      var correctFormat =
        studentData[0].length < 31 &&
        studentData[1].length < 31 && 
        studentData[2].length < 8 && 
        studentData[3].length < 61 && validateEmail(studentData[3]);
        
      if(!existLines || !correctFormat) {
        return res.render('student_import', { message: 'Format datoteke ni skladen z zahtevami.' });
      }
      
      var student = {
        name: studentData[0],
        lastName: studentData[1],
        program: studentData[2],
        email: studentData[3]
      }
      students.push(student);
      lines.shift();
    }
        
    db.studentImport(students, (err) => {
      if(err) {
        console.log(err);
        if(err.stack) {
          console.log(err.stack);
        }
        return res.render('student_import', { message: 'Napaka med uvozom, uvoz ni uspešen.' });
      } else {
        var studentsMessage = '';
        for(var i = 0; i < students.length; i++) {
          var s = students[i];
          studentsMessage = studentsMessage + '\n{ vpisna stevilka: ' + s.registrationNumber + ' ime: ' + s.name + ' priimek: ' + s.lastName + ' uporabnisko ime/email: ' + s.email + ' geslo: student }'
        }
        
        return res.render('student_import', { message: 'Uvoz uspešen.\nStudenti:' + studentsMessage });
      }
    });      
  });
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

module.exports = {
  'doImport': doImport
}