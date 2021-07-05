//Dropdown functions

//Logout.
var logout = function (e) {
  e.preventDefault();
  axios.get('/logout')
  .then(function (res) {
    window.location.href = '/';
  })
  .catch(function (err) {
    console.log(err);
  });
}
