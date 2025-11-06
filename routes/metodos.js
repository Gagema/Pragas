const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const ctrl    = require('../controllers/metodoController');

const {estaLogado, eAdmin} = require('../middleware/authmiddleware')

// Configuração do storage para uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/images/')),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Rotas de CRUD de produtos
router.get('/',         ctrl.index);
router.get('/:id',      ctrl.show);
// Usa upload.single para processar multipart/form-data
router.get('/new', estaLogado, eAdmin, ctrl.new);
router.post('/', estaLogado, eAdmin, upload.single('image'), ctrl.create);
router.get('/:id/edit', estaLogado, eAdmin, ctrl.edit);
// Aplica upload.single em edit se quiser exibir preview, mas principalmente em update
router.put('/:id', estaLogado, eAdmin, upload.single('image'), ctrl.update);
router.delete('/:id', estaLogado, eAdmin, ctrl.destroy);



module.exports = router;