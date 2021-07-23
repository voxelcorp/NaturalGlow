//Configures all functions related to the register of a new user.
var errMessage = document.getElementById('registerErrorMsg');

//Submits the register form and checks for any errors.
var submitNewUser = async function (e) {
  e.preventDefault();
  var form = document.getElementById('registerForm');
  var userCompleted = document.getElementById('userConfirmedNotice');
  var formData = JSON.parse(getFormsData(form));

  resetFormErrors(form);
  let status = await validateForm(form);

  if(status == 200) {
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
}

//Waits for every validation check to be completed.
var validateForm = async function(form) {
  if(!form) {
    console.log('missing form.');
    return null;
  }
  let status = 200; //resets value for next verification.
  var formData = JSON.parse(getFormsData(form));

  status = await checkUsername(formData.username, errMessage);
  console.log(status);
  status = await checkEmail(formData.email, errMessage);
  status = await checkPasswords({
    password: formData.password,
    passwordRepeat: formData.passwordRepeat
  }, errMessage);

  return status;
}
