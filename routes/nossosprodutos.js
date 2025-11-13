var express = require('express');
var router = express.Router();
const pool    = require('../db');   // seu pool mysql2


/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    const [products] = await pool.query('SELECT * FROM Praga ORDER BY id DESC');
    res.render('nossosprodutos', { 
      title: 'Nossos Produtos', 
      products: products 
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    next(error);
  }
});

module.exports = router;