//GENERAL FUNCTIONS USED ON MORE THEN ONE CONTROLLER. DRY APPROACH.
module.exports.request = require('request');
module.exports.apiOptions = {
  server: 'http://localhost:3000'
};

//Protocol for messages.
module.exports.sendJsonResponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};
