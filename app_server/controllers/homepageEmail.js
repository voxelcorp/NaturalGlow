//EMAIL MANAGEMENT.
var library = require('../controllers/library');
var apiOptions = library.apiOptions;
var nodemailer = require('nodemailer');

//Encrypts the email to be sent by email.

//Creates the email process.
var emailConfig = function (clientName, clientEmail, subject, description, res) {
  if(!clientName || !clientEmail || !subject || !description) {
    console.log('missing info. couldnt config email.');
    return;
  }
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SHOP_EMAIL,
      pass: process.env.SHOP_EMAIL_PW
    }
  });

  var mailOptions = {
    from: "Novo Cliente",
    to: process.env.SHOP_EMAIL,
    subject: subject,
    text: 'Email enviado a partir do formulário do site. | Site '+process.env.SHOP_NAME+' \n Nome Cliente: '+ clientName +'\n Email Cliente: '+ clientEmail +' \n\n' + description
  }

  transporter.sendMail(mailOptions, function (err, info) {
    if(err) {
      console.log(err);
      library.sendJsonResponse(res, 400, err);
    } else {
      console.log('Email sent: ' + info.response);
      library.sendJsonResponse(res, 200, "sent");
    }
  });
}



//---
//MODULES
module.exports.sendAnonymousEmail = function (req, res) {
  var data = JSON.parse(req.body.data);
  if(!data.senderName || !data.senderEmail || !data.senderSubject|| !data.senderContent) {
    library.sendJsonResponse(res, 404, 'missing info.');
    return;
  }
  emailConfig(data.senderName, data.senderEmail, data.senderSubject, data.senderContent, res);
}
