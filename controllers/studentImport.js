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
    
    if(lines.length%4 != 0) {
      return res.render('student_import', { message: 'Format datoteke ni skladen z zahtevami.' });
    }
    
    while(lines.length > 0) {
      
      var existLines = lines[0] && lines[1] && lines[2] && lines[3];
      var correctFormat =
        lines[0].length < 31 &&
        lines[1].length < 31 && 
        lines[2].length < 8 && 
        lines[3].length < 61 && validateEmail(lines[3]);
        
      if(!existLines || !correctFormat) {
        return res.render('student_import', { message: 'Format datoteke ni skladen z zahtevami.' });
      }
      
      var student = {
        name: lines[0],
        lastName: lines[1],
        program: lines[2],
        email: lines[3]
      }
      students.push(student);
      lines.shift();lines.shift();lines.shift();lines.shift();
    }
        
    db.studentImport(students, (err) => {
      if(err) {
        console.log(err.stack);
        return res.render('student_import', { message: 'Napaka med uvozom, uvoz ni uspešen.' });
      } else {
        return res.render('student_import', { message: 'Uvoz uspešen.' });
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