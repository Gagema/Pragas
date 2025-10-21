// controllers/productController.js
const pool = require('../db');

exports.index = async (req, res, next) => {
  try {
    const [products] = await pool.query(
      'SELECT * FROM Categoria ORDER BY createdAt DESC'
    );
    res.render('categoria/index', { products });
  } catch (err) {
    next(err);
  }
};

exports.show = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Categoria WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).send('Produto não encontrado');
    res.render('categoria/show', { product: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.new = (req, res) => {
  res.render('categoria/new');
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

    // 2) Agora envie valores SEM undefined
    await pool.execute(
      `INSERT INTO Categoria
        (name,description , imageUrl)
       VALUES (?, ?, ?)`,
      [name, description,imageUrl]
    );
    
    

    res.redirect('/nossascategorias');
  } catch (err) {
    next(err);
  }
};


exports.edit = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Categoria WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).send('Produto não encontrado');
    res.render('categoria/edit', { product: rows[0] });
  } catch (err) {
    next(err);
  }
};

// controllers/productController.js
exports.update = async (req, res, next) => {
  try {
    const { name, description, currentImageUrl } = req.body;
    // se veio arquivo, use a nova imagem; senão, mantenha a antiga
    const imageUrl = req.file
      ? '/images/' + req.file.filename
      : currentImageUrl;

    await pool.execute(
      `UPDATE Categoria
         SET name        = ?,
          
             description = ?,
            
           
             imageUrl    = ?,
             updatedAt   = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [ name, description,  imageUrl, req.params.id ]
    );

    res.redirect('/nossascategorias');
  } catch (err) {
    next(err);
  }
};




exports.destroy = async (req, res, next) => {
  
    console.log('>> destroy chamado para id =', req.params.id);

  try {
    const { id } = req.params;
    
    await pool.execute('DELETE FROM Categoria WHERE id = ?', [id]);
    res.redirect('/nossascategorias');
  } catch (err) {
    console.error(err);
    next(err);
  }
};


