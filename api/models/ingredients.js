var mongoose = require('mongoose');

var ingredientSchema = new mongoose.Schema({
  name: {type: String, required: true},
});

mongoose.model('Ingredient', ingredientSchema);
