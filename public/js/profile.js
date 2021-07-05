//ALL FUNCTIONS RELATED TO THE USER PROFILE

//PASSWORD
var validatePasswordForm = function (e, form) {
  e.preventDefault();
  resetInputs(form);
  resetFormErrors(form);
  var formData = JSON.parse(getFormsData(form));
  var status = 200;
  //Check if fields are empty.
  for(inputName in formData) {
    if(formData[inputName] == '') {
      status = changeInputColor(406, inputName);
    }
  }
  //Check if new password values matches.
  if(formData.newPw !== formData.newPwRepeat) {
    status = changeInputColor(409, 'newPw');
    status = changeInputColor(409, 'newPwRepeat');
  }
  if(status == 200) {
    axios.post('/api/user/changePw', {
      currentPw: formData.oldPw,
      newPw: formData.newPw,
      email: document.getElementById('emailOriginal').value
    })
    .then(function (res) {
      if(res.status == 200) {
        showChangesNotice(form);
      }
    })
    .catch(function (err) {
      if(err.response.status) {
        var errStatus = err.response.status;
        if(errStatus == 406) { //If current password doesnt match database.
          changeInputColor(errStatus, 'oldPw');
        }else if(errStatus == 401) { //If new password is equal to database.
          changeInputColor(errStatus, 'newPw');
          changeInputColor(errStatus, 'newPwRepeat');
        }
      }
      return err;
    })
  }
}

//---
//PROFILE

var submitProfileChanges = async function (e, form) {
  e.preventDefault();
  if(checkFormChanges(form) == true) {
    var formData = JSON.parse(getFormsData(form));
    validateForm(form).then(function (res) {
      if(res == 200) {
        var formData = JSON.parse(getFormsData(form));
        var post = {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          id: formData.emailOriginal,
        };
        axios.post('/api/user/changeUser', post)
        .then(function (data) {
          if(post.email !== post.id) {
            showChangesNotice(form, {
              destination: post.email,
              id: post.id
            });
          }else {
            showChangesNotice(form);
          }
        })
        .catch(function (err) {
          console.log(err);
          return err;
        });
      }
    });
  }else {
    showInputNotice(e.target.lastChild, 404, darkOrange);
  }
}

//Check changes on inputs after a key is pressed by user.
var checkInputs = function (form) {
  resetInputNotices();
  resetFormErrors(form);
  validateForm(form);
}

//---
//ACCOUNT DETAILS

//Waits for every validation check to be completed.
//If found on database give error 401.
//If values not found return 200.
var validateForm = async function(form) {
  if(!form) {
    console.log('missing form.');
    return null;
  }
  var status = 200;
  var formData = JSON.parse(getFormsData(form));

  //NAME
  if(hasChanged(formData.name, formData.nameOriginal)) {
    if(formData.name == '') {
      status = changeInputColor(406, 'name');
    }else {
      status = changeInputColor(200, 'name');
    }
  }else {
    changeInputColor(304, 'name');
  }

  //USERNAME
  if(hasChanged(formData.username, formData.usernameOriginal)) {
    status = await checkUsername(formData.username).then(function (data) {
      if(data) {
        return changeInputColor(401, 'username');
      }else {
        return changeInputColor(200, 'username');
      }
    });
  }else {
    changeInputColor(304, 'username');
  }

  //EMAIL
  if(hasChanged(formData.email, formData.emailOriginal)) {
    var regex = /^[^@]+@\w+(\.\w+)+\w$/;
    if(!regex.test(formData.email)) {
      status = changeInputColor(406, 'email');
    }else {
      status = await checkEmail(formData.email).then(function (data) {
        if(data) {
          return changeInputColor(401, 'email');
        }else {
          return changeInputColor(200, 'email');
        }
      });
    }
  }else {
    changeInputColor(304, 'email');
  }

  return status;
}

//---

//VERIFICATION
//Check if any of the inputs were changed by user.
//LOOPS FORM
var checkFormChanges = function (form) {
  var formData = JSON.parse(getFormsData(form));
  for(inputName in formData) {
    if(inputName.slice(-8) != 'Original') { //If its user input, not hidden.
      if(formData[inputName] != formData[inputName + 'Original']) {
        return true;
      }
    }
  }
  return false;
}

//Stores original value in hidden input. Every time user changes the input check if match.
var hasChanged = function (currentValue, originalValue) {
  if(currentValue == null || originalValue == null) {
    console.log('missing values.');
    return null;
  }

  if(currentValue === originalValue) {
    return false;
  }
  return true;
}

//---
//INPUTS

//Gets the input border and changes the color depending on the error code.
var changeInputColor = function (err, inputName) {
  if(!inputName) {
    console.log('missing element name.');
    return null;
  }

  var input = document.getElementById(inputName);
  if(!input) {
    console.log(inputName + 'not found.');
    return null;
  }
    if(err == 401) {
      showInputNotice(input, 401, darkRed);
      input.style.borderBottomColor = darkRed;
      return 401;
    } else if(err == 409) {
      showInputNotice(input, 409, darkRed);
      input.style.borderBottomColor = darkRed;
      return 409;
    } else if(err == 406) {
      showInputNotice(input, 406, darkRed);
      input.style.borderBottomColor = darkRed;
      return 406;
    } else if(err == 304) {
      input.style.borderBottomColor = grey;
      return 304;
    }else {
      input.style.borderBottomColor = mainGreen;
      return 200;
    }
}

//Resets the inputs and labels assoc if user closes edit function. Includes input notices.
//Requires hidden input with original info.
var resetInputs = function (form) {
  if(!form) {
    console.log('missing form');
    return null;
  }
  resetFormErrors(form);
  resetInputNotices();
  var formData = JSON.parse(getFormsData(form));
  for(inputName in formData) {
    if(inputName.slice(-8) != 'Original') { //If its user input, not hidden.
      if(formData[inputName + 'Original']) {
        var inputElement = document.getElementById(inputName);
        inputElement.value = formData[inputName + 'Original'];
      }
      changeInputColor(304, inputName);
    }
  }
}
