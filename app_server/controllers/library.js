module.exports.request = require('request');
module.exports.apiOptions = {
  server: 'http://localhost:3000'
}

module.exports.sendJsonResponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};

var sendJsonResponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};

//Gets data and does the required changes to it for accessibility porpuses.
module.exports.formatProductData = function (res, data) {
  var productImagesFolder = "/images/products/";
  if(!data || data.length <= 0) {
    return {};
  }
  var formatedProduct = {};
  if(Array.isArray(data) == true) {

    for (var i = 0; i < data.length; i++) {
      var mainImg = productImagesFolder + detectMain(res, data[i].images);
      formatedProduct[i] = loopProduct(res, data[i]);
      formatedProduct[i].mainImg = mainImg;
    }
  } else {
    var mainImg = productImagesFolder + detectMain(res, data.images);
    formatedProduct = loopProduct(res, data);
    formatedProduct.mainImg = mainImg;
  }
  return formatedProduct;
}

//Gets a product and loops threw it making the required changes.
var loopProduct = function (res, product) {
  if(!product) {
    return {};
  }
  var data = {};
  for(detail in product) {
    if(detail == 'price') {
      product[detail] = parseFloat(product[detail].$numberDecimal); //converts Decimal128 retrieved mongodb value to a float.
    }
    data[detail] = product[detail];
  }
  return data;
}

//Detects the image with a value of 1 in the "main" property.
var detectMain = function (res, data) {
  var mainImg;
  if(!data) {
    sendJsonResponse(res, 404, 'Not found, images required.');
    return null;
  } else {
    for(var i = 0; i < data.length; i++) {
      if(data[i].main == 1) {
        mainImg = data[i].path;
        break;
      }
    }
    return mainImg;
  }
}
