var express = require('express');
var router = express.Router();
var ctrlProducts = require('../controllers/products');
var ctrlIngredients = require('../controllers/ingredients');

//PRODUCTS

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

//-----
//INGREDIENTS

//GET "RETRIEVE"
router.get('/ingredients', ctrlIngredients.allIngredients);

//POST "CREATE"

//PUT "UPDATE"

//DELETE "REMOVE"

module.exports = router;
