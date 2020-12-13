//ADMIN USER INTERFACE

//OBJECTIVE: redirect to product page.
//If a row on a table is clicked it gets the product id and redirects it to the productPage

//Creates the form and adds the product it to it before posting.
var redirectToProduct = function (actionObj) {
  var redirectForm = createForm('post', '/product');
  var productId = createInput('text', 'productId', actionObj.id);
  redirectForm.appendChild(productId);
  document.body.appendChild(redirectForm);
  redirectForm.submit();
}

var createForm = function (method, action) {
  var form = document.createElement('FORM');
  form.action = action; //URL
  form.method = method;
  return form;
}

var createInput = function (type, name, value) {
  if(!type || !name || !value) {
    console.log("missing information, couldnt create input.");
    return null;
  }
  var input = document.createElement('INPUT');
  input.setAttribute('type', type);
  input.setAttribute('name', name);
  input.setAttribute('value', value);
  return input;
}

//-----
//OBJECTIVE: Retrieve products and store them.
var getProducts = function () {
  var products = document.getElementById('products').value;
  products = JSON.parse(products);
  if(!products) {
    return null;
  }
  return products;
}

var getSingleProduct = function (productId) {
  var products = getProducts();
  if(!products || !productId) {
    return null;
  }
  for(i in products) {
    if(products[i]._id === productId) {
      return products[i];
    }
  }
  return null;
}
//-----
//OBJECTIVE: open popup and get product info from the clicked row.
var openProductPopup = function (event, element) {
  event.stopPropagation(); //Stop onclick from tr row. Check "redirectToProduct()"
  var popup, popupInputs, productData, productId, productForm;
  popup = document.getElementById('productModal');
  productForm = document.getElementById('productForm');
  productImages = document.getElementById('productImages');
  popupInputs = popup.childNodes[0].childNodes[2].elements;
  productId = event.target.parentNode.parentNode.id; //Returns to tr and gets the productId
  productData = getSingleProduct(productId);
  //---
  displayPopup();
  productForm.method = 'put';
  productImages.required = false;
  fillPopup(productData, popupInputs);
}

//-----
//OBJECTIVE: Get the popup inputs and the product data and fills the popup with the info.
var fillPopup = function (data, fields) {
  if(!data || !fields) {
    return null;
  }
  var prepImgs;
  for(i = 0; i < fields.length; i++) {
    var inputName = fields[i].name;
    if(inputName && data[inputName]) {
      if(inputName != 'images') {
        fields[i].value = data[inputName];
      } else if(inputName == 'images') {
         prepImgs = prepProductImages(data[inputName]);
         showImages(null, prepImgs, 'stored');
      }
    }
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
    newImg.src = imagesDir + productImages[i].path;
    newImg.main = productImages[i].main;
    prepImgs[i] = newImg;
  }
  return prepImgs;
}
