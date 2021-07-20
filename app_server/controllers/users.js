//USERS INFORMATION.
var library = require('../controllers/library');
var apiOptions = library.apiOptions;
var request = library.request;
var axios = require('axios');


//Display page only if there is no session.
module.exports.userRegister = function (req, res) {
  var username = library.checkUser(req).username;
  if(username) {
    res.redirect('/');
  }
  res.render('register', {
    title: 'Nova conta'
  });
}

//Create profile page with logged user details.
module.exports.profilePage = function (req, res) {
  var username = library.checkUser(req).username;
  if(username == null) {
    console.log('session not found.');
    res.redirect('/');
  }
  getUserData(username, 1).then(async function (userData) {
    res.render('profile', {
      username: userData.username,
      userData: userData,
      title: 'Nova conta'
    });
  });
}

//Logout user.
module.exports.logout = function (req, res) {
  if(req.session) {
    req.session.destroy();
  }
  library.sendJsonResponse(res, 200, 'logout done.');
}

//FUNCTIONS

//User can be found by email or username. Type depends on the search method.
// 1 - username
// 2 - email
var getUserData = async function (id, type) {
  if(!id || !type) {
    console.log('missing search info.');
    return null;
  }
  var url;
  if(type == 1) {
    url = '/api/user/username/' + id;
  }else if(type == 2) {
    url = '/api/user/email/' + id;
  }
  var userData = await axios.get(apiOptions.server+url)
  .then(function (res) {
    return res.data;
  })
  .catch(function (err) {
    console.log(err.response.status);
  });
  return userData;
}
