var express = require('express');
var router = express.Router();
var path = require('path');

var db = require('../controllers/db');
var auth = require('../controllers/authentication');
var fs = require('fs');

router.get('/:enrolId', function(req, res, next) {
  fs.readFile('./template/vpisni_list_template.htm', 'utf8', function(err, htmlData) {
    if (err || !htmlData) {
      return res.render('pdf_error', { type: req.session.type, email: req.session.email, message: 'Napaka pri branju datoteke.' });
    }
    
    console.log('Read template.');
    
    if(!req.params.enrolId) {
      return res.render('pdf_error', { type: req.session.type, email: req.session.email, message: 'Vpisni list ne obstaja.' });
    }
    
    db.getVpisniPdfData(req.params.enrolId).then( (vpisniPdfData) => {
      if(!vpisniPdfData) {
        return res.render('pdf_error', { type: req.session.type, email: req.session.email, message: 'Vpisni list ne obstaja.' });
      }
      vpisniPdfDataIsto = vpisniPdfData[0];
            
      //htmlData.replace('$param', vpisniPdfData.param)
      htmlData = htmlData.replace('$student_name', vpisniPdfDataIsto.student_name);
      htmlData = htmlData.replace('$student_surname', vpisniPdfDataIsto.student_surname)
      htmlData = htmlData.replace('$student_vpisna', vpisniPdfDataIsto.student_vpisna);
      htmlData = htmlData.replace('$enrol_year', vpisniPdfDataIsto.enrol_year + '/' + (parseInt(vpisniPdfDataIsto.enrol_year)+1));
      htmlData = htmlData.replace('$student_email', vpisniPdfDataIsto.student_email);
      htmlData = htmlData.replace('$enrol_study_program', vpisniPdfDataIsto.study_program_evs + ' - ' + vpisniPdfDataIsto.enrol_study_program);
      htmlData = htmlData.replace('$enrol_study_program', vpisniPdfDataIsto.study_program_evs + ' - ' + vpisniPdfDataIsto.enrol_study_program);
      htmlData = htmlData.replace('$enrol_type', vpisniPdfDataIsto.enrol_type);
      htmlData = htmlData.replace('$year', vpisniPdfDataIsto.year);
      htmlData = htmlData.replace('$study_type', vpisniPdfDataIsto.study_type);
      htmlData = htmlData.replace('$first_enrol', vpisniPdfDataIsto.first_enrol + '/' + (parseInt(vpisniPdfDataIsto.first_enrol) + 1));
      
      
      var stevilo_predmetov_templatu = 10;
      var izpisanih_predmetov = 0;
      
      var sumaKtjov = 0;
      
      for(var i = 0; i < vpisniPdfData.length && i < stevilo_predmetov_templatu; i++) {
        vpisniPdfDataPredmet = vpisniPdfData[i];
        
        htmlData = htmlData.replace('$predmet-lastnik', vpisniPdfDataPredmet.course_owner_name + ' ' + vpisniPdfDataPredmet.course_owner_surname);
        htmlData = htmlData.replace('$predmet-ime', vpisniPdfDataPredmet.course_name + ' - ' + vpisniPdfDataPredmet.course_id);
        htmlData = htmlData.replace('$predmet-kt', vpisniPdfDataPredmet.course_credits);
        
        sumaKtjov += vpisniPdfDataPredmet.course_credits;
        izpisanih_predmetov++;
      }
      
      while(izpisanih_predmetov < 10) {
        htmlData = htmlData.replace('$predmet-lastnik', '&nbsp;');
        htmlData = htmlData.replace('$predmet-ime', '&nbsp;');
        htmlData = htmlData.replace('$predmet-kt', '&nbsp;');
        izpisanih_predmetov++;
      }
      
      htmlData = htmlData.replace('$kt-sum', sumaKtjov);
      
      return res.pdfFromHTML({
        filename: 'vpisni_list.pdf',
        htmlContent: htmlData,
        options: {
          "border": {
            "top": "1cm",            // default is 0, units: mm, cm, in, px
            "left": "2cm",
            "right": "2cm",
            "bottom": "4.2cm"
          },
          "base": "file:///" + path.join(__dirname, '../template', 'vpisni_list_template_files').replace(/\\/g, '/')
        }
      }); 
    },
    (err) => {
      console.log(err);
      return res.render('pdf_error', { type: req.session.type, email: req.session.email, message: 'Napaka med pobiranjem podatkov.' });
    })
  });
});

module.exports = router;