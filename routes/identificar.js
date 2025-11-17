const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../db');

// Configuração do storage para uploads de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/images/uploads/')),
  filename: (req, file, cb) => cb(null, 'identificacao-' + Date.now() + path.extname(file.originalname))
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Apenas imagens são permitidas (JPEG, JPG, PNG, WEBP)'));
  }
});

// GET: Exibir página de identificação
router.get('/', (req, res) => {
  res.render('identificar/index');
});

// POST: Processar upload e identificar praga
router.post('/', upload.single('foto'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }

    const imagePath = '/images/uploads/' + req.file.filename;
    
    // Simulação de análise de imagem (IA)
    // Na prática, aqui você chamaria uma API de Machine Learning
    // Por enquanto, vamos retornar pragas aleatórias baseadas em palavras-chave
    
    const [todasPragas] = await pool.query(
      `SELECT p.*, c.name as categoria_nome 
       FROM Praga p 
       LEFT JOIN Categoria c ON p.Categoria_id = c.id 
       ORDER BY RAND() 
       LIMIT 5`
    );
    
    // Simular scores de confiança
    const resultados = todasPragas.map((praga, index) => ({
      ...praga,
      confianca: Math.floor(Math.random() * (95 - 60) + 60) - (index * 10), // 95% a 45%
      razao: gerarRazaoIdentificacao(praga)
    })).sort((a, b) => b.confianca - a.confianca);
    
    res.render('identificar/resultados', { 
      resultados,
      imagemUpload: imagePath
    });
    
  } catch (err) {
    console.error('Erro ao processar identificação:', err);
    next(err);
  }
});

// Função auxiliar para gerar razões de identificação
function gerarRazaoIdentificacao(praga) {
  const razoes = [
    'Padrão de danos nas folhas similar',
    'Coloração e textura da lesão correspondem',
    'Formato e distribuição dos danos característicos',
    'Sintomas visuais compatíveis',
    'Tipo de ataque identificado na imagem'
  ];
  return razoes[Math.floor(Math.random() * razoes.length)];
}

module.exports = router;
