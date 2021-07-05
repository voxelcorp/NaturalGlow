//INGREDIENTS
//GLOBAL VARS
var mongoose = require('mongoose');
var library = require('../controllers/library');
var Ingredient = mongoose.model('Ingredient');
var Product = mongoose.model('Product');

//-----
//FUNCTIONS

//OBJECTIVE: Retrieves all products which have the ingredient saved.
var productsByIngredient = async function (ingredientId, callback) {
  if(!ingredientId) {
    console.log('couldnt search. missing ingredient identifier.');
  }
  return await Product.find({"ingredients.id": String(ingredientId)}).exec();
}

//OBJECTIVE: Retrieves one ingredient by name
var getIngredientByParam = async function (param, callback = null) {
  if(!param) {
    console.log('couldnt search. missing parameter.');
    return;
  }
  return await Ingredient.findOne(param).exec();
}

//OBJECTIVE: Retrieves the params and return them in array format.
var getSearchMethod = function (req, res) {
  if(!req.params.paramType || !req.params.paramValue) {
    library.sendJsonResponse(res, 404, 'missing ingredient parameters.');
    return;
  }
  var param = {};
  param[req.params.paramType] = req.params.paramValue;
  return param;
}

//OBJECTIVE: Check if name is already being used in another ingredient.
var ingredientNameAvailable = async function (req, res) {
  if(!req.body || !req.body.id || !req.body.name) {
    library.sendJsonResponse(res, 404, 'missing ingredient information.');
    return;
  }
  var ingredient = await getIngredientByParam({name: req.body.name.toLowerCase()});
  if(ingredient && ingredient._id != req.body.id) {
    return false;
  }
  return true;
}

//OBJECTIVE: Gets all products with the ingredient id and saves them with updated name.
//Can be used to remove ingredients from products when ingredient is removed.
var updateProductsAssocToIngredient = async function (res, ingredientId, ingredientName) {
  var products = await productsByIngredient(ingredientId);
  if(!products) {
    library.sendJsonResponse(res, 200, 'products not found.');
    return;
  }
  for(product in products) {
    var productId = products[product]._id;
    var updated = await Product.findOneAndUpdate(
      {"_id": String(productId), "ingredients.id": String(ingredientId)},
      {
        "$set": {
          'ingredients.$.name': ingredientName
         }
       }).exec();
  }
  library.sendJsonResponse(res, 200, products);
}

//-----
//MODULES

module.exports.checkNameAvailable = async function (req, res) {
  if(!req.body.id || !req.body.name) {
    library.sendJsonResponse(res, 404, 'missing ingredient information.');
    return;
  }
  if(await ingredientNameAvailable(req, res) == false) {
    library.sendJsonResponse(res, 401, "ingredient name in use");
    return;
  }
  library.sendJsonResponse(res, 200, "name available");
}

//OBJECTIVE: Get the ingredient details and updates the changes made to them in the database.
module.exports.updateIngredient = async function (req, res) {
  if(!req.body || !req.body.id || !req.body.name) {
    library.sendJsonResponse(res, 404, 'missing ingredient information.');
    return;
  }else if(await ingredientNameAvailable(req, res) == false) {
    library.sendJsonResponse(res, 401, "ingredient name in use");
    return;
  }
  req.body.name = req.body.name.toLowerCase();

  var ingredient = await getIngredientByParam({_id: req.body.id});
  if(!ingredient) {
    library.sendJsonResponse(res, 404, 'ingredient not found.');
    return;
  }
  //Update ingredient info.
  for(property in req.body) {
    if(ingredient[property] && property != 'id') {
      ingredient[property] = req.body[property];
    }
  }
  ingredient.save(function (err, updatedIngredient) {
    if(err) {
      library.sendJsonResponse(res, 401, err);
      return;
    }
    updateProductsAssocToIngredient(res, ingredient._id, ingredient.name);
  });
}

//OBJECTIVE: Get the ingredient details and save them in the database.
module.exports.saveIngredient = async function (req, res, ingredientName = null, callback = null) {
  if(req && req.body.ingredientName) {
    ingredientName = req.body.ingredientName;
  }
  var ingredient = await getIngredientByParam({name: ingredientName});
  if(ingredient == null) {
    if(!ingredientName) {
      library.sendJsonResponse(res, 404, 'missing ingredient.');
    }
    Ingredient.create({
      name: ingredientName.toLowerCase()
    }, function (err, newIngredient) {
      if(err) {
        library.sendJsonResponse(res, 400, err);
      }
      if(callback != null) { //If being used as a middle ground function.
        callback(newIngredient);
      }else {
        library.sendJsonResponse(res, 200, newIngredient);
      }
    });
  }else {
    if(callback != null) { //If being used as a middle ground function.
      console.log(ingredient);
      callback(ingredient);
    }else {
      library.sendJsonResponse(res, 400, "Couldnt save, ingredient name already exists.");
    }
  }
}

//OBJECTIVE: Retrieves all ingredients from db. SENT IN JSON.
module.exports.allIngredients = function (req, res) {
  Ingredient
    .find()
    .select('-__v')
    .exec( function (err, ingredients) {
      if(!ingredients) {
        library.sendJsonResponse(res, 404, 'ingredients were found in db.');
        return;
      }else if(err) {
        library.sendJsonResponse(res, 400, err);
        return;
      }
      library.sendJsonResponse(res, 200, ingredients);
    });
}



//OBJECTIVE: Retrieves one ingredient by name. Uses external function.
module.exports.singleIngredient = async function (req, res) {
  var ingredient = await getIngredientByParam(getSearchMethod(req, res));
  if(!ingredient) {
    library.sendJsonResponse(res, 404, "ingredient not found.");
    return;
  }
  library.sendJsonResponse(res, 200, ingredient);
}

//OBJECTIVE: Retrieves all products which have this ingredient saved. Uses external function.
module.exports.productsByIngredient = async function (req, res) {
  var searchMethod = getSearchMethod(req, res);
  var ingredient = await getIngredientByParam(searchMethod);
  if(!ingredient) {
    library.sendJsonResponse(res, 404, 'ingredient not found.');
    return;
  }
  var products = await productsByIngredient(ingredient._id);
  if(!products) {
    library.sendJsonResponse(res, 404, 'products not found.');
    return;
  }
  library.sendJsonResponse(res, 200, products);
}

module.exports.removeIngredient = async function (req, res) {
  var searchMethod = getSearchMethod(req, res);
  var ingredient = await getIngredientByParam(searchMethod);
  if(!ingredient) {
    library.sendJsonResponse(res, 404, 'ingredient not found.');
    return;
  }
  var products = await productsByIngredient(ingredient._id);
  if(products) {
    await removeIngredientFromProducts(products, ingredient._id);
  }
  ingredient.remove();
  library.sendJsonResponse(res, 200, 'ingredient deleted.');
}

var removeIngredientFromProducts = async function (products, ingredientId) {
  if(!products || !ingredientId) {
    return;
  }
  for(product in products) {
    var updated = await Product.findOneAndUpdate(
      {"_id": String(products[product]._id)},
      {
        "$pull": {
          'ingredients': {"id": String(ingredientId)}
        },
       },{"new": true}).exec();
    console.log(updated);
    return;
  }
}
