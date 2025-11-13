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

// Rotas de CRUD de métodos
router.get('/',         ctrl.index);
// ordem importa: rotas estáticas devem vir antes de rotas dinâmicas
router.get('/new',      estaLogado, eAdmin, ctrl.new);
router.post('/',        estaLogado, eAdmin, upload.single('image'), ctrl.create);
router.get('/:id',      ctrl.show);
router.get('/:id/edit', estaLogado, eAdmin, ctrl.edit);
// Aplica upload.single em update para tratar imagem opcional
router.put('/:id',      estaLogado, eAdmin, upload.single('image'), ctrl.update);
router.delete('/:id',   estaLogado, eAdmin, ctrl.destroy);



module.exports = router;