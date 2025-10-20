// controllers/productController.js
const pool = require('../db');

exports.index = async (req, res, next) => {
  try {
    const [products] = await pool.query(
      'SELECT * FROM products ORDER BY createdAt DESC'
    );
    res.render('products/index', { products });
  } catch (err) {
    next(err);
  }
};

exports.show = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Praga WHERE id = ?',
      [req.params.id]
    );
    const [metodo] = await pool.query(
      'SELECT * FROM Metodo WHERE id = ?',
      [rows[0].Metodo_id]
    );
    const [categoria] = await pool.query(
      'SELECT * FROM Categoria WHERE id = ?',
      [rows[0].Categoria_id]
    );
    
    if (rows.length === 0) return res.status(404).send('Produto não encontrado');
    res.render('products/show', { product: rows[0],metodos:metodo[0],categorias:categoria[0] });
  } catch (err) {
    next(err);
  }
};

exports.new = async (req, res) => {
  try {
    const [categorias] = await pool.query(
      'SELECT * FROM Categoria ORDER BY createdAt DESC'
    );
    const [metodos] = await pool.query(
      'SELECT * FROM Metodo ORDER BY createdAt DESC'
    );
    res.render('products/new', { categorias,metodos });
  } catch (err) {
    next(err);
  }
};

// controllers/productController.js

exports.create = async (req, res, next) => {
  try {
    // 1) Pegue do body e atribua valores padrão caso venha undefined
    const name        = req.body.name        ?? '';
    const name2        = req.body.name2        ?? '';
    const description = req.body.description ?? '';
    const  life_cycle  = req.body.life_cycle ?? '';
    const  damage = req.body.damage ?? '';
    const  Categoria_id = req.body.Categoria ?? '';
    const  Metodo_id = req.body.Metodo ?? '';
    
    // Converta para número ou 0
   
    // Se houver upload, use o filename; senão, null
    const imageUrl    = req.file ? '/images/' + req.file.filename : null;

    // 2) Agora envie valores SEM undefined
    await pool.execute(
      `INSERT INTO Praga
        (name, name2,description ,life_cycle,damage, imageUrl,Categoria_id,Metodo_id)
       VALUES (?, ?, ?, ?, ?,?,?,?)`,
      [name,name2, description, life_cycle, damage, imageUrl,Categoria_id,Metodo_id]
    );
    
    

    res.redirect('/nossosprodutos');
  } catch (err) {
    next(err);
  }
};


exports.edit = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Praga WHERE id = ?',
      [req.params.id]
    );
    const [categorias] = await pool.query(
      'SELECT * FROM Categoria ORDER BY createdAt DESC'
    );
    const [metodos] = await pool.query(
      'SELECT * FROM Metodo ORDER BY createdAt DESC'
    );
    
    if (rows.length === 0) return res.status(404).send('Produto não encontrado');
    res.render('products/edit', { product: rows[0], categorias, metodos });
  } catch (err) {
    next(err);
  }
};

// controllers/productController.js
exports.update = async (req, res, next) => {
  try {
    const { name,name2, description, life_cycle, damage, currentImageUrl,Categoria,Metodo } = req.body;
    // se veio arquivo, use a nova imagem; senão, mantenha a antiga
    const imageUrl = req.file
      ? '/images/' + req.file.filename
      : currentImageUrl;

    await pool.execute(
      `UPDATE Praga
         SET name        = ?,
             name2       = ?,
             description = ?,
             life_cycle  = ?,
             damage      = ?,
             imageUrl    = ?,
             Categoria_id =  ?,
             Metodo_id   = ?,
             updatedAt   = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [ name,name2, description, life_cycle, damage, imageUrl,Categoria,Metodo, req.params.id ]
    );

    res.redirect('/nossosprodutos');
  } catch (err) {
    next(err);
  }
};




exports.destroy = async (req, res, next) => {
  
    console.log('>> destroy chamado para id =', req.params.id);

  try {
    const { id } = req.params;
    
    await pool.execute('DELETE FROM Praga WHERE id = ?', [id]);
    res.redirect('/nossosprodutos');
  } catch (err) {
    console.error(err);
    next(err);
  }
};


