//PRODUCTS CONTROLLER
//------------------
//GLOBAL VARS
var mongoose = require('mongoose');
var ingredientController = require('../controllers/ingredients');
var library = require('../controllers/library');
var Product = mongoose.model('Product');
var Grid = mongoose.model('Grid');
const fs = require('fs');

//-----
//FUNCTIONS

//GERERAL

//NOTE: TO BE IMPROVED
var parseMultipleArray = function (multipleArray) {
  if(!multipleArray) {
    return {};
  }
  var parsedArray = JSON.parse(multipleArray);
  for(array in parsedArray) {
    parsedArray[array] = JSON.parse(parsedArray[array]);
  }
  return parsedArray;
}

//Sends data to be posted to a given url.
var postData = function(res, url, data) {
  url = encodeURIComponent(url);
  data = encodeURIComponent(JSON.stringify(data));
  res.redirect('/api/post/'+url+"/"+data);
}

//-----

//Gets the images from the product and deletes all of them. Adds the new images to the product after that.
var updateImages = function (res, req, newImages) {
  if(!req.params.productId) {
    library.sendJsonResponse(res, 404, "Not found, productId is required.");
  }
  Product
    .findById(req.params.productId)
    .select('images')
    .exec(function (err, product) {
      if(err) {
        library.sendJsonResponse(res, 400, err);
      }else {
        deleteOldImages(product);
        product.save(function (err, product) {
          if(err) {
            library.sendJsonResponse(res, 400, err);
          }else {
            addProductImages(newImages, res, product);
          }
        });
      }
  });
}

//Loops images field until array is found empty. Recursive.
var deleteAllImages = function (product) {
  for (var i = 0; i < product.images.length; i++) {
    product.images.pull(product.images[i]);
  }
  if(product.images.length == 0) {
    return product;
  } else {
    deleteAllImages(product);
  }
}

//Loops ingredients field until array is found empty. Recursive.
var deleteAllIngredients = function (product) {
  for (var i = 0; i < product.ingredients.length; i++) {
    product.ingredients.pull(product.ingredients[i]);
  }
  if(product.ingredients.length == 0) {
    return product;
  } else {
    deleteAllIngredients(product);
  }
}

//Gets the images already grouped in array and stores them inside the assoc produt.
var addProductImages = function (res, product, newImages, mainImg) {
  if(!product) {
    library.sendJsonResponse(res, 404, "productId not found. Images not saved.");
  } else if(!newImages) {
    library.sendJsonResponse(res, 404, "Not found, images required.");
  } else if(!mainImg) {
    library.sendJsonResponse(res, 404, "Not found, main image name required.");
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
  }
};

//Gets the files and saves them into the choosen folder.
var saveImagesFiles = function (req, res, product) {
  if(!req.files) {
    return;
  }else {
    let imagesToUpload = parseMultipleArray(req.body.choosenImages)["new"];
    let imagesName = new Array();
    if(!imagesToUpload) {
      library.sendJsonResponse(res, 404, 'no files were uploaded, images required.');
    } else if(Object.keys(imagesToUpload).length > 0) { //If there is more than one file it loops threw them.
      for(img in imagesToUpload) {
        imagesName.push(imagesToUpload[img].path);
      }
    } else {
        imagesName.push(imagesToUpload.path);
    }
    if(imagesName.length > 0) {
      if(!product) {
        library.sendJsonResponse(res, 404, "product not found. Couldnt add images.");
      }
      addProductImages(res, product, imagesName, req.body.mainImg);
    }
  }
}

//Check if image was choosen by user.
var checkImage = function (req, imageToCheck, checkType = null) {
  if(!imageToCheck) {
    return null;
  }
  var choosenImages = parseMultipleArray(req.body.choosenImages);
  if(checkType == 'new' || checkType == 'all') {
    for(image in choosenImages['new']) {
      if(choosenImages['new'][image].path == imageToCheck) {
        return true;
      }
    }
  }else if(checkType == 'current' || checkType == 'all') {
    for(image in choosenImages['current']) {
      if(choosenImages['current'][image].path == imageToCheck) {
        return true;
      }
    }
  }
  return false;
}

//Checks if any of the saved images in the database are wanted by the user. if not remove them from the database folder.
var removeImages = function(res, req, productImages) {
  var check;
  for(var i = 0; i < productImages.length; i++) {
    var imgName = productImages[i].path;
    check = checkImage(req, imgName, 'current');
    if(check == false) {
      library.aws.deleteImg(imgName);
    }
  }
}

//Get all subdocuments from a product and saves them after creation or in update.
var modifyProductSubdocuments = function(res, req, product, modifyType = null) {
  if(!product) {
    library.sendJsonResponse(res, 404, 'missing product.');
  }else if(!req) {
    library.sendJsonResponse(res, 404, 'missing data to be saved.');
  }

  if(modifyType == 'update') { //Update must be threw this order.
    removeImages(res, req, product.images);
    deleteAllImages(product);
    deleteAllIngredients(product);
    var choosenImages = parseMultipleArray(req.body.choosenImages).current;
    for(img in choosenImages) {
      product.images.push(choosenImages[img]);
    }
  }

  loopProductIngredients(res, req.body.ingredient, product);
  saveImagesFiles(req, res, product);

  product.save(function (err, updatedProduct) { //Only updates images. I imagine is because of the callback done when saving the ingredients.
    if(err) {
      library.sendJsonResponse(res, 400, err);
    }
    updatedProduct.save(function(err, finalProduct) {
      if(err) {
        library.sendJsonResponse(res, 400, err);
      }
      postData(res, '/product', {productId: product._id});
    });
  });
}

// -> INGREDIENTS <-

