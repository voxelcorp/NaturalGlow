//Check if email exists and sends the email required to the user.
var emailVerification = function (e) {
  e.preventDefault();
  var inputContent = document.getElementById('emailContent');
  var successContent = document.getElementById('successMsg');

  var email = document.getElementById('email').value;
  var emailSubject = document.getElementById('emailSubject').value;
  if(email != '' && emailSubject) {
    axios.get('/api/user/email/'+email)
    .then(function (res) {
      if(res.status == 200) {
        sendEmail(email, emailSubject).then(function (emailRes) { //If email was sent without errors show success msg.
          if(emailRes == 200) {
            inputContent.style.display = 'none';
            successContent.style.display = 'block';
          }
        });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
  }
}
