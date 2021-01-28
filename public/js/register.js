//Configures all functions related to the register of a new user.
var errMessage = document.getElementById('registerErrorMsg');
var errCheck = 200;

//Submits the register form and checks for any errors.
var submitNewUser = function (e) {
  e.preventDefault();
  var form = document.getElementById('registerForm');
  var userCompleted = document.getElementById('userConfirmedNotice');
  var formData = JSON.parse(getFormsData(form));

  resetFormErrors(form);
  var validForm = validateForm(form);

  validateForm(form).then(function () {
    if(errCheck == 200) {
      axios.post('/api/register', formData)
      .then(function (res) {
        form.style.display = 'none';
        userCompleted.style.display = 'block';
        sendEmail(formData.email, 1);
        document.getElementById('resendEmailLink').value= formData.email; //Add email to resend link.
      })
      .catch(function (err) {
        console.log(err);
      });
    }
  })
}

//Waits for every validation check to be completed.
var validateForm = async function(form) {
  if(!form) {
    console.log('missing form.');
    return null;
  }
  errCheck = 200; //resets value for next verification.
  var formData = JSON.parse(getFormsData(form));
  await checkUsername(formData.username);
  await checkEmail(formData.email);
  await checkPasswords({
    password: formData.password,
    passwordRepeat: formData.passwordRepeat
  });
}

//Check if both inputs match.
var checkPasswords = async function (inputs) {
  if(inputs.password !== inputs.passwordRepeat) {
    labelError([
      'password',
      'passwordRepeat'
    ]);
    showMsg(errMessage, 'Ambas as senhas precisam de ser iguais.', darkRed);
    errCheck = 400;
  }
}

//Check if username exists in database.
var checkUsername = async function (username) {
  if(!username) {
    console.log('missing username.');
    return null;
  }
  await axios.get('/api/user/username/'+username)
    .then(function (res) {
      if(res.status == 200) { //user found. cant create.
        labelError('username');
        showMsg(errMessage, 'Utilizador já existente. Introduza outro nome de utilizador.', darkRed);
        errCheck = 400;
      }
    })
    .catch(function (err) {
      console.log(err);
      errCheck = 400;
    });
}

//Check if email exists in database.
var checkEmail = async function (email) {
  if(!email) {
    console.log('missing email.');
    return null;
  }
  await axios.get('/api/user/email/'+email)
    .then(function (res) {
      if(res.status === 200) { //email found. cant create.
        labelError('email');
        showMsg(errMessage, 'Email já existente. Introduza outro email.', darkRed);
        errCheck = 400;
      }
    })
    .catch(function (err) {
      console.log(err);
      errCheck = 400;
    });
}
