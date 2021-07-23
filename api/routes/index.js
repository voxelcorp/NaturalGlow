var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'payload',
  algorithms: ['HS256'],
  getToken: function fromSession(req) {
    if(req.session.token) {
      return req.session.token;
    }
  }
});
//---
const aws = require('aws-sdk');
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET
});

const multer = require('multer');
const multerS3 = require('multer-s3');
const storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_BUCKET_NAME,
  key: function (req, file, cb) {
    cb(null, Date.now().toString());
  }
});

var fileFilter = (req, file, cb) => {
  if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
    cb(null, true);
  }else {
    cb(null, false);
  }
}
var upload = multer({storage: storage, fileFilter: fileFilter});
//---

var ctrlProducts = require('../controllers/products');
var ctrlIngredients = require('../controllers/ingredients');
var ctrlGrid = require('../controllers/grid');
var ctrlPost = require('../controllers/post');
var ctrlUsers = require('../controllers/users');
var ctrlOrders = require('../controllers/orders');
var ctrlAWS = require('../controllers/uploadAWS');

//GENERAL
router.get('/post/:url/:content', ctrlPost.submitPost);
router.get('/uploadUrl', ctrlAWS.generateUploadURL);

// -> GRIDS <-
//RETRIEVE GRIDS
router.get('/grids', ctrlGrid.getGrids);
router.get('/sections', ctrlGrid.getSections);
//CREATE GRID PATTERN
router.post('/grid/new', ctrlGrid.saveGrid);

//GRID-CELLS
router.post('/cell/remove', ctrlGrid.removeGridCell);
router.post('/cell/split', ctrlGrid.splitGridCell);
router.post('/cell/joint', ctrlGrid.jointGridCell);
router.post('/cell/gridInfo', ctrlGrid.changeGridInfo);

// -> ORDERS <-
//GET "RETRIEVE"
router.get('/orders', ctrlOrders.retrieveAllOrders);
router.get('/order/user/:user', ctrlOrders.retrieveUserOrders);
router.get('/order/orderID/:orderID', ctrlOrders.retrieveOrderID);

//CREATE AND UPDATE
router.post('/order/new', ctrlOrders.createOrder);
router.post('/order/update', ctrlOrders.updateOrder);
router.get('/order/paid/:orderID', ctrlOrders.paidOrder);
// -> PRODUCTS <-

//GET "RETRIEVE"
router.get('/products', ctrlProducts.allProducts);
router.get('/products/:productId', ctrlProducts.infoSingleProduct);
router.get('/ghostProducts', ctrlProducts.productsWithoutSection); //Products with removed Sections
router.post('/products/section', ctrlProducts.productsBySection);


//POST "CREATE"
router.post('/products', auth, ctrlProducts.createProduct);

//PUT "UPDATE"
router.post('/products/update/:productId', auth, ctrlProducts.updateProduct);

//DELETE "REMOVE"
router.get('/products/delete/:productId', auth, ctrlProducts.deleteProduct);

//-----
// -> INGREDIENTS <-

//GET "RETRIEVE"
router.get('/ingredients', ctrlIngredients.allIngredients);
router.get('/ingredients/:paramType/:paramValue', ctrlIngredients.singleIngredient);
router.get('/ingredients/:paramType/:paramValue/products', ctrlIngredients.productsByIngredient);
router.post('/ingredients/checkName', ctrlIngredients.checkNameAvailable);

//POST "CREATE"
router.post('/ingredients', ctrlIngredients.saveIngredient);

//PUT "UPDATE"
router.post('/ingredients/update', ctrlIngredients.updateIngredient)
//DELETE "REMOVE"
router.get('/ingredients/:paramType/:paramValue/remove', ctrlIngredients.removeIngredient);

//-----
// -> USERS <-

//GET "RETRIEVE"
router.get('/user/username/:username', ctrlUsers.getUser);
router.get('/user/email/:email', ctrlUsers.getEmail);

//POST "CREATE & AUTHENTICATION"
router.post('/register', ctrlUsers.register);
router.post('/login', ctrlUsers.login);

//PUT "UPDATE"
router.post('/user/emailConfirm', ctrlUsers.verifyEmail);
router.post('/user/changePw', ctrlUsers.changePw);
router.post('/user/changeUser', ctrlUsers.updateUserInfo)

module.exports = router;
