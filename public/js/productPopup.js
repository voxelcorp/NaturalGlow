//All functions linked to the popup.

//-----
//OBJECTIVE: Display popup.
var displayPopup = async function () {
    var popup = document.getElementById('productModal');
    var newImagesContainer = document.getElementById('imagesPreviewContent');
    var productImagesContainer = document.getElementById('productImagesPreviewContent');
    var productForm = document.getElementById('productForm');
    var sections = document.getElementById("productTag");
    //---
    popup.style.display = "block";
    //INPUTS RESET
    productForm.reset();
    //IMAGES RESET
    newImagesContainer.innerHTML = '<h1 class="mainTitle">Imagens Novas</h1>'; //Remove any stored preview images.
    productImagesContainer.style.display = 'none';
    productImagesContainer.innerHTML = '<h1 class="mainTitle">Imagens Atuais</h1>'; //Remove any stored preview images.
    //INGREDIENTS RESET
    resetIngredients();
    loopIngredientsDataInputs(); //Adds the ingredients to the search method in the ingredients input.
    //SECTION INSERT
    sections.innerHTML = await updateSections();
}


//-----
//OBJECTIVE: Adds the main img name to the form before submitting.
var submitProductForm = async function (form) {
  event.preventDefault();
  //FUNCTIONS
  const prepImagesForStorage = async function (imgs, uploadedUrls, type) {
    //FUNCTIONS
    const loopImages = function (newPaths) {
      let newImgs = JSON.parse(imgs.new);
      for(img in newImgs) {
        for (path in newPaths) {
          if(newImgs[img].path == newPaths[path].name) {
            newImgs[img].path = newPaths[path].url;
          }
        }
      }
      imgs.new = JSON.stringify(newImgs);
      return imgs;
    }
    //---
    if(type == 'all') {
      imgs = loopImages(uploadedUrls);
      return imgs;
    }else if(type == 'main'){
      for (url in uploadedUrls) {
        if(imgs == uploadedUrls[url].name) {
          return uploadedUrls[url].url;
        }
      }
    }
  }

  const uploadImgsToAWS = async function () {
    const files = document.getElementById("productImages");
    let imgUrlStorage = [];
    for(var i = 0; i < files.files.length; i++) {
      let currentFile = files.files[i];
      let imgUrl = await saveImgToAWS(currentFile);
      imgUrlStorage.push({
        name: currentFile.name,
        url: imgUrl
      });
    }
    return imgUrlStorage;
  }
  //---
  var productImages = document.getElementById('previewMainImg');
  if(!productImages) {
    console.log('missing main img.');
  }else {
    const uploadedUrls = await uploadImgsToAWS();

    var mainImageInput = document.getElementById('mainImgName');
    mainImageInput.value = await prepImagesForStorage(productImages.getAttribute('name'), uploadedUrls, 'main');
    //---
    //All images to be saved.
    var productImages = {
      new: storeImages('new'),
      current: storeImages('stored')
    }
    productImages = await prepImagesForStorage(productImages, uploadedUrls, 'all');
    document.getElementById('imgsChoosenByUser').value = JSON.stringify(productImages); //Adds images to form.
    form.submit();
  }
}



// -> SECTIONS <-
var updateSections = async function (productCurrentSection = null) {
  var html = "";
  var storedSections = await storeSections();
  if(Array.isArray(storedSections) && storedSections.length > 0) {
    for(var i = 0; i < storedSections.length; i++) {
      if(productCurrentSection && productCurrentSection == storedSections[i].id) {
        html += "<option value='"+storedSections[i].id+"' selected>"+storedSections[i].title+"</option>";
      }else {
        html += "<option value='"+storedSections[i].id+"'>"+storedSections[i].title+"</option>";
      }
    }
  }
  return html;
}

var retrieveGrids = async function () {
  var grids = await axios.get('/api/grids')
  .then((data) => {
    return data;
  })
  .catch((err) => {
    console.log(err);
    return err;
  });

  return grids;
}

