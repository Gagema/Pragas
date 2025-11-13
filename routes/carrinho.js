var express = require('express');
var router = express.Router();
const ctrl    = require('../controllers/carrinhoController');
const pool = require('../db');

/* GET home page. */
router.get('/:id', ctrl.show);
router.get('/add/:id/:id2', ctrl.add);
router.post('/add/:id/:id2', ctrl.add2);
router.get('/comprar/:id2/:id', ctrl.comprar);



module.exports = router;
