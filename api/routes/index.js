var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'payload',
  algorithms: ['HS256'],
  getToken: function fromSession(req) {
    if(req.session.token) {
      return req.session.token;
    }
  }
});

var ctrlProducts = require('../controllers/products');
var ctrlIngredients = require('../controllers/ingredients');
var ctrlPost = require('../controllers/post');
var ctrlUsers = require('../controllers/users');

//GENERAL
router.get('/post/:url/:content', ctrlPost.submitPost);

// -> PRODUCTS <-

//GET "RETRIEVE"
router.get('/products', ctrlProducts.allProducts);
router.get('/products/:productId', ctrlProducts.infoSingleProduct);

//POST "CREATE"
router.post('/products', auth, ctrlProducts.createProduct);

//PUT "UPDATE"
router.post('/products/update/:productId', auth, ctrlProducts.updateProduct);

//DELETE "REMOVE"
router.get('/products/delete/:productId', auth, ctrlProducts.deleteProduct);

//-----
// -> INGREDIENTS <-

//GET "RETRIEVE"
router.get('/ingredients', ctrlIngredients.allIngredients);

//POST "CREATE"

//PUT "UPDATE"

//DELETE "REMOVE"

//-----
// -> USERS <-

//GET "RETRIEVE"
router.get('/user/username/:username', ctrlUsers.getUser);
router.get('/user/email/:email', ctrlUsers.getEmail);

//POST "CREATE & AUTHENTICATION"
router.post('/register', ctrlUsers.register);
router.post('/login', ctrlUsers.login);

//PUT "UPDATE"
router.post('/user/emailConfirm', ctrlUsers.verifyEmail);
router.post('/user/changePw', ctrlUsers.changePw);

//DELETE "REMOVE"

module.exports = router;
