var express = require('express');
var router = express.Router();
var ctrlProducts = require('../controllers/products');
var ctrlAdmin = require('../controllers/admin');

// GET home page.
router.get('/', ctrlProducts.productsList);

//GET admin page.
//router.get('/admin', ctrlProducts.adminOptions);
router.get('/admin', ctrlAdmin.productsTable);

//Product Details page.
//Required product id to be sent by post.
router.post('/product', ctrlProducts.productDetails);

module.exports = router;
