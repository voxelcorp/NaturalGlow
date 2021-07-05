//Configures all functions related to the login popup.

document.getElementById("loginPopupBtn").addEventListener("click", function (e) {
  openPopup(this, "loginPopup");
});


//Submits the form when the login button is pressed.
var submitLogin = function (e) {
  e.preventDefault();
  var username = document.getElementById('usernameInput').value;
  var pw = document.getElementById('pwInput').value;
  var errMessage = document.getElementById('loginErrorMsg');
  if(username == '' || pw == '') {
    showMsg(errMessage, 'Preencha todos os campos.', darkOrange);
    return;
  }
  axios.post('/api/login', {
    username: username,
    password: pw
  })
    .then(function (res) {
      window.location.href = '/';
    })
    .catch(function (err) {
      if(err.response.status === 403) {
        showMsg(errMessage, 'Verificação de email necessária.<br> <a class="linkUnderline" href="/sendEmail/1">Reenviar email.</a>', darkRed);
      }else {
        showMsg(errMessage, 'Utilizador ou senha incorrecta.', darkRed);
      }
    });
}
