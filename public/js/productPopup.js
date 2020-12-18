//All functions linked to the popup.
//VARIABLES
var productForm = document.getElementById('productForm');
//---

//OBJECTIVE: Display add product popup.
var addProductBtn = document.getElementById('addProductBtn');
// addProductBtn.onclick = function () {
//   displayPopup();
// }

//-----
//OBJECTIVE: Display popup.
var displayPopup = function () {
    var popup = document.getElementById('productModal');
    var newImagesContainer = document.getElementById('imagesPreviewContent');
    var productImagesContainer = document.getElementById('productImagesPreviewContent');
    //---
    popup.style.display = "block";
    productForm.reset();
    newImagesContainer.innerHTML = '<h1 class="mainTitle">Imagens Novas</h1>'; //Remove any stored preview images.
    productImagesContainer.style.display = 'none';
    productImagesContainer.innerHTML = '<h1 class="mainTitle">Imagens Atuais</h1>'; //Remove any stored preview images.
    loopIngredientsDataInputs(); //Adds the ingredients to the search method in the ingredients input.
}

//-----
//OBJECTIVE: Close popup.
var closeBtn = document.getElementById('closeProductPopupBtn');
closeBtn.onclick = function () {
  var popup = document.getElementById('productModal');
  popup.style.display = 'none';
}

//-----
//OBJECTIVE: Adds the main img name to the form before submitting.
productForm.onsubmit = function () {
  event.preventDefault();
  var productImages = document.getElementById('previewMainImg');
  if(!productImages) {
    console.log('missing main img.');
  }else {
    var mainImageInput = document.getElementById('mainImgName');
    mainImageInput.value = productImages.getAttribute('name');
    //---
    //All images to be saved.
    var productImages = {
      new: storeImages('new'),
      current: storeImages('stored')
    }
    document.getElementById('imgsChoosenByUser').value = JSON.stringify(productImages); //Adds images to form.
    this.submit();
  }
}

// -> INGREDIENTS <-

//OBJECTIVE: Get all ingredients from API.
var getIngredients = function (callback) {
  axios.get('/api/ingredients')
    .then(function (res) {
      if(!res.data) {
        callback(null, null);
      }
      callback(null, res.data);
    })
    .catch(function (err) {
      callback(err, null);
    });
}

//-----
//OBJECTIVE: Add ingredients from API to input.
var loopIngredientsDataInputs = function () {
  getIngredients(function (err, ingredients) {
    var ingredientDataInput = document.getElementsByClassName('ingredientDatalist');
    for(var i = 0; i < ingredientDataInput.length; i++) {
      addIngredientsData(ingredientDataInput[i], ingredients);
    }
  });
}

//-----
//OBJECTIVE: Create each data field for ingredient search method.
var addIngredientsData = function (datalist, ingredients) {
  var html = '';
  for(var i = 0; i < ingredients.length; i++) {
    html += '<option value="' + ingredients[i].name + '">' + ingredients[i].name + '</option>';
  }
  datalist.innerHTML += html;
}

//-----
//OBJECTIVE: Detects the number of ingredients and retrieves the last one of them.
var lastIngredientInput = function () {
  var ingredientsContent = document.getElementById('addIngredientContent');
  var ingredientsCount = ingredientsContent.childNodes.length - 1; //Counting starts at 0.
  var lastIngredient = ingredientsContent.childNodes[ingredientsCount -1]; //the last will always be the addBtn.
  return lastIngredient;
}

//-----
//OBJECTIVE: Copy ingredient input when the addbtn is pressed.
var newIngredientInput = function () {
  var addBtn = document.getElementById('addIngredientBtn');
  event.preventDefault();
  var ingredientConvertToHTML = "<div class='inputContent'> " + lastIngredientInput().innerHTML + "</div>";
  addBtn.insertAdjacentHTML('beforeBegin', ingredientConvertToHTML);
  addBtn.blur();
}

//-----
//OBJECTIVE: Remove ingredient when btn is clicked.
var removeIngredient = function (btn) {
  if(btn.parentNode.parentNode.childNodes.length > 3) { //Must be one ingredient at all times.
    btn.parentNode.remove();
  }else {
    alert('Não é possivel remover ultimo ingrediente.');
  }
}

// -> IMAGES <-

