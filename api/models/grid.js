var mongoose = require('mongoose');

var gridSchema = new mongoose.Schema({
  pattern: {type: String},
  sections: {type: [gridSection], required: true}
});

var gridSection = new mongoose.Schema({
  mainImg: {type: String, required: true},
  title: {type: String, required: true},
});

mongoose.model("Grid", gridSchema);
