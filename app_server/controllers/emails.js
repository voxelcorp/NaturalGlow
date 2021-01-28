//EMAIL MANAGEMENT.
var library = require('../controllers/library');
var apiOptions = library.apiOptions;
var request = library.request;
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
var axios = require('axios');

//Encrypts the email to be sent by email.
var tokenUserEmail = function (email) {
  if(!email) {
    console.log('missing email.');
    return null;
  }
  var expiry = Math.floor(Date.now() / 1000) + (60 * 10); //10min expiration.
  return jwt.sign({
    email: email,
    exp: expiry,
  }, process.env.JWT_SECRET);
}

//Creates the email process.
var emailConfig = function (to, emailType) {
  if(!to || !emailType) {
    console.log('missing info. couldnt config email.');
    return;
  }
  var tokenEmail = tokenUserEmail(to);
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SHOP_EMAIL,
      pass: process.env.SHOP_EMAIL_PW
    }
  });

  var mailContent = emailTexts(emailType, tokenEmail);
  var mailOptions = {
    from: 'Natural Glow',
    to: to,
    subject: mailContent.subject,
    html: mailContent.html
  }

  transporter.sendMail(mailOptions, function (err, info) {
    if(err) {
      console.log(err);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}



//---
//MODULES
module.exports.sendEmail = function (req, res) {
  if(!req.params.to || !req.params.subject) {
    library.sendJsonResponse(res, 404, 'missing info.');
    return;
  }
  emailConfig(req.params.to, req.params.subject);
  library.sendJsonResponse(res, 200, 'done.');
}

//Renders page with form to insert email for verification.
module.exports.emailPage = function (req,res) {
  if(!req.params.subject) {
    library.sendJsonResponse(res, 404, 'missing subject.');
    return;
  }
  var subjects = {
    1: 'Verificação de email',
    2: 'Alteração de senha'
  };

  res.render('sendEmail', {
    title: 'Verficação de email',
    pageTitle: subjects[req.params.subject],
    subject: req.params.subject
  });
}

//RESPONSES - Retrieves the token from the email sent to the user to verify his email.

//Updates user email verification in db.
module.exports.confirmEmail = function (req, res) {
  var decodedEmail = decodeEmail(req, res);
  if(!decodeEmail) {
    library.sendJsonResponse(res, 404, 'missing email.');
    return;
  }
  if(decodedEmail) {
    if(Date.now() >= decodedEmail.exp * 1000) {
      res.redirect('/');
      return;
    }
    axios.post(apiOptions.server+'/api/user/emailConfirm', {
      email: decodedEmail.email
    })
    .then(function (validation) {
      if(validation.status === 200) {
        res.redirect('/');
      }
    })
    .catch(function (err) {
      library.sendJsonResponse(res, 400, err);
    });
  }
}

//Updates the user password in db.
module.exports.newPwPage = function (req, res) {
  var decodedEmail = decodeEmail(req, res);
  if(!decodeEmail) {
    library.sendJsonResponse(res, 404, 'missing email.');
    return;
  }
  if(Date.now() >= decodedEmail.exp * 1000) {
    res.redirect('/');
    return;
  }
  res.render('newPw', {
    pageTitle: 'Criar nova senha',
    userEmail: decodedEmail.email
  });
}

//---
//Stores all the emails pre-defined to be sent to the user by type number.
//Token used to know which user is participating in email.
//TYPES:
// 1 - EMAIL CONFIRMATION
var emailTexts = function (type, emailToken) {
  var website = 'http://localhost:3000/emailResponse/' + emailToken;
  var confirmedEmailText = '';
  var subject = 'Natural Glow - informação'; //General email subject.
  var greetings = '<br><p>Melhores cumprimentos, Natural Glow.</p><br>';
  //EMAIL CONFIRMATION
  if(type == 1) {
    subject = 'Natural Glow - Conta criada.'
    confirmedEmailText += '<p>Bem vindo à comunidade da Natural Glow. Estamos muito felizes por ter começado a sua bela jornada no mundo natural.</p><br><p>Para verificar a sua conta por favor clique na hiperligação abaixo.</p>' + greetings;
    confirmedEmailText += '<a href="' + website + '/confirm">Clique aqui: ' + website + '/confirm</a>';
  }else if(type == 2) {
    subject = 'Natural Glow - Pedido de alteração de senha.';
    confirmedEmailText += '<p>Verificamos que efectou um pedido de alteração de senha para a sua conta Natural Glow. Tendo isso em conta pedimos que para criar uma senha nova clique na hiperligação abaixo.</p><br>'
    confirmedEmailText += '<p>Ficamos ansiosos por o ver novamente na nossa loja de cosméticos naturais.</p>' + greetings;
    confirmedEmailText += '<a href="' + website + '/changePw">Clique aqui: ' + website + '/changePw</a>';
  }else if(type == 3) {
    subject = 'Natural Glow - Alteração de senha.';
    confirmedEmailText += '<p>Temos o prazer de informar que a senha da sua conta foi alterada com sucesso. Sinta-se a vontade de entrar com a sua nova senha no futuro próximo.</p>' + greetings;
  }
  return {
    html: confirmedEmailText,
    subject: subject
  }
}

//Using server key from .env file.
var decodeEmail = function (req, res) {
  if(!req.params.email) {
    return null;
  }
  return jwt.verify(req.params.email, process.env.JWT_SECRET, function (err, decoded) {
    if(err) {
      res.redirect('/');
    }else {
      return decoded;
    }
  });
}