//OBJECTIVE: Get all new images choosen by user and adds them to the form before being submitted.
var storeImages = function (imageType) {
  var storedImages = {};
  if(!imageType) {
    console.log('missing image type.');
    return null;
  }
  if(imageType == 'new') {
    var newImagesList = document.getElementById('imagesPreviewContent').childNodes;
  }else if(imageType == 'stored') {
    var newImagesList = document.getElementById('productImagesPreviewContent').childNodes;
  }
  if(newImagesList.length > 1) {

    for(var i = 0; i < newImagesList.length; i++) {
      if(i != 0) { // Ignore title.
        var imgToBeStored = {};
        imgToBeStored.path = newImagesList[i].getAttribute('name');
        if(newImagesList[i].id == '') {
          imgToBeStored.main = 0;
        }else {
          imgToBeStored.main = 1;
        }
        storedImages[i - 1] = imgToBeStored; //To start storing at index 0. Blame title.
      }
    }

  }
  return JSON.stringify(storedImages);
}
//-----
//OBJECTIVE: Preview image before being uploaded.
var showImages = function (event, imgs = null, imagesType = 'new') {
  if(imagesType == 'new') {
    var imgContent = document.getElementById("imagesPreviewContent");
    imgContent.innerHTML = '<h1 class="mainTitle">Imagens Novas</h1>'; //Remove any stored preview images.
  }else if(imagesType == 'stored') {
    var imgContent = document.getElementById("productImagesPreviewContent");
    imgContent.style.display = 'block'; //None by default.
  }
  if(!imgContent) {
    console.log('missing container.');
    return null;
  }
  if (imgs == null && event.target.files) {
    imgs = convertImgsToURL(event.target.files);
  }
  var imgsHTML = createImgsHTML(imgs);
  imgContent.innerHTML += imgsHTML;
}

//-----
//OBJECTIVE: Create an URL from the user image input.
var convertImgsToURL = function (allImages) {
  var convertedImgs = new Array();
  for (var i = 0; i < allImages.length; i++) {
    var converted = URL.createObjectURL(allImages[i]);
    convertedImgs.push({
      name: allImages[i].name,
      src: converted
    });
  }
  if(convertedImgs.length > 0) {
    return convertedImgs;
  } else {
    return NULL;
  }
}

//-----
//OBJECTIVE: Create an html img() for each img required and returns an array with all of them.
var createImgsHTML = function (allImages) {
  var mainImg = document.getElementById('previewMainImg'); //Check if there is already a main assigned.
  var imgsHTML = "";
  var deleteBtnHTML = "<button class='deleteBtn' name='deleteBtn' onclick='deleteImage(this.parentNode)'>x</button>";
  //console.log(allImages);
  for (var img in allImages) {
    var mutualImgConfig = "onclick='becameMain(this)' onmouseenter='showDeleteBtn(this)' onmouseleave='hideDeleteBtn(this)' name='" + allImages[img].name + "' class='imagesPreviewContainer' aria-label='Tornar principal!'";
    //First image is main by default on creation.
    //If updating info look for main in data.

    if(!mainImg && ( img == 0 && !('main' in allImages[img]) ) || ( allImages[img].main && allImages[img].main == 1 )) { //MAIN IMG.
      imgsHTML += "<div " + mutualImgConfig + " id='previewMainImg'>" + deleteBtnHTML + "<img src='" + allImages[img].src + "' name='productImagesOutput'></div>";
    } else {
      imgsHTML += "<div " + mutualImgConfig + " >" + deleteBtnHTML + "<img src='" + allImages[img].src + "' name='productImagesOutput'></div>";
    }
  }
  return imgsHTML;
}

//-----
//OBJECTIVE: Swap which image is main by clicking on top of it.
var becameMain = function (clickedImage) {
  var previousMain = document.getElementById('previewMainImg');
  if(!clickedImage) {
    console.log('missing clicked img.');
    return null;
  }
  if(previousMain) {
    //Remove main from previous image.
    previousMain.removeAttribute('id');
    previousMain.classList.add('hint--bottom');
    previousMain.classList.add('hint--medium');
  }
  //Make target image the new main.
  clickedImage.id = 'previewMainImg';
  clickedImage.classList.remove('hint--bottom');
  clickedImage.classList.remove('hint--medium');
}

//-----
//OBJECTIVE: Delete an image in popup form.
var cursorOnImage = false;
var deleteBtn = function (action, img) {
  if(!img || cursorOnImage == true) {
    return null;
  }
  var properties;
  var defaultProperties = {
    borderTop: '',
    deleteBtn: 'none',
  }
  var deleteProperties = {
    borderTop: 'solid .25em #c0392b', //darkRed from colours.css
    deleteBtn: 'block',
  }
  //If its being overed by the user or not.
  if(action == 'show') {
    properties = deleteProperties;
  }else if(action == 'hide') {
    properties = defaultProperties;
  }

  for(prop in properties) {
    if(prop == 'borderTop') {
      img.style[prop] = properties[prop];
    }else if(prop == 'deleteBtn') {
      img.getElementsByClassName('deleteBtn')[0].style.display = properties[prop];
    }
  }
}

//-----
//OBJECTIVE: When image as mouse pointer moved onto it activates deleteBtn.
var showDeleteBtn = function (img) {
  deleteBtn('show', img);
  cursorOnImage = true;
}

//-----
//OBJECTIVE: When image as mouse pointer moved out it deactivates deleteBtn.
var hideDeleteBtn = function (img) {
  cursorOnImage = false;
  deleteBtn('hide', img);
}

//-----
//OBJECTIVE: Deletes the image from the images preview.
var deleteImage = function (img) {
  event.stopPropagation();
  var imgsContainer = img.parentNode;
  img.remove();
  becameMain(imgsContainer.childNodes[1]); //One Main image is always required. 0 -> Title | 1 -> Remaining Image.
}
