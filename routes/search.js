var express = require('express');
var router = express.Router();
const pool = require('../db');

// GET /search?q=term
router.get('/', async (req, res, next) => {
  const q = (req.query.q || '').trim();
  if (!q) {
    // render empty results with message
    return res.render('search', { query: q, results: [], message: 'Digite um termo para busca.' });
  }

  try {
    const like = `%${q}%`;
    // search in Praga.name and Praga.name2 (scientific name)
    const [rows] = await pool.query(
      'SELECT id, name, name2, description, imageUrl FROM Praga WHERE name LIKE ? OR name2 LIKE ? LIMIT 50',
      [like, like]
    );

    const message = rows.length === 0 ? 'Nenhuma praga encontrada.' : null;
    res.render('search', { query: q, results: rows, message });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
