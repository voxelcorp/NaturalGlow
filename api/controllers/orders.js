//INGREDIENTS
//GLOBAL VARS
var mongoose = require('mongoose');
var library = require('../controllers/library');
var Order = mongoose.model('Order');
var axios = require('axios');

//-----
//FUNCTIONS

//-----
//MODULES
module.exports.paidOrder = async function (req, res) {
  // console.log(req.params.orderID);
  if(!req.params.orderID) {
    library.sendJsonResponse(res, 404, "missing info.");
    return;
  }
  var order = await Order.find({"_id": mongoose.Types.ObjectId(req.params.orderID)});
  await axios.get(library.apiOptions.server+'/email/'+library.tokenInfo(order[0].orderUserEmail)+'/6/null');
  library.sendJsonResponse(res, 200, "payment email sent");
}

module.exports.createOrder = async function (req, res) {
  if(!req.session.cart || !req.body) {
    library.sendJsonResponse(res, 404, "missing info.");
  }
  let data = req.body;
  let cart = req.session.cart;
  let cartTotal = 0;
  let ordersCount = await Order.countDocuments({});
  let order = new Order({});
  order.orderID(ordersCount);
  order.orderUser = req.session.userID;
  order.orderUserEmail = req.session.email;
  order.storeToday();

  //Add every field to new order. Field name must be exact to order param name.
  for(param in data) {
    order[param] = data[param];
  }
  for(product in cart) {
    cartTotal += parseFloat(cart[product].total);
    order.products.push({
      productID: cart[product].id,
      name: cart[product].name,
      price: cart[product].price,
      quantity: cart[product].quantity,
      total: cart[product].total,
    });
  }
  order.orderTotal = parseFloat(cartTotal) + parseFloat(order.delivery);
  let newOrder = await order.save();
  req.session.cart = [];
  await axios.get(library.apiOptions.server+'/email/'+library.tokenInfo(req.session.email)+'/5/null');
  res.redirect('/order/complete/'+order.payment+'/new');
}

//UPDATE
module.exports.updateOrder = async function (req, res) {
  var updated = await Order.updateOne(
    {"_id": mongoose.Types.ObjectId(req.body.orderID)},
    {"$set": {"status": req.body.status}}
  );
  library.sendJsonResponse(res, 200, updated);
}

//RETRIEVING DATA

module.exports.retrieveUserOrders = async function (req, res) {
  if(!req.params.user) {
    library.sendJsonResponse(res, 404, "missing user info.");
    return;
  }
  var orders = await Order.find({orderUser: req.params.user});
  orders = library.orderStatusMeaning(orders);
  library.sendJsonResponse(res, 200, orders);
}

module.exports.retrieveOrderID = async function (req, res) {
  if(!req.params.orderID) {
    library.sendJsonResponse(res, 404, "missing user info.");
    return;
  }
  var orders = await Order.find({_id: req.params.orderID});
  orders = library.orderStatusMeaning(orders);
  library.sendJsonResponse(res, 200, orders);
}

module.exports.retrieveAllOrders = async function (req, res) {
  var orders = await Order.find({});
  orders = library.orderStatusMeaning(orders);
  library.sendJsonResponse(res, 200, orders);
}
