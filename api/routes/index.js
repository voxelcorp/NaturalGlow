var express = require('express');
var router = express.Router();
var ctrlProducts = require('../controllers/products');

//GET "RETRIEVE"
router.get('/products', ctrlProducts.allProducts);
router.get('/products/:productId', ctrlProducts.infoSingleProduct);

//POST "CREATE"
router.post('/products', ctrlProducts.createProduct);

//PUT "UPDATE"
router.put('/products/', ctrlProducts.updateProduct);
router.put('/products/:productId', ctrlProducts.updateProduct);

//DELETE "REMOVE"
router.delete('/products/:productId', ctrlProducts.deleteProduct);

module.exports = router;
