//ADMIN MANAGEMENT.
var library = require('../controllers/library');
var apiOptions = library.apiOptions;
var request = library.request;

module.exports.productsTable = function (req, res) {
  res.render('admin', {
    title: 'Natural Glow',
  });
}
