var express = require('express');
var router = express.Router();
const pool    = require('../db');   // seu pool mysql2


/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    // Buscar categorias para exibir na página inicial
    const [categorias] = await pool.query(
      'SELECT * FROM Categoria ORDER BY createdAt DESC LIMIT 6'
    );
    res.render('index', { title: 'PestControl Pro', categorias: categorias });
  } catch (err) {
    console.error('Erro ao buscar categorias:', err);
    next(err);
  }
});

module.exports = router;
