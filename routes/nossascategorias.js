var express = require('express');
var router = express.Router();
const pool    = require('../db');   // seu pool mysql2


/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    // busca 5 produtos
    const [products] = await pool.query(
      'SELECT * FROM Categoria ORDER BY createdAt DESC'
    );
    // renderiza home.jade, enviando o array recentes
    res.render('nossascategorias', { products });
  } catch (err) {
    next(err);
  }
});

module.exports = router;