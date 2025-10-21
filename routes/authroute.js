// routes/authroute.js
const express = require('express');
const router = express.Router();
const pool = require('../db');         // ./db.js na raiz
const bcrypt = require('bcrypt');

// --- LOGIN ---
// GET /login
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// POST /login
router.post('/login', async (req, res) => {
  const { usuario, senha } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT id, usuario, senha, funcao FROM usuarios WHERE usuario = ?',
      [usuario]
    );
    if (rows.length === 0) {
      return res.status(401).render('login', { error: 'Usuário não encontrado' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(senha, user.senha);
    if (!match) {
      return res.status(401).render('login', { error: 'Senha incorreta' });
    }
    // grava na sessão
    req.session.usuario = {
      id: user.id,
      usuario: user.usuario,
      funcao: user.funcao
    };
    res.redirect('/'); // redireciona para a página inicial ou outra página protegida
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro no servidor');
  }
});

// --- CADASTRO ---
// GET /register
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// POST /register
router.post('/register', async (req, res) => {
    const { usuario, senha} = req.body;
    const[funcao]="usuario";
    try {
      // 1) Gera hash da senha
      const hash = await bcrypt.hash(senha, 10);
  
      // 2) Executa o INSERT e captura o resultado
      const [result] = await pool.query(
        'INSERT INTO usuarios (usuario, senha, funcao) VALUES (?, ?, ?)',
        [usuario, hash, funcao]
      );
      console.log('Rows affected:', result.affectedRows);
  
      // 3) Se deu certo (affectedRows === 1), redireciona
      if (result.affectedRows === 1) {
        return res.redirect('/login');
      } else {
        // não deveria chegar aqui, mas só por segurança
        return res.status(500).render('register', { error: 'Não foi possível cadastrar.' });
      }
    } catch (err) {
      console.error('Erro ao registrar:', err);
      return res.status(500).render('register', { error: 'Erro ao cadastrar usuário' });
    }
  });

// --- LOGOUT ---
// GET /logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error(err);
    res.redirect('/login');
  });
});

module.exports = router;
