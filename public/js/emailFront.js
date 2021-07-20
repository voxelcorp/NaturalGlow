//USER EMAIL WEBSITE | FRONT END FUNCTIONS
//REQUIRES PACKAGES:
// -> axios
//---

var emailFront = {
  formId: "contactForm", //Alter depending on html
  sentMessage: "<div class='inputCentered'><div class='smallMainTitle'><span>Email enviado com sucesso!</span></div><br><div class='notice'>Vamos responder ao seu email o mais brevemente possivel, obrigado.</div></div>",
  sendPost: function(formId) {
    let form = document.getElementById(formId);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      let emailData = getFormsData(this);
      if(emailData.senderName != '' && emailData.senderEmail != '' && emailData.senderContent != '') {
        axios.post('/email', {data: emailData})
        .then((data) => {
          if(data.status === 200) {
            form.innerHTML = emailFront.sentMessage;
          }
        })
        .catch((err) => {
          console.log(err);
        });
      }
    });
  },
};

emailFront.sendPost(emailFront.formId);
