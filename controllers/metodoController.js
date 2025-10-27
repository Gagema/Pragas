// controllers/productController.js
const pool = require('../db');

exports.index = async (req, res, next) => {
  try {
    const [products] = await pool.query(
      'SELECT * FROM Categoria ORDER BY createdAt DESC'
    );
    res.render('metodo/index', { products });
  } catch (err) {
    next(err);
  }
};

exports.show = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Metodo WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).send('Produto não encontrado');
    res.render('metodo/show', { metodo: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.new = (req, res) => {
  res.render('metodo/new');
};

// controllers/productController.js

exports.create = async (req, res, next) => {
  try {
    // 1) Pegue do body e atribua valores padrão caso venha undefined
    const name        = req.body.name        ?? '';
    
    const description = req.body.description ?? '';
   
    // Converta para número ou 0
   
    // Se houver upload, use o filename; senão, null
    const imageUrl    = req.file ? '/images/' + req.file.filename : null;

    const principios_ativos = req.body.principios_ativos || null;
    const manejo_integrado = req.body.manejo_integrado || null;
    const dosagem_recomendada = req.body.dosagem_recomendada || null;
    const carencia_dias = req.body.carencia_dias || null;

    // 2) Agora envie valores SEM undefined
    await pool.execute(
      `INSERT INTO Metodo
        (name,description , imageUrl, principios_ativos, manejo_integrado, dosagem_recomendada, carencia_dias)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description, imageUrl, principios_ativos, manejo_integrado, dosagem_recomendada, carencia_dias]
    );
    
    

    res.redirect('/nossosmetodos');
  } catch (err) {
    next(err);
  }
};


exports.edit = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Metodo WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).send('Métoddo não encontrado');
    res.render('metodo/edit', { metodo:rows[0] });
  } catch (err) {
    next(err);
  }
};

// controllers/productController.js
exports.update = async (req, res, next) => {
  try {
    const { name, description, currentImageUrl, principios_ativos, manejo_integrado, dosagem_recomendada, carencia_dias } = req.body;
    // se veio arquivo, use a nova imagem; senão, mantenha a antiga
    const imageUrl = req.file
      ? '/images/' + req.file.filename
      : currentImageUrl;

    await pool.execute(
      `UPDATE Metodo
         SET name        = ?,
             description = ?,
             imageUrl    = ?,
             principios_ativos = ?,
             manejo_integrado = ?,
             dosagem_recomendada = ?,
             carencia_dias = ?,
             updatedAt   = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [ name, description,  imageUrl, principios_ativos, manejo_integrado, dosagem_recomendada, carencia_dias, req.params.id ]
    );

    res.redirect('/nossosmetodos');
  } catch (err) {
    next(err);
  }
};




exports.destroy = async (req, res, next) => {
  
    console.log('>> destroy chamado para id =', req.params.id);

  try {
    const { id } = req.params;
    
    await pool.execute('DELETE FROM Metodo WHERE id = ?', [id]);
    res.redirect('/nossosmetodos');
  } catch (err) {
    console.error(err);
    next(err);
  }
};


