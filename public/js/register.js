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
  });
}

//Waits for every validation check to be completed.
var validateForm = async function(form) {
  if(!form) {
    console.log('missing form.');
    return null;
  }
  errCheck = 200; //resets value for next verification.
  var formData = JSON.parse(getFormsData(form));

  errCheck = await checkUsername(formData.username, errMessage);
  errCheck = await checkEmail(formData.email, errMessage);
  errCheck = await checkPasswords({
    password: formData.password,
    passwordRepeat: formData.passwordRepeat
  }, errMessage);
}
