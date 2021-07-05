//FRONT-END CART


var updateCart = async function() {
  var cart = await axios.get('/cart');
  var cartTable = document.getElementById('cartTable');
  var cartUI = document.getElementById('configTable');
  var cartTotal = document.getElementById('cartTotal');
  var emptyCart = document.getElementById('noItemsNotice');

  // console.log(cartTable);
  if(cart.data.length > 0) {
    for(item in cart.data) {
      var product = cart.data[item];
      // console.log(product);
    }
    var finalData = arrangeArray(cart.data, {
      id: 'id',
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

var calculateTotal = function (cart) {
  if(!cart) {
    return null;
  }
  var total = 0;
  for (product in cart) {
    total += cart[product].price * cart[product].quantity;
  }
  return total.toFixed(2);
}

//Gets the product details and adds them to cart.
var addProductToCart = async function (e, productId, productName, productPrice) {
  e.stopPropagation();
  e.preventDefault();

  if(!productId || !productName || !productPrice) {
    console.log('missing information.');
    return;
  }
  var addCart = await axios.get('/cart/'+productId+'/'+productName+'/'+productPrice+'/1');
}
