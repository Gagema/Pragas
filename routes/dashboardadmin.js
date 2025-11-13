var express = require('express');
var router = express.Router();
const pool  = require('../db');   // seu pool mysql2


/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    // busca 5 produtos
    const [praga] = await pool.query(
      'SELECT * FROM products ORDER BY createdAt DESC'
    );
    // renderiza home.jade, enviando o array recentes
    res.render('dashboardadmin', { praga });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
