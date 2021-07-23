//ALL GENERAL FUNCTIONS ARE HERE.

//COLOURS USED IN JS FUNCTIONS --> Check colours.scss for more colours.
var mainGreen = '#49DBA4';
var darkOrange = '#e15f41';
var darkRed = '#c0392b';
var grey = '#2d3436';

//LAYOUT SPECIFIC FUNCTION
//ADDS PRODUCTS SECTIONS
window.onload = function () {
  detectHeaderBtnClick();
}

var detectHeaderBtnClick = function () {
  let headerProductBtns = document.getElementsByClassName("headerProductBtns");
  if(headerProductBtns.length < 1) {
    return;
  }

  var addSectionToHeader = async function () {
    let sectionsContent = document.getElementById("headerProductSections");
    let sections = await axios('/api/sections');
    sections = sections.data;
    console.log(sections);
    let html = '';
    for(details in sections) {
      let section = sections[details];
      html += "<form method='post' action='/section' class='alignCenter'><input type='hidden' name='sectionTitle' value='"+section.title+"'><input type='hidden' name='sectionId' value='"+section._id+"'><button type='submit' class='notice'>"+section.title+"</button></form>";
    }
    sectionsContent.innerHTML = html;
    openPopup(null, sectionsContent, true, true);
  }

  for(btn in headerProductBtns) {
    if(headerProductBtns[btn].tagName) {
      headerProductBtns[btn].addEventListener("click", async function (e) {
        await addSectionToHeader();
      });
    }

  }
}

//CAN BE REUSED ON MULTIPLE FILES.
var username = document.getElementById("username").value;

//GENERAL
var showDiv = function (div) {
  div.classList.remove("hidden");
  div.classList.add("fadeIn");
}

var hideDiv = function (div) {
  div.classList.remove("fadeIn");
  div.classList.add("hidden");
}

