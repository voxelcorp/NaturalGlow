//ALL FUNCTIONS RELATED TO NEW ORDERS

var orders = {
  deliveryTypeBtns: document.getElementsByName("delivery"),
  addDeliveryToTotal: function () {
    let btns = orders.deliveryTypeBtns;
    for(var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("change", function (e) {
        let lastValue = 0;
        if(document.getElementsByClassName("currentOption")[0]) { //Removes last price from total. Only acts if one option has been previous selected.
          var previousOption = document.getElementsByClassName("currentOption")[0];
          previousOption.classList.remove("currentOption");
          lastValue = parseFloat(previousOption.value);
        }
        this.classList.add("currentOption");
        //Update total with new delivery price minus previous. If there's no previous minus 0.
        let total = document.getElementById("cartTotalPrice");
        let updateTotal = total.innerHTML.slice(0, -1);
        updateTotal = (parseFloat(updateTotal) + parseFloat(this.value) - parseFloat(lastValue)).toFixed(2) + "€";
        total.innerHTML = updateTotal;
      });
    }
  }
};

orders.addDeliveryToTotal();
