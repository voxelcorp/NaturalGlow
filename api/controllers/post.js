//FUNCTIONS
var library = require('../controllers/library');

module.exports.submitPost = function (req, res) {
  if(!req.params.content) {
    library.sendJsonResponse(res, 404, 'missing post content.');
  }
  res.render('post', {
    url: req.params.url,
    data: JSON.parse(decodeURIComponent(req.params.content))
  });
}
