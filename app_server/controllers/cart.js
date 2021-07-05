//CART CONTROLLER
var library = require('../controllers/library');
var apiOptions = library.apiOptions;
var axios = require('axios');

//FUNCTIONS

//Check if its already stored inside the cart array.
var checkProduct = function (cart, productId) {
  if(!cart || !productId) {
    console.log('missing information.');
    return;
  }
  for(product in cart) {
    if(cart[product]["id"] == productId) {
      return {
      product: cart[product],
      status: true}
    }
  }
  return {
  product: null,
  status: false}
}

//MODULES
module.exports.cartEditPage = function (req, res) {
  if(!req.session) {
    res.redirect('/');
    return;
  }
  res.render('cart', {
    title: 'Editar carrinho'
  });
  library.sendJsonResponse(res, 200, req.session.cart);
}

module.exports.getCart = function (req, res) {
  if(!req.session) {
    library.sendJsonResponse(res, 403, 'missing session.');
    return;
  }
  library.sendJsonResponse(res, 200, req.session.cart);
}

module.exports.addToCart = async function (req, res) {
  if(!req.params) {
    library.sendJsonResponse(res, 404, 'missing information.');
    return;
  }else if(!req.session.cart) {
    library.sendJsonResponse(res, 403, 'missing session.');
    return;
  }
  var cart = req.session.cart;
  var storedProduct = checkProduct(cart, req.params.productId);
  //If already has the same product inside the cart
  if(storedProduct.status == true) {
    storedProduct.product.quantity += parseInt(req.params.quantity);
    storedProduct.product.total = parseFloat(storedProduct.product.price * storedProduct.product.quantity).toFixed(2)
  }else { //First iteration.
    cart.push({
      id: req.params.productId,
      name: req.params.name,
      quantity: parseInt(req.params.quantity),
      price: parseFloat(req.params.price),
      total: parseFloat(req.params.price * req.params.quantity).toFixed(2)
    });
  }
  library.sendJsonResponse(res, 200, 'product added to cart.');
}
