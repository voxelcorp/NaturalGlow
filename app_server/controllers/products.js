//PRODUCTS INFORMATION.
var library = require('../controllers/library');
var apiOptions = library.apiOptions;
var request = library.request;

//HOMEPAGE
var renderHomepage = function (req, res, productData) {
  res.render('homepage', {
    title: 'Natural Glow',
    pageProducts: productData
  });
};

module.exports.productsList = function (req, res) {
  var requestOptions, path;
  path = '/api/products';
  requestOptions = {
    url: apiOptions.server + path,
    method: "GET",
    json: {},
    qs : {}
  };
  request(requestOptions, function (err, response, body) {
    var data = library.formatProductData(res, body);
    renderHomepage(req, res, data);
  });
}

//-----
//PRODUCT DETAIL
var renderProductPage = function (req, res, productData) {
res.render('productDetail', {
  title: productData.name,
  ProductInfo: {
    stock: 'Disponivel',
    name: productData.name,
    quantity: productData.quantity + ' ' + productData.quantityType,
    price: productData.price,
  },
  mainImg: productData.mainImg,
  ProductImages: productData.images,
  ProductIngredients: {
    ingredient1: 'Glicerina',
    ingredient2: 'Nao Glicerina',
    ingredient3: 'Glicerina',
    ingredient4: 'Nao Glicerina',
    ingredient5: 'Glicerina',
  },
  ProductDescription: productData.description
});
}

module.exports.productDetails = function (req, res) {
  var requestOptions, path, productId;
  productId = req.body.productId;
  if(!productId) {
    library.sendJsonResponse(res, 404, 'productId not found, missing required information.');
  }

  path = '/api/products/' + productId;
  requestOptions = {
    url: apiOptions.server + path,
    method: 'GET',
    json: {},
    qs: {}
  };
  request(requestOptions, function (err, response, body) {
    var data = library.formatProductData(res, body);
    renderProductPage(req, res, data);
  });
}
