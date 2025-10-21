var express = require('express');
var router = express.Router();
const pool    = require('../db');   // seu pool mysql2


/* GET home page. */
// router.get('/', function(req, res, next) {
  
//   res.render('index', { title: 'Express' });
// });

router.get('/', async (req, res, next) => {
  try {
    // busca 5 produtos
    const [recentes] = await pool.query(
      'SELECT * FROM products ORDER BY createdAt DESC LIMIT 5'
    );
    // renderiza home.jade, enviando o array recentes
    res.render('index', { recentes });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
