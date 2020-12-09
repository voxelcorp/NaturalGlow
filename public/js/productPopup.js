//All functions linked to the popup.

//OBJECTIVE: Display popup.
var addProductBtn = document.getElementById('addProductBtn');

addProductBtn.onclick = function () {
  var popup = document.getElementById('productModal');
  popup.style.display = "block";
}

//OBJECTIVE: Close popup.
var closeBtn = document.getElementById('closeProductPopupBtn');

closeBtn.onclick = function () {
  var popup = document.getElementById('productModal');
  popup.style.display = 'none';
}

//-----
//OBJECTIVE: Copy ingredient input when the addbtn is pressed.
var addBtn = document.getElementById('addIngredientBtn');

//Detects the number of ingredients and retrieves the last one of them.
var newIngredientInput = function () {
  var ingredientsContent = document.getElementById('addIngredientContent');
  var ingredientsCount = ingredientsContent.childNodes.length - 1; //Counting starts at 0.
  var lastIngredient = ingredientsContent.childNodes[ingredientsCount -1]; //the last will always be the addBtn.
  return lastIngredient;
}

addBtn.onclick = function () {
  event.preventDefault();
  var ingredientConvertToHTML = "<div class='inputContent'> " + newIngredientInput().innerHTML + "</div>";
  addBtn.insertAdjacentHTML('beforeBegin', ingredientConvertToHTML);
  addBtn.blur();
}

//-----//
//OBJECTIVE: Preview image before being uploaded.
var showImages = function (event, imgs = null) {
  var imgContent = document.getElementById("imagesPreviewContent");
  if (imgs == null && event.target.files) {
    imgs = convertImgsToURL(event.target.files);
  }
  var imgsHTML = createImgsHTML(imgs);
  imgContent.innerHTML = imgsHTML;
}

//Create an URL from the user image input.
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

//Create an html img() for each img required and returns an array with all of them.
var createImgsHTML = function (allImages) {
  var imgsHTML = "";
  var deleteBtnHTML = "<button class='deleteBtn' name='deleteBtn' onclick='deleteImage(this.parentNode)'>x</button>";
  //console.log(allImages);
  for (var img in allImages) {
    console.log();
    //First image is main by default on creation.
    //If updating info look for main in data.
    if(( img == 0 && !('main' in allImages[img]) ) || ( allImages[img].main && allImages[img].main == 1 )) {
      imgsHTML += "<div onclick='becameMain(this)' onmouseenter='showDeleteBtn(this)' onmouseleave='hideDeleteBtn(this)' name='" + allImages[img].name + "' class='imagesPreviewContainer' aria-label='Tornar principal!'  id='previewMainImg'>" + deleteBtnHTML + "<img src='" + allImages[img].src + "' name='productImagesOutput'></div>";
    } else {
      imgsHTML += "<div onclick='becameMain(this)' onmouseenter='showDeleteBtn(this)' onmouseleave='hideDeleteBtn(this)' name='" + allImages[img].name + "' class='imagesPreviewContainer hint--bottom hint--medium' aria-label='Tornar principal!'>" + deleteBtnHTML + "<img src='" + allImages[img].src + "' name='productImagesOutput'></div>";
    }
  }
  return imgsHTML;
}

//-----
//OBJECTIVE: Swap which image is main by clicking on top of it.
var becameMain = function (clickedImage) {
  var previousMain = document.getElementById('previewMainImg');
  if(!clickedImage || !previousMain) {
    return null;
  }
  //Remove main from previous image.
  previousMain.removeAttribute('id');
  previousMain.classList.add('hint--bottom');
  previousMain.classList.add('hint--medium');
  //Make target image the new main.
  clickedImage.id = 'previewMainImg';
  clickedImage.classList.remove('hint--bottom');
  clickedImage.classList.remove('hint--medium');
}

//-----
//OBJECTIVE: Adds the main img name to the form before submitting.
var productForm = document.getElementById('productForm');
productForm.onsubmit = function () {
  event.preventDefault();
  var mainImageInput = document.getElementById('mainImgName');
  var productImages = document.getElementById('previewMainImg');
  mainImageInput.value = productImages.getAttribute('name');
  //console.log(sendSelectedImagesList());
  this.submit();
}

var sendSelectedImagesList = function () {
  var imagesList = document.getElementById('imagesPreviewContent');
  console.log(imagesList);
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

//When image as mouse pointer moved onto it activates deleteBtn.
var showDeleteBtn = function (img) {
  deleteBtn('show', img);
  cursorOnImage = true;
}

//When image as mouse pointer moved out it deactivates deleteBtn.
var hideDeleteBtn = function (img) {
  cursorOnImage = false;
  deleteBtn('hide', img);
}

var deleteImage = function (img) {
  event.preventDefault();
  img.remove();
}
