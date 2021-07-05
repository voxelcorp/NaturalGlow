//ALL FUNCIONS RELATED TO PRODUCTS - FRONT

var products = document.getElementsByClassName('currentProduct');

//Detects click type and changes overflow depending on it.
var displayProductOptions = function (product) {
  var overflow = product.getElementsByClassName('overflowInputs')[0];
  product.addEventListener('mouseover', function (e) {
    showDiv(overflow);
  });

  product.addEventListener('mouseout', function (e) {
    hideDiv(overflow);
  });

  product.addEventListener('touchstart', function (e) {
    if(overflow.classList.contains("fadeIn")) {
      hideDiv(overflow);
    }else {
      showDiv(overflow);
    }
  });
}

var showDiv = function (div) {
  div.classList.remove("hidden");
  div.classList.add("fadeIn");
}

var hideDiv = function (div) {
  div.classList.remove("fadeIn");
  div.classList.add("hidden");
}

//Makes search with tag and tag with name.
var searchElement = function(location, tag, name = null) {
  var elements = location.getElementsByTagName(tag);
  if(elements && name !== null) {
    for(var i = 0; i < elements.length; i++) {
        if(elements[i].name && elements[i].name == name) {
          return elements[i];
        }
    }
    return null;
  }
  return elements;
}

//Redirects to product page.
var openProduct = function (product) {
  var openProductBtn = searchElement(product, "button", 'openProductBtn');
  var productForm = searchElement(product, "form", 'productForm');
  openProductBtn.addEventListener('click', function (e) {
    e.preventDefault();

    productForm.submit();
    var touchEvent = new Event('touchstart');
    product.dispatchEvent(touchEvent);
  });
}

//Stores product in cart array.
var addProduct = function (product) {
  var addProductBtn = searchElement(product, "button", 'addProductBtn');
  var productId = searchElement(product, "input", 'productId').value;
  var productInfo = product.getElementsByClassName('productInfo')[0].childNodes;
  var productName = productInfo[0].innerHTML;
  var productPrice = parseFloat(productInfo[2].innerHTML.slice(0, -2)); //Cut number from string.
  addProductBtn.addEventListener('click', function (e) {
    if(username) {
      addProductToCart(e, productId, productName, productPrice);
      closePopup(document.getElementById("cartDropdown"));
    }else {
      //If session not started open login
      openPopup(document.getElementById('loginPopupBtn'), "loginPopup");
    }
  });
}

//RUN FUNCTIONS ON PRODUCTS HERE.
for(var i = 0; i < products.length; i++) {
  var product = products[i];
  displayProductOptions(product);
  openProduct(product);
  addProduct(product);
}
