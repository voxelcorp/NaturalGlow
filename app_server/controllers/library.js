module.exports.request = require('request');
module.exports.apiOptions = {
  server: 'http://localhost:3000'
};

//Check if session exists.
module.exports.checkUser = function (req) {
  if(req.session) {
    return req.session;
  }else {
    return null;
  }
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
  if(!data || data.length <= 0) {
    return {};
  }
  var formatedProduct = {};
  if(Array.isArray(data) == true) {
    for (var i = 0; i < data.length; i++) {
      formatedProduct[i] = storeProductData(res, data[i]);
    }
  } else {
    formatedProduct = storeProductData(res, data);
  }
  return formatedProduct;
}

var storeProductData = function (res, data) {
  var stored = {};
  var mainImg = "/images/products/" + detectMain(res, data.images);
  stored = loopProduct(data);
  stored.mainImg = mainImg;
  return stored;
}

//Gets a product and loops threw it making the required changes.
var loopProduct = function (product) {
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
