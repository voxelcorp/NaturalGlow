//PRODUCTS CONTROLLER
//------------------
//GLOBAL VARS
var mongoose = require('mongoose');
var ingredientController = require('../controllers/ingredients');
var Product = mongoose.model('Product');

//-----
//FUNCTIONS
var sendJsonResponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};

//Gets the images from the product and deletes all of them. Adds the new images to the product after that.
var updateImages = function (res, req, newImages) {
  if(!req.params.productId) {
    sendJsonResponse(res, 404, "Not found, productId is required.");
  }
  Product
    .findById(req.params.productId)
    .select('images')
    .exec(function (err, product) {
      if(err) {
        sendJsonResponse(res, 400, err);
      }else {
        deleteOldImages(product);
        product.save(function (err, product) {
          if(err) {
            sendJsonResponse(res, 400, err);
          }else {
            addProductImages(newImages, res, product);
          }
        });
      }
  });
}

//Loops images field until array is found empty. Recursive.
var deleteOldImages = function (product) {
  for (var i = 0; i < product.images.length; i++) {
    product.images.pull(product.images[i]);
  }
  if(product.images.length == 0) {
    return product;
  } else {
    deleteOldImages(product);
  }
}

//Gets the images already grouped in array and stores them inside the assoc produt.
var addProductImages = function (res, product, newImages, mainImg) {
  if(!product) {
    sendJsonResponse(res, 404, "productId not found. Images not saved.");
  } else if(!newImages) {
    sendJsonResponse(res, 404, "Not found, images required.");
  } else if(!mainImg) {
    sendJsonResponse(res, 404, "Not found, main image name required.");
  } else {
    for (var i = 0; i < newImages.length; i++) {
      if(newImages[i] === mainImg) { //If the name its equal to main.
        product.images.push({
          path: newImages[i],
          main: 1
        });
      } else {
        product.images.push({
          path: newImages[i],
          main: 0
        });
      }
    }
    product.save(function (err, product) {
      if(err) {
        sendJsonResponse(res, 400, err);
      } else {
        sendJsonResponse(res, 201, product);
      }
    });
  }
};

//Gets the files and saves them into the choosen folder.
var saveImagesFiles = function (req, res, product) {
  let imagesToUpload = req.files['images'];
  let imagesName = new Array();
  if(!imagesToUpload) {
    sendJsonResponse(res, 404, 'no files were uploaded, images required.');
  } else if(imagesToUpload.length > 0) { //If there is more than one file it loops threw them.
    for(var i = 0; i < imagesToUpload.length; i++) {
      imagesName.push(imagesToUpload[i].name);
      moveFile(res, imagesToUpload[i]);
    }
  } else {
    imagesName.push(imagesToUpload.name);
    moveFile(res, imagesToUpload);
  }
  if(imagesName.length > 0) {
    if(!product) {
      sendJsonResponse(res, 404, "product not found. Couldnt add images.");
    }
    addProductImages(res, product, imagesName, req.body.mainImg);
  }
}

//Gets a file from the client and transfers it to the products folder inside the server.
var moveFile = function (res, file) {
  file.mv('public/images/products/'+file.name, function(err) {
    if(err) {
      sendJsonResponse(res, 400, err);
    }
  });
}

//-----
//MODULES

//>POST
//Creates one product.
module.exports.createProduct = function (req, res) {
  if(!req.body) {
    sendJsonResponse(res, 404, "missing information, couldn't create.");
  }
  for(ingredient in req.body.ingredient) {
    ingredientController.saveIngredient(null, res, req.body.ingredient[ingredient]);
  }
  // Product.create({
  //   name: req.body.name,
  //   quantity: req.body.quantity,
  //   quantityType: req.body.quantityType,
  //   price: req.body.price,
  //   description: req.body.description,
  //   stock: req.body.stock
  // }, function (err, product) {
  //   if(err) {
  //     sendJsonResponse(res, 400, err);
  //   } else {
  //     saveImagesFiles(req, res, product);
  //
  //   }
  // });
}

//>PUT
//Updates one product.
module.exports.updateProduct = function (req, res) {
  if(!req.params.productId) {
    sendJsonResponse(res, 404, "Not found, productId is required.");
    return;
  }
  Product
    .findById(req.params.productId)
    //.select('-images')
    .exec( function (err, product) {
      if(!product) {
        sendJsonResponse(res, 404, "productId not found.")
        return;
      } else if(err) {
        sendJsonResponse(res, 400, err);
        return;
      }
      product.name = req.body.name;
      product.quantity = req.body.quantity;
      product.quantityType = req.body.quantityType;
      product.price = req.body.price;
      product.description = req.body.description;
      if(req.body.stock) {
        product.stock = req.body.stock;
      }
      product.save(function (err, product) {
        if(err) {
          sendJsonResponse(res, 400, err);
        } else {
          updateImages(res, req, req.body.images);
        }
      });
  });
}

//>DELETE
//Deletes a product
module.exports.deleteProduct = function (req, res) {
  if(!req.params.productId) {
    sendJsonResponse(res, 404, "productId not found.");
  }
  Product
    .findById(req.params.productId)
    .exec(
      function (err, product) {
        product.remove(function(err, product) {
          if(err) {
            sendJsonResponse(res, 400, err);
          }else {
            sendJsonResponse(res, 200, "Product deleted.");
          }
        });
    });
}

//>GET
//Retrieves information from one specific produt.
module.exports.infoSingleProduct = function (req, res) {
  if(req.params && req.params.productId) {
    Product
      .findById(req.params.productId)
      .exec(function(err, product) {
        if(!product) {
            sendJsonResponse(res, 404, "product not found.");
            return;
        } else if(err) {
          sendJsonResponse(res, 404, err);
          return;
        }
        sendJsonResponse(res, 200, product);
    });
  } else {
    sendJsonResponse(res, 404, "missing productId in request.");
  }
}

//Retrieves all products
module.exports.allProducts = function (req, res) {
  Product
    .find()
    .exec(function (err, products) {
      if(err) {
        sendJsonResponse(res, 400, err);
      }else {
        if(products.length > 0) {
          sendJsonResponse(res, 200, products);
        }else {
          sendJsonResponse(res, 404, null);
        }
      }
  });
}
