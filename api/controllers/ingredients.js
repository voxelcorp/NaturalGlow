//INGREDIENTS
//GLOBAL VARS
var mongoose = require('mongoose');
var Ingredient = mongoose.model('Ingredient');

//-----
//FUNCTIONS
var sendJsonResponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};

//OBJECTIVE: Gets all the ingredients from the db. SENT IN CALLBACK.
var getIngredients = function (res, callback) {
  Ingredient
    .find()
    .exec( function (err, ingredients) {
      if(!ingredients) {
        callback(null, null);
        return;
      }else if(err) {
        callback(err, null);
        return;
      }
      callback(null, ingredients);
    });
}

//OBJECTIVE: Loops threw all ingredients and checks if any of them as the name of the new ingredient.
var checkIngredientExists = function (res, ingredient, ingredients) {
  if(!ingredient) {
    sendJsonResponse(res, 404, 'missing ingredient to check.');
  }else if(!ingredients) {
    sendJsonResponse(res, 404, 'missing ingredients from db.');
  }
  for(var i = 0; i < ingredients.length; i++) {
    if(ingredient == ingredients[i].name) {
      return true;
    }
      return false;
  }
}

//-----
//MODULES

//OBJECTIVE: Get the ingredient details and save them in the database.
module.exports.saveIngredient = function (req, res, ingredient) {
  getIngredients(res, function (err, ingredients) {
    if(!ingredients) {
      sendJsonResponse(res, 404, "missing ingredient. couldn't save.");
    }else if(err) {
      sendJsonResponse(res, 400, err);
    }
    var ingredientCheck = checkIngredientExists(res, ingredient, ingredients);
    if(ingredientCheck != true) {
      Ingredient.create({
        name: ingredient
      }, function (err, newIngredient) {
        if(err) {
          sendJsonResponse(res, 400, err);
        }
        sendJsonResponse(res, 200, newIngredient);
      });
    }else {
      sendJsonResponse(res, 400, "Couldnt save, ingredient name already exists.");
    }
  });
}

//OBJECTIVE: Retrieves all ingredients from db. SENT IN JSON.
module.exports.allIngredients = function (req, res) {
  Ingredient
    .find()
    .exec( function (err, ingredients) {
      if(!ingredients) {
        sendJsonResponse(res, 404, 'ingredients were found in db.');
        return;
      }else if(err) {
        sendJsonResponse(res, 400, err);
        return;
      }
      sendJsonResponse(res, 200, ingredients);
    });
}
