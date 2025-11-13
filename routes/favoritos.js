const express = require('express');
const router = express.Router();
const pool = require('../db');
const { estaLogado } = require('../middleware/authmiddleware');

// Render page - UI will decide how to fetch (server-side for logged users, client localStorage for guests)
router.get('/', (req, res) => {
  res.render('favoritos');
});

// Data endpoint:
// - /favoritos/data?ids=1,2,3  -> returns Praga rows for provided ids (used by guest/localStorage)
// - /favoritos/data?mine=true -> returns current user's favorites (requires login)
router.get('/data', async (req, res, next) => {
  try {
    if (req.query.mine === 'true') {
      if (!req.session || !req.session.usuario) return res.json({ results: [] });
      const userId = req.session.usuario.id;
      const sql = `SELECT p.id, p.name, p.name2, p.description, p.imageUrl
                   FROM Praga p
                   JOIN favoritos f ON f.praga_id = p.id
                   WHERE f.usuario_id = ?`;
      const [rows] = await pool.query(sql, [userId]);
      return res.json({ results: rows });
    }

    const idsParam = req.query.ids;
    if (!idsParam) return res.json({ results: [] });
    // sanitize ids
    const ids = idsParam.split(',').map(s => parseInt(s,10)).filter(n => !isNaN(n));
    if (ids.length === 0) return res.json({ results: [] });

    // build placeholders
    const placeholders = ids.map(_=>'?').join(',');
    const sql = `SELECT id, name, name2, description, imageUrl FROM Praga WHERE id IN (${placeholders})`;
    const [rows] = await pool.query(sql, ids);
    res.json({ results: rows });
  } catch (err) {
    next(err);
  }
});

// Add favorite (requires login)
router.post('/:id', estaLogado, async (req, res, next) => {
  try {
    const pragaId = parseInt(req.params.id, 10);
    if (isNaN(pragaId)) return res.status(400).json({ error: 'invalid_id' });
    const userId = req.session.usuario.id;
    // use INSERT IGNORE to avoid duplicates (if table has unique constraint)
    const sql = 'INSERT IGNORE INTO favoritos (usuario_id, praga_id) VALUES (?, ?)';
    await pool.query(sql, [userId, pragaId]);
    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao adicionar favorito:", err);
    res.status(500).json({ error: 'database_error' });
  }
});

// Remove favorite (requires login)
router.delete('/:id', estaLogado, async (req, res, next) => {
  try {
    const pragaId = parseInt(req.params.id, 10);
    if (isNaN(pragaId)) return res.status(400).json({ error: 'invalid_id' });
    const userId = req.session.usuario.id;
    const sql = 'DELETE FROM favoritos WHERE usuario_id = ? AND praga_id = ?';
    await pool.query(sql, [userId, pragaId]);
    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao remover favorito:", err);
    res.status(500).json({ error: 'database_error' });
  }
});

module.exports = router;
