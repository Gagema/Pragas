var express = require('express');
const router = express.Router();
const carrinhoCtrl = require('../controllers/carrinhoController');
const productCtrl = require('../controllers/productController');
const pool = require('../db');

const multer = require('multer');
const path = require('path');

router.get('/', carrinhoCtrl.comprar);

module.exports = router;