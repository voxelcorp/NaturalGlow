const mongoose = require('mongoose');
var readLine = require('readline');
var dbURI = 'mongodb://localhost/local';

mongoose.set('useFindAndModify', false);

mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;

//CONNECTED.
db.on('connected', function () {
  console.log('Mongoose connected to ' + dbURI);
});
//FAILED CONNECTION.
db.on('error', function(err) {
  console.log('Mongoose connection error: ' + err);
});
//DISCONNECTED.
db.on('disconnected', function () {
  console.log('Mongoose disconnected');
});

var gracefulShutdown = function (msg, callback) {
  db.close(function () {
    console.log('Mongoose disconnected through ' + msg);
    callback();
  });
}
//CREATE SIGNAL.
if(process.platform === "win32") {
  var rl = readLine.createInterface ({
    input: process.stdin,
    output: process.stdout
  });
  rl.on ("SIGINT", function () {
    process.emit ("SIGINT");
  });
}
//NODEMON RESTART.
process.once('SIGUSR2', function () {
  gracefulShutdown('nodemon restart', function () {
    process.kill(process.pid, 'SIGUSR2');
  });
});
//APP TERMINATION.
process.on('SIGINT', function () {
  gracefulShutdown('app termination', function () {
    process.exit(0);
  });
});
//HEROKU APP TERMINATION.
process.on('SIGTERM', function () {
  gracefulShutdown('Heroku app shutdown', function () {
    process.exit(0);
  })
});

//SCHEMAS AND MODELS ADD HERE.
require('./products');
require('./ingredients');
require('./users');
require('./grid');
require('./orders');
