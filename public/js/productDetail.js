//Stores product in cart array.
document.getElementById("addSingleProductBtn").addEventListener('click', function (e) {
  var productData = JSON.parse(document.getElementById("currentProductData").value);
  if(document.getElementById("username").value != '') {
    addProductToCart(e, productData._id, productData.name, productData.price);
    closePopup(document.getElementById("cartDropdown"));
  }else {
    //If session not started open login
    openPopup(document.getElementById('loginPopupBtn'), "loginPopup");
  }
});
