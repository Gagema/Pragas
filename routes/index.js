var express = require('express');
var router = express.Router();
const pool    = require('../db');   // seu pool mysql2


/* GET home page. */
// router.get('/', function(req, res, next) {
  
//   res.render('index', { title: 'Express' });
// });

router.get('/', function(req, res, next) {
  
  res.render('index', { title: 'Express' });
});

module.exports = router;
