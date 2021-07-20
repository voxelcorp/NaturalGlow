//EMAIL MANAGEMENT.
var library = require('../controllers/library');
var apiOptions = library.apiOptions;
var request = library.request;
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
var axios = require('axios');



//Creates the email process.
var emailConfig = function (to, emailType, id = null) {
  if(!to || !emailType) {
    console.log('missing info. couldnt config email.');
    return;
  }
  var tokenId;
  if(id != null) {
    tokenId = library.tokenInfo(id);
  }

  var tokenEmail = library.tokenInfo(to);
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SHOP_EMAIL,
      pass: process.env.SHOP_EMAIL_PW
    }
  });

  var mailContent = emailTexts(emailType, tokenEmail, tokenId);
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

var validateEmail = function (email) {
  if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) {
    return true;
  }
  return false;
}


//---
//MODULES
module.exports.sendEmail = function (req, res) {
  if(!req.params.to || !req.params.subject) {
    library.sendJsonResponse(res, 404, 'missing info.');
    return;
  }
  let email = req.params.to;
  if(validateEmail(email) == false) {
    email = decodeEmail(email).info;
  }

  if(req.params.userId) { //if email requires the user email besides the destination email.
    emailConfig(email, req.params.subject, req.params.userId);
  }else {
    emailConfig(email, req.params.subject);
  }
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
  var decodedEmail = decodeEmail(req.params.email, res);
  if(!decodeEmail) {
    library.sendJsonResponse(res, 404, 'missing email.');
    return;
  }
  axios.post(apiOptions.server+'/api/user/emailConfirm', {
    email: decodedEmail.info
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

//Updates user email in db. Already verified.
module.exports.confirmEmailUpdate = function (req, res) {
  var decodedEmail = decodeEmail(req.params.email, res);
  var decodedId = decodeEmail(req.params.id, res);
  if(!decodeEmail) {
    library.sendJsonResponse(res, 404, 'missing email.');
    return;
  }
  // Logout user before makeChanges.

  //Change user email in db.
  axios.post(apiOptions.server+'/api/user/changeUser', {
    email: decodedEmail.info,
    id: decodedId.info,
    verified: true
  })
  .then(function (data) {
    res.redirect('/profile');
  })
  .catch(function (err) {
    if(err.response.status == 304) {
      res.redirect('/profile');
    }else {
      library.sendJsonResponse(res, 400, err.response.data);
      return;
    }
  });
}

//Updates the user password in db.
module.exports.newPwPage = function (req, res) {
  var decodedEmail = decodeEmail(req.params.email, res);
  if(!decodeEmail) {
    library.sendJsonResponse(res, 404, 'missing email.');
    return;
  }
  res.render('newPw', {
    pageTitle: 'Criar nova senha',
    userEmail: decodedEmail.info
  });
}

//---
//Stores all the emails pre-defined to be sent to the user by type number.
//Token used to know which user is participating in email.
//TYPES:
// 1 - account confirmation
// 2 - change password
// 3 - password changed
// 4 - change email
// 5 - new order
// 6 - payment received
var emailTexts = function (type, emailToken, idToken = '') {
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
  }else if(type == 4) {
    subject = 'Natural Glow - Pedido de alteração de email.'
    confirmedEmailText += '<p>Verificamos que efectou um pedido de alteração de email para a sua conta Natural Glow. Tendo isso em conta pedimos que para verificar o seu novo email clique na hiperligação abaixo.</p><br>'
    confirmedEmailText += '<p>Ficamos ansiosos por o ver novamente na nossa loja de cosméticos naturais. Terá de iniciar a sessão novamente.</p>' + greetings;
    confirmedEmailText += '<a href="' + website + '/confirmEmailUpdate/' + idToken + '">Clique aqui: ' + website + '/confirmEmailUpdate/' + idToken + '</a>';
  }else if(type == 5) {
    subject = 'Natural Glow - Nova encomenda.';
    confirmedEmailText += '<p>Temos o prazer de informar que a sua encomenda foi concluida com sucesso. </p>';
    confirmedEmailText += '<p>Após o pagamento, pode enviar o comprovativo por email para receber a sua encomenda o mais rapidamente possivel.</p>';
    confirmedEmailText += '<p>Para encontrar mais detalhes pode entrar na sua página de perfil, onde irá conseguir verificar o estado atual da sua encomenda, os dados para o pagamento, e o endereço de email para onde deve enviar o comprovativo.</p>' + greetings;
  }else if(type == 6) {
    subject = 'Natural Glow - Em processamento.';
    confirmedEmailText += '<p>Temos o prazer de informar que o pagamento da sua encomenda foi recebido com sucesso.</p>';
    confirmedEmailText += '<p>Vamos concluir todos os processos necessários para o envio da sua encomenda o mais brevemente possível. Após ser enviada irá receber um novo email com os dados do envio.</p>';
    confirmedEmailText += '<p>Para encontrar mais detalhes pode entrar na sua página de perfil onde irá conseguir verificar o estado atual da sua encomenda.</p>' + greetings;
  }
  return {
    html: confirmedEmailText,
    subject: subject
  }
}

//Using server key from .env file.
var decodeEmail = function (email, res) {
  if(!email) {
    return null;
  }
  return jwt.verify(email, process.env.JWT_SECRET, function (err, decoded) {
    if(err) {
      res.redirect('/');
      return;
    }else {
      //Check if token is expired.
      if(Date.now() >= decoded.exp * 1000) {
        res.redirect('/');
        return;
      }
      return decoded;
    }
  });
}

//Logout user.
var logoutUser = async function (req, res) {
  // if(req.session) {
    axios.get(apiOptions.server+'/logout')
    .then(function (data) {
      console.log('User logout.');
      res.redirect('/');
    })
    .catch(function (err) {
      library.sendJsonResponse(res, 401, err);
      return;
    });
  // }
  // return;
}
