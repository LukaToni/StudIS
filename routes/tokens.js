var express = require('express');
var router = express.Router();

var auth = require('../controllers/authentication');

var db = require('../controllers/db');

router.get('/', auth.authenticate, function(req, res, next) {
  return res.render('token_list',{ type: req.session.type });
});

router.get('/list', auth.authenticate, function(req, res, next) {
  return res.render('token_list',{ type: req.session.type });
});

router.get('/:tokenId', auth.authenticate, function(req, res, next) {
  let tokenId = req.params.tokenId;
  return res.render('token_list', { type: req.session.type, tokenId: "Token id is" + tokenId });
});

module.exports = router;