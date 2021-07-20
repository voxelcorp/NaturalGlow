//FRONT-END CART


var updateCart = async function() {
  var cart = await axios.get('/cart');
  var cartTable = document.getElementById('cartTable');
  var cartUI = document.getElementById('configTable');
  var cartTotal = document.getElementById('cartTotal');
  var emptyCart = document.getElementById('noItemsNotice');

  if(cart.data.length > 0) {
    for(item in cart.data) {
      var product = cart.data[item];
    }
    var finalData = arrangeArray(cart.data, {
      Nome: "name",
      Preço: 'price',
      "Q": 'quantity',
      Total: 'total'
    }, "multiple");
    cartTable.innerHTML = createTable(finalData, 'id');

    //CONFIG UI
    emptyCart.style.display = 'none';
    cartUI.style.display = 'block';
    cartTotal.innerHTML = calculateTotal(cart.data) + '€';
  }
}

//Gets the product details and adds them to cart.
var addProductToCart = async function (e, productId, productName, productPrice) {
  e.stopPropagation();
  e.preventDefault();

  if(!productId || !productName || !productPrice) {
    console.log('missing information.');
    return;
  }

  let addModalConfig = function () {
    let addModal = document.getElementById("addCartModal");
    addModal.style.display = 'block';
    let closeBtn = document.getElementById("closeAddCartModalBtn");
    closeBtn.addEventListener("click", function (e) {
      e.preventDefault();
      addModal.style.display = 'none';
    });
  }

  var addCart = await axios.get('/cart/'+productId+'/'+productName+'/'+productPrice+'/1');
  addModalConfig();


}
