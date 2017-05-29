// MODULES DEFINITION
var express = require('express');
var favicon = require('serve-favicon');
var flash = require('connect-flash');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var fs = require('fs');
var morgan = require('morgan');
var passport = require('passport');
var path = require('path');
var session = require('express-session');
var configDB = require('./config/database.js');

var GLOBAL_VARS = {
  GOOGLE_API_KEY_PLACES: "AIzaSyBoQI-XiXqCsHrBXj7r5L2sCifO4zbG_5Q"
};

// Models
fs.readdirSync(__dirname + '/models').forEach(function(filename) {
  if (~filename.indexOf('.js')) require(__dirname + '/models/' + filename);
});

// Models
var user = require('./models/user')(mongoose);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(logger('dev'));
app.use(morgan('dev'));
app.use(session({secret: 'PandorasBox', resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(configDB.url);

require('./config/passport.js')(passport, mongoose);

// ROUTES DEFINITION
var routes = require('./routes/index');
var races = require('./routes/races');
var auth = require('./routes/auth')(passport, mongoose);
var users = require('./routes/users');
var api = require('./routes/api');

// ROUTES USE
app.use('/', routes);
app.use('/races', races);
app.use('/auth', auth);
app.use('/users', users);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  console.log(err.message);
  res.status(err.status || 500);
  res.render('error2', {
    message: err.message,
    error: {}
  });
});

app.get('/', function (req, res) {
  res.render('home',
      { title : 'Home' }
  )
});

module.exports = app;
