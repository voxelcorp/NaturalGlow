require('dotenv').config();
var createError = require('http-errors');
var session = require('express-session');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fileUpload = require('express-fileupload');
var FormData = require('form-data');
var multer = require('multer');
var passport = require('passport');
//Redis
var redis = require('redis');
var connectRedis = require('connect-redis');
var redisUrl = process.env.REDIS_URL;

require('./api/models/db');
require('./api/config/passport');

var indexRouter = require('./app_server/routes/index');
var apiRouter = require('./api/routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app_server/views'));
app.set('view engine', 'jade');

// Configure Redis.
var RedisStore = connectRedis(session);
const redisClient = redis.createClient(process.env.REDISTOGO_URL);
//
redisClient.on('error', function (err) {
  console.log('Could not establish a connection with redis. ' + err);
});
redisClient.on('connect', function (err) {
  console.log('Connected to redis successfully');
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

//Configure session middleware;
app.use(session({
  store: new RedisStore({client: redisClient}),
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: false,
  }
}));

//Store session.
app.use(function (req, res, next) {
  if(req.session) {
    res.locals.user = req.session;
  }
  next();
});

app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if(err.name === 'UnauthorizedError') {
    res.status(401);
    res.redirect('/');
  }
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//Catch unauthorized error.
app.use(function (err, req, res, next) {
  if(err.name === 'UnauthorizedError') {
    res.status(401);
    res.json({"message": err.name + ": " + err.message});
  }
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

module.exports = app;
