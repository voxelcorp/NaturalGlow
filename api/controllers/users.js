var passport = require('passport');
var mongoose = require('mongoose');
var library = require('../controllers/library');
var User = mongoose.model('User');

module.exports.register = function (req, res) {
  if(!req.body.name || !req.body.username || !req.body.email || !req.body.password) {
    console.log(req.body);
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
  }else if(!req.body.email) {
    library.sendJsonResponse(res, 404, 'couldnt make search, missing email.');
  }else {
    var newPW = req.body.newPw;
    getUserByEmail(req.body.email, res, function (user) {
      if(user.validPassword(newPW)) {
        library.sendJsonResponse(res, 401, 'new password needs to be different to database.');
      }else {
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
    }
    if(data == null) {
      library.sendJsonResponse(res, 204, 'user not found.');
    }else {
      if(callback) {
        callback(data);
      }else {
        library.sendJsonResponse(res, 200, data);
      }
    }
  });
}
