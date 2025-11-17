// controllers/productController.js
const pool = require('../db');
const fs = require('fs');
const path = require('path');

const getImagePath = (filename) => path.join(__dirname, '..', 'public', filename);


exports.index = async (req, res, next) => {
  try {
    const [products] = await pool.query(
      'SELECT * FROM Praga ORDER BY createdAt DESC'
    );
    res.render('nossosprodutos', { products });
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
    if (rows.length === 0) return res.status(404).send('Produto não encontrado');

    const product = rows[0];

    const [metodo] = await pool.query(
      'SELECT * FROM Metodo WHERE id = ?',
      [product.Metodo_id]
    );
    const [categoria] = await pool.query(
      'SELECT * FROM Categoria WHERE id = ?',
      [product.Categoria_id]
    );
    
    let gallery = [];

    if(product.imageUrl){
      gallery.push(product.imageUrl);
    }

    if(product.gallery_images) {
      try {
        const galleryDb = JSON.parse(product.gallery_images);
        gallery = gallery.concat(galleryDb);
      } catch (e) {
        console.error("erro ao processar JSON da galeria:", e);
      }
    }

    // Convert video URL to embed format
    let embedVideoUrl = null;
    if (product.video_url) {
      const url = product.video_url;
      // YouTube
      const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
      if (youtubeMatch) {
        embedVideoUrl = 'https://www.youtube.com/embed/' + youtubeMatch[1];
      } else {
        // Vimeo
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) {
          embedVideoUrl = 'https://player.vimeo.com/video/' + vimeoMatch[1];
        } else {
          embedVideoUrl = url; // Use as-is if not recognized
        }
      }
    }

    res.render('products/show',{
      product: product,
      metodo: metodo[0],
      categoria: categoria[0] || {},
      gallery: gallery,
      embedVideoUrl: embedVideoUrl
    });
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

    const { name, name2, description, life_cycle, damage, Categoria, Metodo, video_url } = req.body;

    // robust file handling: multer can populate req.file or req.files depending on config
    let imageUrl = null;
    if (req.files) {
      if (req.files.image && req.files.image[0]) imageUrl = '/images/' + req.files.image[0].filename;
      else if (req.files['image'] && req.files['image'][0]) imageUrl = '/images/' + req.files['image'][0].filename;
    }
    if (!imageUrl && req.file && req.file.filename) imageUrl = '/images/' + req.file.filename;

    let galleryPaths = [];
    if (req.files && (req.files.gallery_images || req.files['gallery_images'])) {
      const arr = req.files.gallery_images || req.files['gallery_images'];
      galleryPaths = Array.isArray(arr) ? arr.map(file => '/images/' + file.filename) : [];
    }

    const galleryJson = JSON.stringify(galleryPaths);

    // Ensure no undefined in bind params: convert undefined/empty strings to null
    const params = [
      (typeof name === 'undefined' || name === '') ? null : name,
      (typeof name2 === 'undefined' || name2 === '') ? null : name2,
      (typeof description === 'undefined' || description === '') ? null : description,
      (typeof life_cycle === 'undefined' || life_cycle === '') ? null : life_cycle,
      (typeof damage === 'undefined' || damage === '') ? null : damage,
      imageUrl || null,
      galleryJson || null,
      (typeof video_url === 'undefined' || video_url === '') ? null : video_url,
      (typeof Categoria === 'undefined' || Categoria === '') ? null : Categoria,
      (typeof Metodo === 'undefined' || Metodo === '') ? null : Metodo
    ];

    await pool.execute(
      `INSERT INTO Praga
        (name, name2, description, life_cycle, damage, imageUrl, gallery_images, video_url, Categoria_id, Metodo_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params
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
    if(rows.length === 0) return res.status(404).send('Produto nao encontrado');
    const product = rows[0];

    const [categorias] = await pool.query(
      'SELECT * FROM Categoria ORDER BY createdAt DESC'
    );
    const [metodos] = await pool.query(
      'SELECT * FROM Metodo ORDER BY createdAt DESC'
    );
    
    res.render('products/edit', { product: product, categorias, metodos });
  } catch (err) {
    next(err);
  }
};

// controllers/productController.js
exports.update = async (req, res, next) => {
  try {
    const {id} = req.params;
    const {
      name, name2, description, life_cycle, damage,
      currentImageUrl,Categoria, Metodo, delete_gallery_images, video_url
    } = req.body;

    const[rows] = await pool.query('SELECT * FROM Praga WHERE id = ?', [id])
    if(rows.length ===0) return res.status(404).send('Praga não encontrada');

    const currentProduct = rows[0];

    const imageUrl = req.files.image ? '/images/' + req.files.image[0].filename : currentImageUrl;

    let currentGallery = [];
    if(currentProduct.gallery_images){
      currentGallery = JSON.parse(currentProduct.gallery_images);
    }

    let updatedGallery = currentGallery;
    if(delete_gallery_images && delete_gallery_images.length > 0){
      const imagesToDelete = Array.isArray(delete_gallery_images) ? delete_gallery_images : [delete_gallery_images];
      updatedGallery = currentGallery.filter(imgUrl => !imagesToDelete.includes(imgUrl));
    }

    if(req.files.gallery_images){
      const newImages = req.files.gallery_images.map(file => '/images/' + file.filename);
      updatedGallery = updatedGallery.concat(newImages);
    }

    const galleryJson = JSON.stringify(updatedGallery);

    await pool.execute(
      `UPDATE Praga 
      SET name = ?, name2 = ?, description = ?, life_cycle = ?, damage = ?,
          imageUrl = ?, Categoria_id = ? , Metodo_id = ?, gallery_images= ?, video_url = ?,
          updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name || null, name2 || null, description || null, life_cycle || null, damage || null, imageUrl || null, Categoria || null, Metodo || null, galleryJson || null, video_url || null, id]
    );
    
    res.redirect('/products/'+id);
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


