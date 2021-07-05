var passport = require('passport');
var mongoose = require('mongoose');
var library = require('../controllers/library');
var User = mongoose.model('User');

module.exports.register = function (req, res) {
  if(!req.body.name || !req.body.username || !req.body.email || !req.body.password) {
    library.sendJsonResponse(res, 400, 'All fields required.');
    return;
  }

  var user = new User();

  user.name = req.body.name;
  user.username = req.body.username;
  user.email = req.body.email;

  user.setPassword (req.body.password);

  user.save(function (err) {
    var token;
    if(err) {
      library.sendJsonResponse(res, 404, err);
    } else {
      token = user.generateJwt();
      library.sendJsonResponse(res, 200, {"token" : token});
    }
  })
}

module.exports.login = function (req, res) {
  if(!req.body.username || !req.body.password) {
    library.sendJsonResponse(res, 400, 'All fields required.');
    return;
  }

  passport.authenticate('local', function (err, user, info) {
    var token;
    if (err) {
      library.sendJsonResponse(res, 404, err);
      return;
    }
    if(user) {
      if(user.verified === false) {
        library.sendJsonResponse(res, 403, 'missing validation.')
        return;
      }
      token = user.generateJwt();
      req.session.token = token;
      req.session.username = user.username;
      req.session.admin = user.admin;
      req.session.cart = new Array();
      res.redirect('/');
    } else {
      library.sendJsonResponse(res, 401, info);
    }
  }) (req, res);
}

//UPDATES
//Changes the verify value to true for the user.
module.exports.verifyEmail = function (req, res) {
  if(!req.body.email) {
    library.sendJsonResponse(res, 404, 'missing email.');
  }

  User.findOne({email: req.body.email})
  .exec(function (err, user) {
    if(err) {
      library.sendJsonResponse(res, 400, err);
    }
    if(!user) {
      library.sendJsonResponse(res, 404, 'user with requested email not found.');
      return;
    }
    if(user.verified == true) {
      library.sendJsonResponse(res, 200, 'email was already verificated.');
      return;
    }
    user.verified = true;
    user.save(function (err, updatedUser) {
      if(err) {
        library.sendJsonResponse(res, 400, err);
      }
      library.sendJsonResponse(res, 200, 'email verification updated.');
    })
  });
}

//Changes the forgotten password to the new inputted by user.
module.exports.changePw = function (req, res) {
  if(!req.body.newPw) {
    library.sendJsonResponse(res, 404, 'couldnt make changes, missing new password.');
    return;
  }else if(!req.body.email) {
    library.sendJsonResponse(res, 404, 'couldnt make search, missing email.');
    return;
  }else {
    var newPW = req.body.newPw;
    getUserByEmail(req.body.email, res, function (user) {
      if(user.validPassword(newPW)) {
        library.sendJsonResponse(res, 401, 'new password needs to be different to database.');
        return;
      }else {
        // Changing password inside profile page.
        if(req.body.currentPw && !user.validPassword(req.body.currentPw)) {
          library.sendJsonResponse(res, 406, 'password incorrect.');
          return;
        }
        user.setPassword(newPW);
        user.save(function (err, updatedUser) {
          if(err) {
            library.sendJsonResponse(res, 400, err);
            return;
          }
          library.sendJsonResponse(res, 200, 'password changed successfully.');
        })
      }
    });
  }
}

//Detects the params that were sent to be updated and makes the required changes.
module.exports.updateUserInfo = function (req, res) {
  var updateData = detectData(req, res);
  var email = detectEmail(req, res);
  if(!updateData) {
    library.sendJsonResponse(res, 404, 'missing update data.');
    return;
  }else if(!email) {
    library.sendJsonResponse(res, 404, 'missing email.');
    return;
  }
  getUserByEmail(email, res, function (user) {
    if(!user) {
      library.sendJsonResponse(res, 404, 'no user found.');
      return;
    }
    var user = changeUserInfo(user, updateData);
    if(user == null) {
      library.sendJsonResponse(res, 404, 'no changes found.');
      return;
    }
    user.save(function (err, user) {
      if(err) {
        library.sendJsonResponse(res, 304, err);
        return;
      }
      //After changes recreate token based on new data.
      token = user.generateJwt();
      req.session.token = token;
      req.session.username = user.username;
      library.sendJsonResponse(res, 200, user);
      return;
    });
  });
}

//Check if user as data field and if so updates it.
var changeUserInfo = function (user, updateData) {
  if(!user) {
    return null;
  }else if(!updateData) {
    return null;
  }
  for(userInfo in updateData) { //Email verified. Update approved.
    if(user[userInfo] && userInfo == 'email' && updateData[userInfo] != updateData['id']) {
      if(updateData['verified'] && updateData['verified'] == true) {
        user.updateEmail(updateData[userInfo]);
      }else { //Send email to be updated.
        user.verifyEmailUpdate(updateData[userInfo], updateData['id']);
      }
    }else {
      user[userInfo] = updateData[userInfo];
    }
  }
  return user;
}

//Check if post exists.
var detectData = function (req, res) {
  var data;
  if(req.body) {
    data = req.body;
  }
  if(!data) {
    library.sendJsonResponse(res, 404, 'missing update data');
    return null;
  }
  return data;
}

//Retrieve email from post. Email is used as the user identifier.
var detectEmail = function (req, res) {
  var email;
  if(req.body.id) {
    email = req.body.id;
  }
  if(!email) {
    library.sendJsonResponse(res, 404, 'missing email.');
    return null;
  }
  return email;
}
//---
//GETS
//Returns user by username.
module.exports.getUser = function (req, res) {
  if(!req.params.username) {
    library.sendJsonResponse(res, 404, 'couldnt make search, missing username.');
  }

  User.findOne({username: req.params.username})
  .exec(function (err, data) {
    if(err) {
      library.sendJsonResponse(res, 400, err);
    }
    if(data == null) {
      library.sendJsonResponse(res, 204, 'username not found.');
    }else {
      library.sendJsonResponse(res, 200, data);
    }
  });
}

//Returns user by email.
module.exports.getEmail = function (req, res) {
  getUserByEmail(req.params.email, res);
}

//FUNCTIONS

//Returns user by email. Gives option to use user data by callback.
var getUserByEmail = function (email, res, callback = null) {
  if(!email) {
    library.sendJsonResponse(res, 404, 'couldnt make search, missing email.');
  }
  User.findOne({email: email})
  .exec(function (err, data) {
    if(err) {
      library.sendJsonResponse(res, 400, err);
      return;
    }
    if(data == null) {
      library.sendJsonResponse(res, 204, 'user not found.');
      return;
    }else {
      if(callback) {
        callback(data);
      }else {
        library.sendJsonResponse(res, 200, data);
        return;
      }
    }
  });
}
