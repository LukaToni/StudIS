var express = require('express');
var router = express.Router();
var path = require('path');

var db = require('../controllers/db');
var auth = require('../controllers/authentication');
var fs = require('fs');

router.get('/:enrolId', function(req, res, next) {
  fs.readFile('./template/vpisni_list_template.htm', 'utf8', function(err, htmlData) {
    if (err || !htmlData) {
      return res.render('pdf_error', { type: req.session.type, email: req.session.email, message: 'Napaka pri branju datoteke.' });;
    }
    
    console.log('Read template.');
    
    if(!req.params.enrolId) {
      return res.render('pdf_error', { type: req.session.type, email: req.session.email, message: 'Vpisni list ne obstaja.' });
    }
    
    db.getVpisniPdfData(req.params.enrolId).then( (vpisniPdfData) => {
      if(!vpisniPdfData) {
        return res.render('pdf_error', { type: req.session.type, email: req.session.email, message: 'Vpisni list ne obstaja.' });
      }
      
      //htmlData.replace('$param', vpisniPdfData.param)
      
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
          "base": "file:///C:/Users/Priden/Faks/TPO/StudIS/template/vpisni_list_template_files"
        }
      }); 
    },
    (err) => {
      return res.render('pdf_error', { type: req.session.type, email: req.session.email, message: 'Napaka med pobiranjem podatkov.' });
    })
  });
});

module.exports = router;