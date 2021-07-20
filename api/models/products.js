var mongoose = require('mongoose');

var productSchema = new mongoose.Schema({
  name: {type: String, required: true},
  quantity: {type: Number, required: true},
  quantityType: {type: String, required: true},
  price: {type: mongoose.Decimal128, required: true},
  images: {type: [productImagesSchema], required: true},
  ingredients: {type: [productIngredientsSchema], required: true},
  description: {type: String, required: true},
  tag: {type: mongoose.Schema.Types.ObjectId, required: true},
  stock: {type: Number, default: 1}
});

var productImagesSchema = new mongoose.Schema({
  imagePath: {type: String, required: true},
  main: {type: Number, default: 0}
});

var productIngredientsSchema = new mongoose.Schema({
  id: {type: String, required: true},
  name: {type: String, required: true}
});

mongoose.model('Product', productSchema);
