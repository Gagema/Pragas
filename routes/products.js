const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const ctrl    = require('../controllers/productController');

// Configuração do storage para uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/images/')),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const uploadFields = upload.fields([
  {name:'image', maxCount: 1},
  {name: 'gallery_images', maxCount: 8}
]);

// Rotas de CRUD de produtos
router.get('/',         ctrl.index);
router.get('/new',      ctrl.new);

router.post('/',        uploadFields, ctrl.create); // upload.single('image'), ctrl.create);

router.get('/:id',      ctrl.show);
router.get('/:id/edit', ctrl.edit);
// Aplica upload.single em edit se quiser exibir preview, mas principalmente em update
router.put('/:id',      uploadFields, ctrl.update); // upload.single('image'), ctrl.update);
router.delete('/:id',   ctrl.destroy);



module.exports = router;