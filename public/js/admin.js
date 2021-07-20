//ADMIN USER INTERFACE

//Sent paid email to client.
var sendPaidEmail = function () {
  let paidBtn = document.getElementById("orderPayedBtn");
  if(!paidBtn) {
    return;
  }
  paidBtn.addEventListener("click", function (e) {
    e.preventDefault();
    let orderId = document.getElementById("orderID").value;
    axios.get('/api/order/paid/'+orderId);
    window.alert("Email enviado com sucesso. Aviso: Alterar estado de pagamento.");
  })
}

//OBJECTIVE: redirect to product page.
//If a row on a table is clicked it gets the product id and redirects it to the productPage

//Creates the form and adds the product it to it before posting.
var redirectToProduct = function (productId) {
  var redirectForm = createForm('post', '/product');
  var productId = createInput('text', 'productId', productId);
  redirectForm.appendChild(productId);
  document.body.appendChild(redirectForm);
  redirectForm.submit();
}

//Creates the form and adds the product it to it before posting
var redirectToOrder = function (orderID) {
  var redirectForm = createForm('post', '/order/edit');
  var orderID = createInput('text', 'orderID', orderID);
  redirectForm.appendChild(orderID);
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
//INGREDIENTS
var createDeleteModal = function (e, deleteBtn) {
  e.stopPropagation();
  var ingredientId = deleteBtn.parentNode.parentNode.id;
  var html = "<div class='modal' style='display:block'><div class='modalContent' id='deleteIngredientModal'>";
  html += "<div class='currentMainTitle'><span>Remover Ingrediente</span></div><p class='inputCentered highlightText' style='text-align:center;'>Ao confirmar irá eliminar o ingrediente permanentemente.</p><button class='smallBtn' onclick='deleteIngredient(\""+ ingredientId +"\", \"deleteIngredientModal\")'>Confirmar</button>";
  html += "</div></div>";
  document.body.innerHTML += html;
  return html;
}
var deleteIngredient = async function(ingredientId, modal, confirmed = false) {
  if(confirmed == true) {
    axios.get('api/ingredients/_id/'+ingredientId+'/remove')
      .then(function(res) {
        showChangesNotice(document.getElementById(modal));
      })
      .catch(function (err) {
        console.log(err);
      });
  }else {
    //CONFIRM DELETE SECOND TIME IF ITS CHANGING PRODUCTS
    await axios.get('/api/ingredients/_id/'+ingredientId+'/products')
    .then((data) => {
        if(data.data.length > 0) {
          var html = '<div class="notice"><p>Ao confirmar irá alterar os seguintes produtos:</p><br>';
          for(product in data.data) {
            html += '<p><span>&#8226;</span>' + data.data[product].name + '</p>';
          }
          html += "<br><button onclick='deleteIngredient(\"" + ingredientId + "\", \"" + modal + "\", true)'>Confirmar</button></div>";
          document.getElementById(modal).innerHTML = html;
        }else {
          deleteIngredient(ingredientId, modal, true);
        }
    })
    .catch((err) => {
      console.log(err);
    });
  }
}

//---
//PRODUCTS
var deleteProduct = function(event, deleteBtn) {
  event.stopPropagation();
  var productRow = deleteBtn.parentNode.parentNode;
  var productId = productRow.id;
  axios.get('api/products/delete/'+productId)
    .then(function(res) {
      productRow.remove();
    })
    .catch(function (err) {
      console.log(err);
    });
}

window.onload = function createTables() {
  createIngredientsTable();
  createProductsTable();
  createUntaggedProductsTable();
  createOrdersTable();
  addOrderDetail();
  //BTN EVENTS
  sendPaidEmail(); //order management.
}

//---
//TABLES

var addOrderDetail = function () {
  let container = document.getElementById('orderDetails');
  let productsContainer = document.getElementById('orderProductsDetails');
  if(!container) {
    return;
  }
  const orderID = document.getElementById("orderID").value;
  let addStatusSelect = function (currentStatus) {
    if(!currentStatus) {
      return null;
    }
    let checkUpdateStatus = function () {
      let statusSelect = document.getElementById("statusSelect");
      if(!statusSelect) {
        return;
      }
      statusSelect.addEventListener("change", async function (e) {
        await axios.post('/api/order/update', {
          orderID: orderID,
          status: this.value
        });
      });
    }

    let statusContainer = document.getElementById('orderStatus');
    let html = '<select id="statusSelect">';
    //SAME IN library.js backEND
    let statusArray = {
      0: "Pagamento em espera",
      1: "A ser fabricado",
      2: "A preparar envio",
      3: "Enviado",
      4: "Entregue"
    }
    for(status in statusArray) {
      if(statusArray[status] == currentStatus) {
        html += '<option value="'+status+'" selected>'+statusArray[status]+'</option>';
      }else {
        html += '<option value="'+status+'">'+statusArray[status]+'</option>';
      }

    }
    html += '</select>';
    statusContainer.innerHTML = html;
    checkUpdateStatus();
  }

  axios.get('/api/order/orderID/'+orderID)
  .then((res) => {
    data = res.data;
    let showData = arrangeArray(data, {
      "_id": "_id",
      "Nº Encomenda": "orderNumber",
      "Data": "date",
      "Morada": "address",
      "Código Postal": "zipCode",
      "Localidade": "district",
      "Tipo de pagamento": "payment",
      "Entrega": "delivery",
      "Total (€)": "orderTotal",
      "Nome": "name",
      "ID Utilizador": "orderUser",
      "Email": "orderUserEmail",
      "Telemóvel": "phone",
      "Informação adicional": "note"
    }, 'multiple');
    container.innerHTML = createTable(showData, ['_id'], 'mobile');
    productsContainer.innerHTML = createTable(data[0].products, ['_id'], 'mobile');
    addStatusSelect(data[0].status);
  })
  .catch((err) => {
    console.log(err);
    return err;
  });
}

var createOrdersTable = function () {
  var container = document.getElementById('ordersTableContent');
  if(!container) {
    return;
  }
  axios.get('/api/orders')
  .then((res) => {
    data = res.data;
    data = removeData(data, ["products", "orderUser", "orderUserEmail", "phone", "address", "zipCode", "district", "note", "__v", "payment", "delivery"]);
    data = arrangeArray(data, {
      "_id": "_id",
      "Nº Encomenda": "orderNumber",
      "Nome": "name",
      "Data": "date",
      "Total (€)": "orderTotal",
      "Estado": "status"
    }, 'multiple');
    container.innerHTML = createTable(data, ['_id']);
    onClickRow(container.firstChild, redirectToOrder);
  })
  .catch((err) => {
    console.log(err);
    return err;
  });
}

var createOrdersTable = function () {
  var container = document.getElementById('ordersTableContent');
  if(!container) {
    return;
  }
  axios.get('/api/orders')
  .then((res) => {
    data = res.data;
    data = removeData(data, ["products", "orderUser", "orderUserEmail", "phone", "address", "zipCode", "district", "note", "__v", "payment", "delivery"]);
    data = arrangeArray(data, {
      "_id": "_id",
      "Nº Encomenda": "orderNumber",
      "Nome": "name",
      "Data": "date",
      "Total (€)": "orderTotal",
      "Estado": "status"
    }, 'multiple');
    container.innerHTML = createTable(data, ['_id']);
    onClickRow(container.firstChild, redirectToOrder);
  })
  .catch((err) => {
    console.log(err);
    return err;
  });
}

var createIngredientsTable = function () {
  var container = document.getElementById('ingredientsTableContent');
  if(!container) {
    return;
  }
  axios.get('/api/ingredients')
  .then((res) => {
    data = res.data;
    data = addData(data, [
      {modificar: "<button type='submit' class='modifyProduct' onclick='modifyIngredientPopup(event, this, \"ingredientModal\")'>Modificar</button>"},
      {remover: "<button type='submit' class='deleteProduct' onclick='createDeleteModal(event, this)'>Remover</button>"}
    ]);
    container.innerHTML = createTable(data, ['_id']);
  })
  .catch((err) => {
    console.log(err);
    return err;
  });
}

var createGeneralProductsTable = function (data, container) {
  if(data.length < 1) {
    return;
  }
  data = removeData(data, ['images', 'ingredients', 'quantity', 'quantityType', '__v', 'description', 'tag']);
  data = addData(data, [
    {modificar: "<button type='submit' class='modifyProduct' onclick='openProductPopup(event, this)'>Modificar</button>"},
    {remover: "<button type='submit' class='deleteProduct' onclick='deleteProduct(event, this)'>Remover</button>"}
  ]);
  for(product in data) {
    data[product].price = parseFloat(data[product].price.$numberDecimal) + " €";
  }
  data = arrangeArray(data, {
    "_id": "_id",
    "Stock": "stock",
    "Nome": "name",
    "Preço (€)": "price",
    "Modificar": "modificar",
    "Remover": "remover",
  }, 'multiple');
  container.innerHTML = createTable(data, ['_id']);
  onClickRow(container.firstChild, redirectToProduct);
}

var createUntaggedProductsTable = async function () {
  var container = document.getElementById('untaggedProductsTableContent');
  var untaggedTitle = document.getElementById('untaggedTitle');
  if(!container) {
    return;
  }
  await axios.get('/api/ghostProducts')
  .then((res) => {
    untaggedTitle.classList.remove("noShow");
    createGeneralProductsTable(res.data, container);
  })
  .catch((err) => {
    console.log(err);
    return err;
  });
}

var createProductsTable = async function () {
  var container = document.getElementById('productsTableContent');
  if(!container) {
    return;
  }
  await axios.get('/api/products')
  .then((res) => {
    createGeneralProductsTable(res.data, container);
  })
  .catch((err) => {
    console.log(err);
    return err;
  });
}

var onClickRow = function (table, func) {
  if(!table || !func) {
    return;
  }
  var tableRows = table.childNodes[0].rows;
  if(!tableRows) {
    return;
  }
  for(var i = 0; i < tableRows.length; i++) {
    if(i != 0) {
      tableRows[i].addEventListener('click', function () {
        func(this.id);
      })
      continue;
    }

  }

}
