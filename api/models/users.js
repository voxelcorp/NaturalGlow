var library = require('../controllers/library');
var apiOptions = library.apiOptions;

var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var axios = require('axios');

var userSchema = new mongoose.Schema({
  email: {type: String, unique: true, required: true},
  username: {type: String, unique: true, required: true},
  name: {type: String, required: true},
  hash: String,
  salt: String,
  admin: {type: Boolean, default: false},
  verified: {type: Boolean, default: false}
});

userSchema.methods.verifyEmailUpdate = function (email, id) {
  axios.get(apiOptions.server+'/email/' + email + '/4/' + id)
  .then(function (res) {
    console.log('email sent.');
  })
  .catch(function (err) {
    console.log(err);
    return;
  });
}

userSchema.methods.updateEmail = function (email) {
  this.email = email;
  this.verified = true;
}

userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex');
}

userSchema.methods.validPassword = function (password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex');
  return this.hash === hash;
}

userSchema.methods.generateJwt = function () {
  var expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign({
    _id: this._id,
    username: this.username,
    email: this.email,
    name: this.name,
    admin: this.admin,
    exp: parseInt(expiry.getTime() / 1000),
  }, process.env.JWT_SECRET);
}

mongoose.model('User', userSchema);
