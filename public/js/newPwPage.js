//Check if password isnt the same as the one in the database and if so updates it.
var pwVerification = function (e) {
  e.preventDefault();
  if(checkInputs() == null) { //If inputs don't match.
    return;
  }
  labelError(['pw', 'pwVerify'], grey); //Reset labels

  var newPw = checkInputs();
  var inputContent = document.getElementById('newPwContent');
  var successContent = document.getElementById('successMsg');
  var errMsg = document.getElementById('pwErrorMsg');

  var email = document.getElementById('userEmail').value;
  if(email != '') {
    axios.post('/api/user/changePw', {
      email: email,
      newPw: newPw
    })
    .then(function (res) {
      if(res.status == 200) {
        sendEmail(email, 3).then(function (emailRes) { //If email was sent without errors show success msg.
          if(emailRes == 200) {
            inputContent.style.display = 'none';
            successContent.style.display = 'block';
          }
        });
      }
    })
    .catch(function (err) {
      if(err.response.status == 401) { //New password match databse pw.
        showMsg(errMsg, 'Necessita de ser uma senha diferente da anterior.', darkRed);
      }
      console.log(err);
    });
  }
}

//Both inputs need to have equal values.
var checkInputs = function () {
  var errMsg = document.getElementById('pwErrorMsg');
  var newPw = document.getElementById('pw').value;
  var pwRepeat = document.getElementById('pwVerify').value;
  if(newPw !== pwRepeat) {
    showMsg(errMsg, 'Ambas as senhas precisam de ser idênticas.', darkRed);
    labelError(['pw', 'pwVerify'], darkRed);
    return null;
  }else {
    return newPw;
  }
}
