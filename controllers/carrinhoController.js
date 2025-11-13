const pool = require('../db');
exports.show = async (req, res, next) => {
    try {
      const [carrinho] = await pool.query(
        'SELECT * FROM carrinho WHERE id_usuario = ?',
        [req.params.id]
      );
      const [products] = await pool.query(
        'SELECT * FROM products ORDER BY createdAt DESC'
      );
      //if (rows.length === 0) return res.status(404).send('Produto não encontrado');
      res.render('carrinho', { carrinho, products });
    } catch (err) {
      next(err);
    }
  };
exports.add = async (req, res, next) => {
    const [carrinho] = await pool.query(
        'SELECT * FROM carrinho'
      );
    /*carrinho.forEach(async (c)=>{
        if (req.params.id == c.id_usuario && req.params.id2==c.id_products){
            c.quantidade=c.quantidade+1;
             await pool.execute(
                `UPDATE carrinho
                   SET quantidade=?
                 WHERE id = ?`,
                [c.quantidade , c.id ]
              );
              
              try {
                const [carrinho] = await pool.query(
                  'SELECT * FROM carrinho WHERE id_usuario = ?',
                  [req.params.id]
                );
                const [products] = await pool.query(
                  'SELECT * FROM products ORDER BY createdAt DESC'
                );
                //if (rows.length === 0) return res.status(404).send('Produto não encontrado');
                res.render('carrinho', { carrinho, products });
              } catch (err) {
                next(err);
              }
        }
        
        
    }
    );*/
    

    try {

        // 1) Pegue do body e atribua valores padrão caso venha undefined
        const id_usuario       = req.params.id;
        const id_products      = req.params.id2;
        // Converta para número ou 0
        
        
        // 2) Agora envie valores SEM undefined
        await pool.execute(
          `INSERT INTO carrinho
            (id_usuario, id_products)
           VALUES (?, ?)`,
          [id_usuario,id_products]
        );
        
        
    
        
      } catch (err) {
        next(err);
      }
      try {
        const [carrinho] = await pool.query(
          'SELECT * FROM carrinho WHERE id_usuario = ?',
          [req.params.id]
        );
        const [products] = await pool.query(
          'SELECT * FROM products ORDER BY createdAt DESC'
        );
        //if (rows.length === 0) return res.status(404).send('Produto não encontrado');
        res.render('carrinho', { carrinho, products });
      } catch (err) {
        next(err);
      }
  };

exports.add2 = async (req, res, next) => {
    const [carrinho] = await pool.query(
        'SELECT * FROM carrinho'
      );
    /*carrinho.forEach(async (c)=>{
        if (req.params.id == c.id_usuario && req.params.id2==c.id_products){
            c.quantidade=c.quantidade+req.body.quantity;
             await pool.execute(
                `UPDATE carrinho
                   SET quantidade=?
                 WHERE id = ?`,
                [c.quantidade , c.id ]
              );
              
              try {
                const [carrinho] = await pool.query(
                  'SELECT * FROM carrinho WHERE id_usuario = ?',
                  [req.params.id]
                );
                const [products] = await pool.query(
                  'SELECT * FROM products ORDER BY createdAt DESC'
                );
                //if (rows.length === 0) return res.status(404).send('Produto não encontrado');
                res.render('carrinho', { carrinho, products });
              } catch (err) {
                next(err);
              }
        }
        
        
    }
    );*/
    

    try {

        // 1) Pegue do body e atribua valores padrão caso venha undefined
        const id_usuario       = req.params.id;
        const id_products      = req.params.id2;
        // Converta para número ou 0
        
        
        // 2) Agora envie valores SEM undefined
        await pool.execute(
          `INSERT INTO carrinho
            (id_usuario, id_products)
           VALUES (?, ?)`,
          [id_usuario,id_products]
        );
        
        
    
        
      } catch (err) {
        next(err);
      }
      try {
        const [carrinho] = await pool.query(
          'SELECT * FROM carrinho WHERE id_usuario = ?',
          [req.params.id]
        );
        const [products] = await pool.query(
          'SELECT * FROM products ORDER BY createdAt DESC'
        );
        //if (rows.length === 0) return res.status(404).send('Produto não encontrado');
        res.render('carrinho', { carrinho, products });
      } catch (err) {
        next(err);
      }
  };

exports.comprar = async (req, res, next) => {
  
    const id = req.params.id;
    const id2 = req.params.id2;
    const [compra] = await pool.query(
        'SELECT * FROM products WHERE id = ?', [id]
      );

      
    compra.forEach(async(c)=>{
    
     c.stock=c.stock-1;
     

      
      
              await pool.execute(
                `UPDATE products
                   SET stock = ?
                 WHERE id = ?`,
                [c.stock , c.id]
              );
  

  try {
    
      await pool.execute('DELETE FROM carrinho WHERE id_products = ? AND id_usuario= ? LIMIT 1', [id, id2]);
   
      } catch (err) {
      console.error(err);
      next(err);
      }

  });
  res.render('comprado');
};

  