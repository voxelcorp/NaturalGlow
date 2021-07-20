//PRODUCTS INFORMATION.
var library = require('../controllers/library');
var apiOptions = library.apiOptions;
var request = library.request;
var axios = require('axios');

var allGrids = async function () {
  var grids = await axios.get(apiOptions.server+'/api/grids')
  .then((data) => {
    if(!data.data) {
      return [];
    }
    return data.data;
  })
  .catch((err) => {
    return err;
  });

  if(grids.length > 0) {
    return grids;
  }else {
    return [];
  }
}

//HOMEPAGE
var renderHomepage = async function (req, res, productData) {
  let storeRandomProducts = function () {
    let randomProducts = [];
    while(randomProducts.length < 3) {
      let nextProductIndex = library.getRandomInt(0, Object.keys(productData).length -1);
      let nextProduct = productData[Object.keys(productData)[nextProductIndex]];
      if(!randomProducts.includes(nextProduct)) {
        randomProducts.push(nextProduct);
      }
    }
    return randomProducts;
  }

  var grids = {};
  let pageProducts = [];
  var grids = await allGrids();
  if(Object.keys(productData).length > 0) {
    pageProducts = storeRandomProducts();
  }
  res.render('homepage', {
    grids: grids,
    title: 'Natural Glow',
    pageProducts: pageProducts,
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
    ProductIngredients: productData.ingredients,
    ProductDescription: productData.description,
    JSONProduct: JSON.stringify(productData)
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

module.exports.renderSectionPage = async function (req, res) {
  if(!req.body || !req.body.sectionId || !req.body.sectionTitle) {
    res.redirect('/');
  }
  var products = await axios.post(apiOptions.server+'/api/products/section', {sectionId: req.body.sectionId});
  var productsData = library.formatProductData(res, products.data);
  res.render('section', {
    title: req.body.sectionTitle,
    pageProducts: productsData,
  });
}