var getRandomInt = function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var calculateTotal = function (cart) {
  if(!cart) {
    return 0;
  }
  var total = 0;
  for (product in cart) {
    total += cart[product].price * cart[product].quantity;
  }
  return total.toFixed(2);
}

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
  var axiosRes = await axios.get('/email/'+ email +'/'+ emailType+'/null')
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
  if(popupsOnPage.length > 0) {
    for(var i = 0; i < popupsOnPage.length; i++) {
      if(!popupsOnPage[i]) {
        continue;
      }
      var currentPopup = popupsOnPage[i].popup;
      if(!currentPopup.contains(e.target) && popupsOnPage[i].opened == true) {
        if(popupsOnPage[i].visible == true) {
          closePopup(currentPopup, true, true);
        }else {
          closePopup(currentPopup);
        }

      }
      if(popupsOnPage[i]) {
        popupsOnPage[i].opened = true; //Recognize first click as opening.
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

var storedPopup = function (checkPopup) {
  if(!checkPopup) {
    return null;
  }
  for(popup in popupsOnPage) {
    if(popupsOnPage[popup].popup.id == checkPopup.id) {
      return true;
    }
  }
  return false;
}

//Changes the popup display to be shown. Required id.
//Adds popup to popupsOnPage Array.
var openPopup = function (btn, popupContent, checkClick = true, visible = false) {
  if(typeof popupContent != 'object') {
  var popup = getPopup(popupContent);
  }else {
  popup = popupContent;
  }

  if(!popup) {
    return null;
  }

  if(checkClick == true) {
    if(!storedPopup(popup)) { //Check if already stored.
      if(visible) {
        popupsOnPage.push({
          opened: true,
          popup: popup,
          visible: visible
        });
      }else {
        popupsOnPage.push({
          opened: false,
          popup: popup,
          visible: visible
        });
      }

    }
  }
  if(visible) {
    showDiv(popup);
  }else {
    popup.style.display = 'block';
  }

}

//Changes the popup display to be hidden. Required id.
//Removes popup from popupsOnPage Array.
var closePopup = function (removePopup, checkClick = true, visible = false) {
  if(checkClick == true) {
    var updatedPopups = new Array();
    for(popup in popupsOnPage) {
      if(popupsOnPage[popup].popup != removePopup) {
        updatedPopups.push(popupsOnPage[popup]);
      }
    }
    popupsOnPage = updatedPopups;
  }
  if(visible == true) {
    hideDiv(removePopup);
  }else {
    removePopup.style.display = 'none';
  }
}

//---
//FORMS

//Gets all the elements of a form and stores them in a JSON string.
// register.js
// profile.js
var getFormsData = function (form) {
  if(!form) {
    return null;
  }
  var elements = form.elements;
  var obj = {};
  for (var i = 0; i < elements.length; i++) {
    var item = elements.item(i);
    //Only store values inserted by the user.
    if(item.id && (item.tagName === 'INPUT' || item.tagName === 'TEXTAREA')) {
      obj[item.id] = item.value;
    }
  }
  obj = JSON.stringify(obj);
  return obj;
}

// Get the form elements and the product data and fills the form with the info.
var fillForm = function (data, fields) {
  if(!data || !fields) {
    return null;
  }

  var prepImgs;
  for(i = 0; i < fields.length; i++) {
    var inputName = fields[i].name;
    // console.log(fields[i]);
    if(inputName && data[inputName]) {
      if(inputName == 'images') {
         prepImgs = prepProductImages(data[inputName]);
         showImages(null, prepImgs, 'stored');
      }else {
        fields[i].value = data[inputName];
      }
    }
  }
}

//removes all inputs inside form.
var resetForm = function (form) {
  var inputs = searchElement(form, "input");
  while(inputs.length > 0) {
    inputs[0].parentNode.removeChild(inputs[0]);
  }
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
    if(input) {
      if(input.labels) {
        input.labels[0].style.color = grey;
      }
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

//Change the inputs inside the form. Remove disabled param and adds "enabledInput" class.
// profile.js
var changeStatusInputs = function (formId, e, status = false) {
  e.preventDefault();
  var form = document.getElementById(formId);
  var formData = JSON.parse(getFormsData(form));
  for(inputId in formData) {
    var input = document.getElementById(inputId);
    input.disabled = status;
    if(status == false) {
      input.classList.add('enabledInput');
    }else {
      input.classList.remove('enabledInput');
    }
  }
}

//Gets one or more buttons and changes there display. Old become hidden.
// profile.js
var changeBtns = function (oldBtn, newBtn) {
  if(!oldBtn || !newBtn) {
    console.log('missing btns.');
    return null;
  }

  if(Array.isArray(oldBtn)) {
    loopArray(oldBtn, 'none');
  }else {
    oldBtn.style.display = 'none';
  }

  if(Array.isArray(newBtn)) {
    loopArray(newBtn, 'block');
  }else {
    newBtn.style.display = 'block';
  }

  function loopArray (array, style) {
    for(element in array) {
      array[element].style.display = style;
    }
  }
}

//INPUTS

//Sends message to user with input error.
var showInputNotice = function (input, err, color = darkRed) {
  if(!input) {
    console.log('missing input.');
    return null;
  }else if(!err) {
    console.log('missing error.');
    return null;
  }

  for(var i = 0; i < input.parentNode.childNodes.length; i++) {
    if(input.parentNode.childNodes[i].classList.contains("inputNotice")) {
      return null;
    }
  }

  var noticeMsg = '';
  if(err == 401) {
    noticeMsg = '* Valor em uso.';
  }else if(err == 406) {
    noticeMsg = '* Valor inválido.';
  }else if(err == 404) {
    noticeMsg = '* Alterações não encontrados.';
  }else if(err == 409) {
    noticeMsg = '* Necessitam de ser idênticos.';
  }

  var noticeContent = document.createElement('div');
  noticeContent.classList.add("inputCentered");
  noticeContent.classList.add("inputNotice");
  noticeContent.classList.add("errMessage");
  noticeContent.innerHTML = noticeMsg;
  input.after(noticeContent);
}

//Removes existing inputs error messages.
var resetInputNotices = function () {
 var inputNotices = document.getElementsByClassName('inputNotice');
 if(inputNotices) {
   while(inputNotices.length > 0) {
     inputNotices[0].parentNode.removeChild(inputNotices[0]);
   }
 }
}

//INPUT CREATE
var saveImgToAWS = async function (file) {
  let url = await axios.get('/api/uploadUrl');
  url = url.data;
  await fetch (url, {
    method: 'PUT',
    headers: {
      "Content-Type": "multipart/form-data"
    },
    body: file
  });

  let imageUrl = url.split('?')[0];
  return imageUrl;
}

//Add preview image function to all file input labels.
var addPreviewImage = function (form) {
  var fileLabels = document.getElementsByName("imgFile");
  for(var i = 0; i < fileLabels.length; i++) {
    fileLabels[i].addEventListener("change", function (e) {
      var id = this.id.slice(-1);
      var nameID = "name"+id;
      var inputName = "nameInput"+id;
      var imgURL = URL.createObjectURL(this.files[0]);

      document.getElementById("imgContent"+id).innerHTML = "<p><input type='text' name='"+inputName+"'></p><img src='"+imgURL+"' class='containImg' loading='lazy'>";
      createTextInput(nameID, "name", form);
      updateTextInput(nameID, "nameInput"+id, id);
    });
  }
}

var createTextInput = function (id, name, form, value=null) {
  var newInput = document.createElement("input");
  newInput.type = "text";
  newInput.id = id;
  newInput.name = name;
  newInput.value = value;
  newInput.required = true;
  newInput.classList.add("inputFile");
  form.appendChild(newInput);
  return newInput;
}

//Create storage for image in form.
var createNewFileInput = function (id, name, form) {
  var newInput = document.createElement("input");
  newInput.type = "file";
  newInput.id = id;
  newInput.name = name;
  newInput.required = true;
  newInput.accept ="image/png, image/jpeg";
  newInput.classList.add("inputFile");
  form.appendChild(newInput);
  return newInput;
}

//Change form value depending on user input.
var updateTextInput = function (inputStorage, userInput, id) {
  var section = document.getElementsByName(userInput)[0];
  var formStorage = document.getElementById(inputStorage);
  section.addEventListener("keyup", function (e) {
    formStorage.value = this.value;
  });
}

//NOTICES

//If details were updated remove inputs and show notice content.
// Types of notice.
// 1 - General.
// 2 - Email changed.
var showChangesNotice = function (form, email = null) {
  var content = form;
  if(!email) {
    content.innerHTML = '<div class="notice"> <p>Alterações feitas com sucesso!</p><br><a href="" class="linkUnderline">Atualizar página</a> </div>';
  }else {
    content.innerHTML = '<div class="notice"> \
      <p>Alterações feitas com sucesso!</p><br> \
      <p><span style="color: ' + darkOrange + '">Aviso:</span> O novo email apenas será alterado depois da confirmação.</p> \
      <p><a href="/email/'+ email.destination +'/4/'+ email.id +'" class="linkUnderline">Reenviar email</a></p><br><br> \
      <a href="" class="linkUnderline">Atualizar página</a> \
    </div>';
  }
}

//---
