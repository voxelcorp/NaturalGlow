//FUNCTIONS
var sendJsonResponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.submitPost = function (req, res) {
  if(!req.params.content) {
    sendJsonResponse(res, 404, 'missing post content.');
  }
  res.render('post', {
    url: req.params.url,
    data: JSON.parse(decodeURIComponent(req.params.content))
  });
}
