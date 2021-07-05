//NEW INGREDIENT POPUP

//Stops form from being submitted to check if all fields are correct.
//Name input is used to check database availability.
//Ingredient name must be unique.
var createNewIngredient = function (e, form, nameInput) {
  e.preventDefault();
  if(!nameInput) {
    console.log('missing new ingredient name.');
    return null;
  }

  var formData = JSON.parse(getFormsData(form));

  axios.post('/api/ingredients', {ingredientName: nameInput.value})
    .then((data) => {
      if(data.status !== 200) {
        showInputNotice(nameInput, 401);
      }else {
        showChangesNotice(form);
      }
    })
    .catch((err) => {
      showInputNotice(nameInput, 401);
      console.log(err.response.status);
  });
}

//Stops form from being submitted to check if all fields are correct.
//Name input is used to check database availability.
//Ingredient name must be unique.
var changeIngredient = async function (e, formData, ingredientId, formId) {
  e.preventDefault();
  if(!ingredientId) {
    console.log('missing new ingredient name.');
    return null;
  }
  var nameInput = document.getElementById('ingredientName');
  var form = document.getElementById(formId);
  var parsedData = JSON.parse(formData);
  var data = arrangeArray(parsedData, {
    name: "ingredientName"
  });
  data.id = ingredientId;

  axios.post('/api/ingredients/update', data)
    .then((data) => {
      if(data.status !== 200) {
        showInputNotice(nameInput, data.status);
      }else {
        showChangesNotice(form);
      }
    })
    .catch((err) => {
      if(err.response) {
        showInputNotice(nameInput, err.response.status);
      }else {
        console.log(err);
      }
    });
}

//Check if name is already being used.
var checkNameAvailable = async function (ingredientId) {
  var nameInput = document.getElementById('ingredientName');
  if(!ingredientId || !nameInput.value) {
    console.log('couldnt check new name. missing information.');
    return null;
  }
  var checkStatus = await axios.post('/api/ingredients/checkName', {
    id: ingredientId,
    name: nameInput.value
  })
  .then((data) => {
    return data.status;
  })
  .catch((err) => {
    showInputNotice(nameInput, err.response.status);
    return err.response.status;
  });
  return checkStatus;
}

//If name update requires changing products shows warning before submitting changes.
var showProductsChangeNotice = async function (e, formId, ingredientId) {
  e.preventDefault();
  if(!ingredientId) {
    console.log('missing new ingredient name.');
    return null;
  }
  if(await checkNameAvailable(ingredientId) === 200) {
    var formData = getFormsData(document.getElementById(formId));

    await axios.get('/api/ingredients/_id/'+ingredientId+'/products')
    .then((data) => {
        if(data.data.length > 0) {
          var html = '<div class="notice"><p>Ao confirmar irá alterar os seguintes produtos:</p><br>';
          for(product in data.data) {
            html += '<p><span>&#8226;</span>' + data.data[product].name + '</p>';
          }
          html += "<br><button onclick='changeIngredient(event, " + JSON.stringify(formData) + ", \"" + ingredientId + "\", \"" + formId + "\")'>Confirmar</button></div>";
          document.getElementById(formId).innerHTML = html;
        }else {
          changeIngredient(e, formData, ingredientId, formId);
        }
    })
    .catch((err) => {
      console.log(err);
    });
  }
}

//Changes popup configuration for modification instead of creation of ingredients.
var modifyIngredientPopup = function (e, btn, popupId) {
  e.preventDefault();
  openPopup(btn, popupId, false);
  var popup = getPopup(popupId);
  var formId = 'ingredientForm';
  var ingredientId = btn.parentNode.parentNode.id;
  // //TITLE
  popup.getElementsByClassName("smallMainTitle")[0].childNodes[1].innerHTML = 'Alterar ingrediente';
  // //FORM SUBMIT FUNCTION
  var form = document.getElementById(formId);
  form.setAttribute('onsubmit', 'showProductsChangeNotice(event, "' + formId + '", "' + ingredientId + '")');
  // //FILL POPUP
  fillIngredientForm(ingredientId, form);
  return false;
}

var fillIngredientForm = function (productId, form) {
  axios.get('/api/ingredients/_id/'+productId)
  .then((res) => {
    var data = arrangeArray(res.data, {
      ingredientName: "name"
    });
    fillForm(data, form.elements);
  })
  .catch((err) => {
    console.log(err);
  });
}
