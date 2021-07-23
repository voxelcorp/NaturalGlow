//TABLES
var createCartTable = async function () {
  let cartTable = document.getElementById('editCartTable');
  let emptyNotice = document.getElementById("emptyCartNotice");
  let cartBuy = document.getElementById("carBuyBar");

  let cart = await axios.get('/cart');
  let cartData = cart.data;
  if(cartData.length < 1) {
    emptyNotice.classList.remove("noShow");
    cartBuy.classList.add("noShow");
    var cartTotalPrice = 0;
  }else {
    var cartTotalPrice = calculateTotal(cartData);
    emptyNotice.classList.add("noShow");
    cartBuy.classList.remove("noShow");
  }

  //Modifications
  cartData = arrangeArray(cart.data, {
    id: "id",
    Nome: "name",
    Preço: 'price',
    quantity: 'quantity',
    Total: 'total',
  }, "multiple");

  cartData = addData(cartData, [
    {Quantidade: "<input type='number' class='editCartProductQuantity' min='1' name='quantity'>", value: "quantity"},
    {Remover: "<span class='deleteProductBtn redBtn'>x</span>"}
  ]);

  cartData = removeData(cartData, ["quantity"]);


  cartTable.innerHTML = createTable(cartData, ['id']);
  document.getElementById("cartTotalPrice").innerHTML = cartTotalPrice + "€";
  changeProductQuantity();
}

//QUANTITY CHANGES
var changeProductQuantity = function () {
  let productQuantityBtns = document.getElementsByClassName("editCartProductQuantity");
  for(var i = 0; i < productQuantityBtns.length; i++) {
    productQuantityBtns[i].addEventListener("change", async function (e) {
      e.preventDefault();
      e.stopPropagation();
      if(this.value == '' || !this.value || this.value == null) {
        this.value = 1;
      }
      await axios.post('/cart/update', {
        productID: this.parentNode.parentNode.id,
        param: this.name,
        value: this.value
      });
      await createCartTable();
    });
  }

  let productRemoveBtns = document.getElementsByClassName("deleteProductBtn");
  for(var i = 0; i < productRemoveBtns.length; i++) {
    productRemoveBtns[i].addEventListener("click", async function (e) {
      let tableContainer = document.getElementById('editCartTable');
      await axios.post('/cart/update', {
        productID: this.parentNode.parentNode.id,
        remove: true
      });
      if(tableContainer.classList.contains("orderPage") && tableContainer.childNodes[0].childNodes[0].childNodes.length <= 2) {
        window.location.href= '/';
        return;
      }
      await createCartTable();
    });
  }
}

//EVENTS
document.body.onload = async function () {
  await createCartTable();
}
