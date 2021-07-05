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
var ctrlAdmin = require('../controllers/admin');
var ctrlUsers = require('../controllers/users');
var ctrlEmails = require('../controllers/emails');
var ctrlCart = require('../controllers/cart');

//GENERAL

//Home page.
router.get('/', ctrlProducts.productsList);

//Product Details page. Required product id to be sent by post.
router.post('/product', ctrlProducts.productDetails);

//Create new user account.
router.get('/register', ctrlUsers.userRegister);

//---
//CART
router.get('/cart/edit', ctrlCart.cartEditPage);
//retrieve
router.get('/cart', ctrlCart.getCart)
//add
router.get('/cart/:productId/:name/:price/:quantity', ctrlCart.addToCart);

//---
//USERS

router.get('/admin', auth, ctrlAdmin.productsTable);
//Logout
router.get('/logout', ctrlUsers.logout);
//Logged in.
router.get('/profile', auth, ctrlUsers.profilePage);

//---
// EMAILS

//SEND
router.get('/email/:to/:subject/:userId', ctrlEmails.sendEmail);

//Validation email page.
router.get('/sendEmail/:subject', ctrlEmails.emailPage);

//RECEIVE
//Validates the account email.
router.get('/emailResponse/:email/confirm', ctrlEmails.confirmEmail);
router.get('/emailResponse/:email/confirmEmailUpdate/:id', ctrlEmails.confirmEmailUpdate);
router.get('/emailResponse/:email/changePw', ctrlEmails.newPwPage);


module.exports = router;
