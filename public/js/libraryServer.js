//RETRIEVE INFORMATION

//Arrange must be an JSON object where each key will be assigned to an array value.
var arrangeArray = function (array, arrange, arrayType = "") {
  if(!array || !arrange) {
    console.log('missing fields');
    return {};
  }

  //If array is multi-level
  if(arrayType == 'multiple') {
    var newArray = new Array();
    for(item in array) {
      newArray[item] = {};
      for(key in arrange) {
        newArray[item][key] = array[item][arrange[key]];
      }
    }
  }else {
    var newArray = {};
    for(key in arrange) {
      newArray[key] = array[arrange[key]]
    }
  }
  return newArray;
}


//Adds fields to all array objects.
var addData = function (array, fields) {
  if(!array || !fields) {
    return {};
  }
  var finalArray = [];
  for(var i = 0; i < array.length; i++) {
    for(var x = 0; x < fields.length; x++) {
      for(key in fields[x]) {
        array[i][key] = fields[x][key];
      }
    }
  }
  return array;
}

//Remove certain fields from array.
var removeData = function (array, fields) {
  if(!array || !fields) {
    return {};
  }
  var finalArray = [];
  for(var i = 0; i < array.length; i++) {

    var keys = Object.keys(array[i]);
    for(key in keys) {
      if(fields.includes(keys[key])) {
        delete array[i][keys[key]];
      }
    }

    finalArray.push(array[i]);
  }
  return finalArray;
}

var getSingleProductData = async function (productId) {
  var product = await axios.get(('/api/products/'+productId));
  if(product.data) {
    product.data.price = parseFloat(product.data.price.$numberDecimal);
  }
  return product.data;
}

//VALIDATION

//Check if username exists in database.
// register.js
// profile.js
var checkUsername = async function (username, errMsg) {
  if(!username) {
    console.log('missing username.');
    return null;
  }
  const response = await axios.get('/api/user/username/'+username)
    .then(function (res) {
      if(res.status == 200) { //user found. cant create.
        labelError('username');
        if(errMsg) {
          showMsg(errMsg, 'Utilizador já existente. Introduza outro nome de utilizador.', darkRed);
        }
        errCheck = 400;
      }
      return res;
    })
    .catch(function (err) {
      errCheck = 400;
      return err.response;
    });
  return response.data;
}

//Check if email exists in database.
// register.js
// profile.js
var checkEmail = async function (email, errMsg) {
  if(!email) {
    console.log('missing email.');
    return null;
  }
  const response = await axios.get('/api/user/email/'+email)
    .then(function (res) {
      if(res.status === 200) { //email found. cant create.
        labelError('email');
        if(errMsg) {
          showMsg(errMsg, 'Email já existente. Introduza outro email.', darkRed);
        }
        errCheck = 400;
      }
      return res;
    })
    .catch(function (err) {
      errCheck = 400;
      return err;
    });
  return response.data;
}

//Check if both inputs match.
// register.js
// profile.js
var checkPasswords = async function (inputs, errMsg) {
  if(inputs.password !== inputs.passwordRepeat) {
    labelError([
      'password',
      'passwordRepeat'
    ]);
    if(errMsg) {
      showMsg(errMsg, 'Ambas as senhas precisam de ser iguais.', darkRed);
    }
    errCheck = 400;
    return 400;
  }
}

//Creates a table
//Requires Array. EX: {name: {"Name1", "Name2"}, price: {"2,34", "3,34"} }
var createTable = function (content, hidden = []) {
  if(content == null) {
    return null;
  }
  var tableHtml = '<table>';
  for(var x = 0; x < content.length; x++) {
    var headings = Object.keys(content[x]);
    //TH
    if(x == 0) {
      for(var i = 0; i < headings.length; i++) {
        if(i == 0) {
          tableHtml += '<tr>';
        }
        if(!hidden.includes(headings[i])) {
          tableHtml += '<th>' + headings[i] + "</th>";
        }
        if(i == headings.length -1) {
          tableHtml += '</tr>';
        }
      }
    }
    //---
    //TD
    for(var i = 0; i < headings.length; i++) {
      if(i == 0) {
        tableHtml += '<tr id= "'+ content[x]["_id"] +'">';
      }
      if(!hidden.includes(headings[i])) {
        tableHtml += '<td>' + content[x][headings[i]] + '</td>';
      }
      if(i == headings.length -1) {
        tableHtml += '</tr>';
      }
    }
  }

  tableHtml += '</table>';

  return tableHtml;
}