var saveIngredientInProduct = function (res, ingredient, product) {
  ingredientController.saveIngredient(null, res, ingredient, function(ingredientInDb) {
    if(!ingredientInDb) {
      library.sendJsonResponse(res, 404, 'missing ingredient. check db.');
    }
    product.ingredients.push({
      id: ingredientInDb.id,
      name: ingredientInDb.name
    });
  });
}

//Get ingredient and save it on product and on db.
var loopProductIngredients = function (res, ingredientsToSave, product) {
  if(!product) {
    library.sendJsonResponse(res, 404, 'missing product. couldnt save.');
  }else if(!ingredientsToSave) {
    library.sendJsonResponse(res, 404, 'missing ingredients. couldnt save.');
  }
  if(Array.isArray(ingredientsToSave) === true) {
    for(ingredient in ingredientsToSave) {
      saveIngredientInProduct(res, ingredientsToSave[ingredient], product);
    }
  }else {
    saveIngredientInProduct(res, ingredientsToSave, product);
  }
}


//-----
//MODULES

//>POST
//Creates one product.
module.exports.createProduct = function (req, res) {
  if(!req.body) {
    library.sendJsonResponse(res, 404, "missing information, couldn't create.");
  }
  Product.create({
    name: req.body.name,
    quantity: req.body.quantity,
    quantityType: req.body.quantityType,
    price: req.body.price,
    description: req.body.description,
    stock: req.body.stock,
    tag: mongoose.Types.ObjectId(req.body.productTag)
  }, function (err, product) {
    if(err) {
      library.sendJsonResponse(res, 400, err);
    } else {
      product.save(function (err, product) {
        if(err) {
          library.sendJsonResponse(res, 400, err);
        }
        modifyProductSubdocuments(res, req, product);
      });
    }
  });
}

//>PUT
//Updates one product.
module.exports.updateProduct = function (req, res) {
  if(!req.params.productId) {
    library.sendJsonResponse(res, 404, "Not found, productId is required.");
    return;
  }
  Product
    .findById(req.params.productId)
    .exec( function (err, product) {
      if(!product) {
        library.sendJsonResponse(res, 404, "productId not found.")
        return;
      } else if(err) {
        library.sendJsonResponse(res, 400, err);
        return;
      }
      product.name = req.body.name;
      product.quantity = req.body.quantity;
      product.quantityType = req.body.quantityType;
      product.price = req.body.price;
      product.description = req.body.description;
      product.tag = mongoose.Types.ObjectId(req.body.productTag);
      if(req.body.stock) {
        product.stock = req.body.stock;
      }
      product.save(function (err, product) {
        if(err) {
          library.sendJsonResponse(res, 400, err);
        } else {
          modifyProductSubdocuments(res, req, product, 'update');
        }
      });
  });
}

//>DELETE
//Deletes a product
module.exports.deleteProduct = function (req, res) {
  if(!req.params.productId) {
    library.sendJsonResponse(res, 404, "productId not found.");
  }
  Product
    .findById(req.params.productId)
    .exec(
      function (err, product) {
        if(!product) {
          library.sendJsonResponse(res, 404, 'productId not found.');
        }
        for(img in product.images) {
          let currentImg = product.images[img];
          library.aws.deleteImg(product.images[img].path);
        }
        product.remove(function(err, product) {
          if(err) {
            library.sendJsonResponse(res, 400, err);
          }else {
            if(!product) {
              library.sendJsonResponse(res, 404, 'productId not found.');
            }
            res.redirect('/admin');
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
            library.sendJsonResponse(res, 404, "product not found.");
            return;
        } else if(err) {
          library.sendJsonResponse(res, 404, err);
          return;
        }
        library.sendJsonResponse(res, 200, product);
    });
  } else {
    library.sendJsonResponse(res, 404, "missing productId in request.");
  }
}

//Retrieves all products
module.exports.allProducts = function (req, res) {
  Product
    .find()
    .exec(function (err, products) {
      if(err) {
        library.sendJsonResponse(res, 400, err);
      }else {
        if(products.length > 0) {
          library.sendJsonResponse(res, 200, products);
        }else {
          library.sendJsonResponse(res, 200, []);
        }
      }
  });
}

module.exports.productsBySection = function (req, res) {
  if(!req.body.sectionId) {
    library.sendJsonResponse(res, 404, "missing section id.");
    return;
  }
  Product
  .find({"tag": mongoose.Types.ObjectId(req.body.sectionId)})
  .exec(function (err, products) {
    if(err) {
      library.sendJsonResponse(res, 400, err);
    }
    if(products.length > 0) {
      library.sendJsonResponse(res, 200, products);
    }else {
      library.sendJsonResponse(res, 200, []);
    }
  });
}

var getAllGridsID = async function () {
  return await Grid.find({});
}

module.exports.productsWithoutSection = async function (req, res) {
  let grids = await getAllGridsID();
  let products = await Product.find({});
  if(!grids || grids.length == 0) {
    library.sendJsonResponse(res, 200, products);
    return;
  }else if(!products || products.length == 0) {
    library.sendJsonResponse(res, 200, []);
    return;
  }
  let noSectionProducts = [];
  let sectionProducts = [];
  for(product in products) {
    for(details in grids) {
      for (section in grids[details]["sections"]) {
        let sectionDetails = grids[details]["sections"][section];
        if(String(products[product].tag) == String(sectionDetails._id)) {
          sectionProducts.push(products[product]._id);
        }
        if(!sectionProducts.includes(products[product]._id)) {
          if(!noSectionProducts.includes(products[product])) {
            noSectionProducts.push(products[product]);
          }
        }
      }
    }
  }
  library.sendJsonResponse(res, 200, noSectionProducts);
}
