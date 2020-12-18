var express = require('express');
var router = express.Router();
var ctrlProducts = require('../controllers/products');
var ctrlIngredients = require('../controllers/ingredients');
var ctrlPost = require('../controllers/post');

//GENERAL
router.get('/post/:url/:content', ctrlPost.submitPost);

//PRODUCTS

//GET "RETRIEVE"
router.get('/products', ctrlProducts.allProducts);
router.get('/products/:productId', ctrlProducts.infoSingleProduct);

//POST "CREATE"
router.post('/products', ctrlProducts.createProduct);

//PUT "UPDATE"
router.post('/products/update/:productId', ctrlProducts.updateProduct);

//DELETE "REMOVE"
router.get('/products/delete/:productId', ctrlProducts.deleteProduct);

//-----
//INGREDIENTS

//GET "RETRIEVE"
router.get('/ingredients', ctrlIngredients.allIngredients);

//POST "CREATE"

//PUT "UPDATE"

//DELETE "REMOVE"

module.exports = router;
