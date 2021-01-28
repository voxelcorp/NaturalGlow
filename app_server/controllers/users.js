//USERS INFORMATION.
var library = require('../controllers/library');
var apiOptions = library.apiOptions;
var request = library.request;

//Display page only if there is no session.
module.exports.userRegister = function (req, res) {
  var username = library.checkUsername(req);
  if(username) {
    res.redirect('/');
  }
  res.render('register', {
    title: 'Nova conta'
  });
}

//Create profile page with logged user details.
module.exports.profilePage = function (req, res) {
  res.render('register', {
    title: 'Nova conta'
  });
}
