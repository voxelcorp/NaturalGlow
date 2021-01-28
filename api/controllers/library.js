//GENERAL FUNCTIONS USED ON MORE THEN ONE CONTROLLER. DRY APPROACH.

//Protocol for messages.
module.exports.sendJsonResponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};
