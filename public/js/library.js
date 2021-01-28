//ALL GENERAL FUNCTIONS ARE HERE.
//COLOURS USED IN JS FUNCTIONS --> Check colours.scss for more colours.
var darkOrange = '#e15f41';
var darkRed = '#c0392b';
var grey = '#2d3436';

//CAN BE REUSED ON MULTIPLE FILES.
var imagesDir = './images/products/';

//GENERAL

//Creates an uniform response function.
var sendJsonResponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};

//Sends the user to a new page.
var redirect = function(url, e = null) {
  if(e != null) {
    e.preventDefault();
  }
  if(!url || typeof url !== 'string') {
    return null;
  }
  window.location.href = url;
}

//Sends a pre configured email to the given email.
//Info about email configuration in emails controller.
//register.js
//sendEmailPage.js
var sendEmail = async function (email, emailType) {
  if(!email) {
    console.log('missing email');
    return null;
  }
  var axiosRes = await axios.get('/email/'+ email +'/'+ emailType)
  .then(function (res) {
    console.log('email sent.');
    return 200;
  })
  .catch(function (err) {
    console.log(err);
    return err.status;
  });

  return axiosRes;
}

//Gets the message and changes it color and text.
//Requires pre-configured html.
// register.js
// loginPopup.js
// newPwPage.js
var showMsg = function (msg, content, color = grey) {
  if(!msg) {
    console.log("Missing messsage element.");
  }else if(!content) {
    console.log("Missing content.");
  }
  msg.style.display = 'block';
  msg.style.color = color;
  msg.innerHTML = content;
}

//---
//POPUPS
//Stores popups which are open on the current page.
var popupsOnPage = new Array();

//Detects if the click was on the popups which are open on the page.
//If not remove them from display and from storedPopups.
document.onclick = function (e) {
  var userBtn = document.getElementById('loginPopupBtn');
  if(popupsOnPage.length > 0) {
    for(popup in popupsOnPage) {
      var currentPopup = popupsOnPage[popup];
      if(!currentPopup.contains(e.target) && !userBtn.contains(e.target)) {
        closePopup(currentPopup.id);
      }
    }
  }
}

//Detects if popup exists in body.
var getPopup = function (popupId) {
  if(!popupId || typeof popupId !== 'string') {
    console.log('missing popup info.');
    return null;
  }
  var popup = document.getElementById(popupId);
  if(!popup) {
    console.log('popup not found.')
    return null;
  }
  return popup;
}

//Changes the popup display to be shown. Required id.
//Adds popup to popupsOnPage Array.
var openPopup = function (popupId) {
  var popup = getPopup(popupId);
  if(!popup) {
    return null;
  }
  if(!popupsOnPage.includes(popup)) { //Check if already stored.
    popupsOnPage.push(popup);
  }
  popup.style.display = 'block';
}

//Changes the popup display to be hidden. Required id.
//Removes popup from popupsOnPage Array.
var closePopup = function (popupId) {
  var popup = getPopup(popupId);
  if(!popup) {
    return null;
  }
  popupsOnPage = popupsOnPage.filter(e => e !== popup);
  popup.style.display = 'none';
}

//---
//FORMS

//Gets all the elements of a form and stores them in a JSON string.
// register.js
var getFormsData = function (form) {
  if(!form) {
    return null;
  }
  var elements = form.elements;
  var obj = {};
  for (var i = 0; i < elements.length; i++) {
    var item = elements.item(i);
    //Only store values inserted by the user.
    if(item.id && (item.tagName === 'INPUT')) {
      obj[item.id] = item.value;
    }
  }
  obj = JSON.stringify(obj);
  return obj;
}

//Chance the labels to the default colour.
// register.js
var resetFormErrors = function (form) {
  if(!form) {
    console.log('missing form.');
    return null;
  }
  var formData = JSON.parse(getFormsData(form));
  for(inputId in formData) {
    var input = document.getElementById(inputId);
    if(input.labels) {
      input.labels[0].style.color = grey;
    }
  }
}

//Chances the labels to the desired error colour.
// register.js
var labelError = function (inputsIds, colour = darkRed) {
  if(!inputsIds) {
    console.log("missing data.");
    return null;
  }
  var changeColour = function (id) {
    if(id) {
      var label = document.getElementById(id).labels[0];
      label.style.color = colour;
    }
  }
  //Checks if it's more then one label.
  if(Array.isArray(inputsIds)) {
    for(id in inputsIds) {
      changeColour(inputsIds[id])
    }
  }else {
    changeColour(inputsIds);
  }
}
