//GENERAL FUNCTIONS USED ON MORE THEN ONE CONTROLLER. DRY APPROACH.
const fs = require('fs');
const jwt = require('jsonwebtoken');
const aws = require('aws-sdk');
const uploadAWS = require('../controllers/uploadAWS');
module.exports.request = require('request');
module.exports.aws = uploadAWS;
module.exports.apiOptions = {
  server: 'http://localhost:3000'
};

//Encrypts the email to be sent by email.
module.exports.tokenInfo = function (info) {
  if(!info) {
    console.log('missing email.');
    return null;
  }
  var expiry = Math.floor(Date.now() / 1000) + (60 * 10); //10min expiration.
  return jwt.sign({
    info: info,
    exp: expiry,
  }, process.env.JWT_SECRET);
}

//Protocol for messages.
module.exports.sendJsonResponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.orderStatusMeaning = function (orders) {
  if(!orders) {
    return null;
  }
  //SAME IN admin.js FrontEND
  var statusArray = {
    0: "Pagamento em espera",
    1: "A ser fabricado",
    2: "A preparar envio",
    3: "Enviado",
    4: "Entregue"
  }
  for(order in orders) {
    orders[order].status = statusArray[orders[order].status];
    orders[order].orderTotal = parseFloat(orders[order].orderTotal).toFixed(2);
  }
  return orders;
}
