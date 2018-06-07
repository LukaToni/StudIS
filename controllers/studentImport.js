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
      if(lines[0].length < 1) {
        lines.shift();
        continue;
      }
      var studentData = lines[0].split('\t');
      console.log(studentData);
      
      if(studentData.length != 3) {
        return res.render('student_import', { message: 'Format datoteke ni skladen z zahtevami.' });
      }
      
      var existLines = studentData[0] && studentData[1] && studentData[2];
      var correctFormat =
        studentData[0].length < 31 &&
        studentData[1].length < 31 && 
        studentData[2].length < 61 && validateEmail(studentData[2]);
        
      console.log(existLines + ' ' + correctFormat + ' ' + validateEmail(studentData[2]));
      if(!existLines || !correctFormat) {
        return res.render('student_import', { message: 'Format datoteke ni skladen z zahtevami.' });
      }
      
      var student = {
        name: studentData[0],
        lastName: studentData[1],
        email: studentData[2]
      }
      students.push(student);
      lines.shift();
    }
        
    db.studentImport(students, (err, studentsNew) => {
      if(err) {
        console.log(err);
        if(err.stack) {
          console.log(err.stack);
        }
        return res.render('student_import', { message: 'Napaka med uvozom, uvoz ni uspešen.' , type: req.session.type, email: req.session.email});
      } else {
        var studentsMessage = '';
        for(var i = 0; i < students.length; i++) {
          var s = students[i];
          studentsMessage = studentsMessage + '\n{ vpisna stevilka: ' + s.registrationNumber + ' ime: ' + s.name + ' priimek: ' + s.lastName + ' uporabnisko ime/email: ' + s.email + ' geslo: student }'
        }
        
        return res.render('student_import', { message: 'Uvoz uspešen.', students: studentsNew, type: req.session.type, email: req.session.email});
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