var storeSections = async function () {
  var sections = [];
  var grids = await retrieveGrids();
  grids = grids.data;
  if(grids.length >= 1) {
    for(var i = 0; i < grids.length; i++) {
      for(var x = 0; x < grids[i].sections.length; x++) {
        var currentSection = grids[i]["sections"][x];
        sections.push({
          id: currentSection._id,
          title: currentSection.title,
        });
      }
    }
  }
  return sections;
}

// -> INGREDIENTS <-
//-----
//OBJECTIVE: Add available ingredients from API to datalist on all inputs.
var loopIngredientsDataInputs = function () {
  axios.get('/api/ingredients')
  .then((ingredients) => {
    var ingredientDataInput = document.getElementsByClassName('ingredientDatalist');
    for(var i = 0; i < ingredientDataInput.length; i++) {
      addIngredientsData(ingredientDataInput[i], ingredients.data);
    }
  })
  .catch((err) => {
    console.log(err);
    return err;
  })
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
//OBJECTIVE: Delete all inputs until only one remains.
var resetIngredients = function () {
  while(lastIngredientInput(true).count > 2) {
    lastIngredientInput().remove();
  }
}

//-----
//OBJECTIVE: Detects the number of ingredients and retrieves the last one of them.
var lastIngredientInput = function (count = false) {
  var ingredientsContent = document.getElementById('addIngredientContent');
  var ingredientsCount = ingredientsContent.childNodes.length - 1; //Counting starts at 0.
  var lastIngredient = ingredientsContent.childNodes[ingredientsCount -1]; //the last will always be the addBtn.
  if(count == true) {
    return {
      count: ingredientsCount,
      ingredient: lastIngredient
    };
  }
  return lastIngredient;
}

//-----
//OBJECTIVE: Copy ingredient input when the addbtn is pressed.
var newIngredientInput = function () {
  var addIngredientBtn = document.getElementById('addIngredientBtn');
  var ingredientConvertToHTML = "<div class='inputContent'> " + lastIngredientInput().innerHTML + "</div>";
  addIngredientBtn.insertAdjacentHTML('beforeBegin', ingredientConvertToHTML);
  addIngredientBtn.blur();
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
    return [];
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


//PRODUCT-FORM-UPDATE

//OBJECTIVE: open popup and get product info from the clicked row.
var openProductPopup = function (e, element) {
  event.stopPropagation(); //Stop onclick from tr row. Check "redirectToProduct()"
  var popup, popupInputs, productData, productId, productForm, productTitle;
  popup = document.getElementById('productModal');
  productForm = document.getElementById('productForm');
  productImagesFileInput = document.getElementById('productImages');
  popupInputs = popup.childNodes[0].childNodes[2].elements;
  productId = e.target.parentNode.parentNode.id; //Returns to tr and gets the productId

  getSingleProductData(productId)
  .then((productData) => {
    displayPopup();
    productForm.action = 'api/products/update/'+productId;
    productImagesFileInput.required = false;
    fillPopup(productData, popupInputs);
  })
  .catch((err) => {
    console.log(err);
    return err;
  });
}

//-----
//OBJECTIVE: Get the popup inputs and the product data and fills the popup with the info.
var fillPopup = async function (data, fields) {
  fillForm(data, fields);
  //Must be in its own because requires changes in HTML.
  await selectCurrentTag(data.tag, fields.productTag);
  //Must be in its own because is required to create new inputs.
  fillIngredients(data.ingredients);
}

var selectCurrentTag = async function (productTag, formTagSelect) {
  formTagSelect.innerHTML = await updateSections(productTag);
}

var fillIngredients = function (ingredients) {
  for(ing in ingredients) {
    if(ing != 0) {
      newIngredientInput();
    }
    var emptyInput = lastIngredientInput().getElementsByTagName('input')[0];
    emptyInput.value = ingredients[ing].name;
  }
}

//-----
//OBJECTIVE: Get the images from the product and formats the array to have an image name, src and main.
var prepProductImages = function (productImages, prepType) {
  var prepImgs = {};
  if(!productImages || productImages.length <= 0) {
    return {};
  }
  for (var i = 0; i < productImages.length; i++) {
    var newImg = {};
    newImg.name = productImages[i].path;
    newImg.src =productImages[i].path;
    newImg.main = productImages[i].main;
    prepImgs[i] = newImg;
  }
  return prepImgs;
}
