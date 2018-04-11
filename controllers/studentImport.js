var express = require('express');
var fs = ('fs');

function doImport(req, res, next) {
  fs.readFile(req.files.path, function (err, data) {
    if (err) throw err;
    console.log(data)
  });
}

module.exports = {
  'doImport': doImport
}