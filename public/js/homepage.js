//OBJECTIVE: ACTIVATE PRODUCT POPUP
//On click of a product it detects the form associated to it and submits.

var forceSubmit = function () {
  var form = getForm(event.target);
  form.submit();
}

//OBJECTIVE: Loops inside a form until it gets to the form element.
var getForm = function (element) {
  if(element.tagName == 'FORM') {
    return element;
  }else {
    return getForm(element.parentNode);
  }
}
