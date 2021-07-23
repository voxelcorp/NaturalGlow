const fs = require('fs');
const fetch = require('node-fetch');
var library = require('../controllers/library');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  region: 'eu-west-1',
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
  signatureVersion: 'v4',
});

//FUNCTIONS
var sendJsonResponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};

//MODULES
module.exports.generateUploadURL = async function (req, res) {
  const params = ({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: Date.now().toString(),
    Expires: 60
  });

  const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
  library.sendJsonResponse(res, 200, uploadUrl);
};

module.exports.deleteImg = function (path) {
  let pathSplitted = path.split('/');
  let imgName = pathSplitted[pathSplitted.length -1];
  let params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: imgName
  };
  s3.deleteObject(params, function (err, data) {
    if(err) {
      return {
        status: 401,
        msg: err.stack,
      }
    }
    return {
      status: 200,
      msg: "Deleted"
    }
  });
  console.log("deleted");
}
