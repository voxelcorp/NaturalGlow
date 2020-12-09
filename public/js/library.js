//ALL GENERAL FUNCTIONS ARE HERE.
//CAN BE REUSED ON MULTIPLE FILES.
var imagesDir = './images/products/';

//Creates an uniform response function.
var sendJsonResponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};


//Gets all the elements of a form and stores them in a JSON string.
var getFormsData = function (form) {
  var elements = form.elements;
  var obj = {};
  for (var i = 0; i < elements.length; i++) {
    var item = elements.item(i);
    obj[item.name] = item.value;
  }
  obj = JSON.stringify(obj);
  return obj;
}
