//ADMIN USER INTERFACE

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
}

//---
//TABLES

var createIngredientsTable = function () {
  var ingredientContainer = document.getElementById('ingredientsTableContent');
  axios.get('/api/ingredients')
  .then((res) => {
    data = res.data;
    data = addData(data, [
      {modificar: "<button type='submit' class='modifyProduct' onclick='modifyIngredientPopup(event, this, \"ingredientModal\")'>Modificar</button>"},
      {remover: "<button type='submit' class='deleteProduct' onclick='createDeleteModal(event, this)'>Remover</button>"}
    ]);
    ingredientContainer.innerHTML = createTable(data, ['_id']);
  })
  .catch((err) => {
    console.log(err);
    return err;
  });
}

var createProductsTable = async function () {
  var ingredientContainer = document.getElementById('productsTableContent');
  await axios.get('/api/products')
  .then((res) => {
    data = res.data;
    data = removeData(data, ['images', 'ingredients', 'quantity', 'quantityType', '__v', 'description']);
    data = addData(data, [
      {modificar: "<button type='submit' class='modifyProduct' onclick='openProductPopup(event, this)'>Modificar</button>"},
      {remover: "<button type='submit' class='deleteProduct' onclick='deleteProduct(event, this)'>Remover</button>"}
    ]);
    for(product in data) {
      data[product].price = parseFloat(data[product].price.$numberDecimal) + " €";
    }
    ingredientContainer.innerHTML = createTable(data, ['_id']);
    onClickRow(ingredientContainer.firstChild, redirectToProduct);
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
  for(var i = 0; i < tableRows.length; i++) {
    if(i != 0) {
      tableRows[i].addEventListener('click', function () {
        func(this.id);
      })
      // tableRows[i].onclick = function () {
      //   console.log(tableRows[i].id);
      //
      // };

      continue;
    }

  }

}
