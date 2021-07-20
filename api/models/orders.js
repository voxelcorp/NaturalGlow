var library = require('../controllers/library');
var apiOptions = library.apiOptions;

var mongoose = require('mongoose');

//Status
// 0 -> Waiting Payment
// 1 -> Production
// 2 -> Shipping
// 3 -> Sent
// 4 -> Delivered

var orderSchema = new mongoose.Schema({
  orderNumber: {type:String, required: true},
  orderUser: {type: String},
  orderUserEmail: {type: String},
  name: {type: String, required: true},
  phone: {type: String, required: true},
  address: {type: String, required: true},
  note: {type: String},
  zipCode: {type: String, required: true},
  district: {type: String, required: true},
  delivery: {type: String, required: true},
  payment: {type: String, required: true},
  status: {type: String, default: 0},
  products: {type: [orderProduct], required: true},
  orderTotal: {type: String, required: true},
  date: {type: String, required: true}
});

var orderProduct = new mongoose.Schema({
  productID: {type: String, required: true},
  name: {type: String, required: true},
  price: {type: String, required: true},
  quantity: {type: Number, required: true},
  total: {type: String, required: true},
});

orderSchema.methods.orderID = function (count) {
  let currentDate = new Date();
  let orderID = String(currentDate.getFullYear()) + String(currentDate.getMonth() + 1) + String(currentDate.getDate()) + String(count);

  this.orderNumber = orderID;
}

orderSchema.methods.storeToday = function () {
  let currentDate = new Date();
  let date = String(currentDate.getFullYear()) + "-" + String(('0' + (currentDate.getMonth()+1)).slice(-2)) + "-" + String(currentDate.getDate());

  this.date = date;
}

mongoose.model('Order', orderSchema);
