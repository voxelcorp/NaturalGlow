//ADMIN MANAGEMENT.
var library = require('../controllers/library');
var apiOptions = library.apiOptions;
var request = library.request;

module.exports.adminOptions = function (req, res) {

}

var renderProductsTable = function (req, res, data) {
  res.render('admin', {
    title: 'Natural Glow',
    StringifyProducts: JSON.stringify(data),
    products: data
  });
}

module.exports.productsTable = function (req, res) {
  var requestOptions, path;
  path = '/api/products';
  requestOptions = {
    url: apiOptions.server + path,
    method: "GET",
    json: {},
    qs: {}
  };
  request(requestOptions, function (err, response, body) {
    var data = library.formatProductData(res, body);
    renderProductsTable(req, res, data);
  });
}
