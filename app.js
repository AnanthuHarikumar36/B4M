

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var db=require('./config/connection')
const session = require('express-session')
const nocache = require("nocache");
const { v4: uuid } = require('uuid')
// var db=require('./config/connection')
var indexRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
const bodyParser = require('body-parser');




var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(nocache());
app.use(session({
  secret: uuid(),
  resave: true,
  saveUninitialized: false
}))
app.use(bodyParser.json({ limit: '10mb' }));


app.use('/', indexRouter);
app.use('/admin', adminRouter);
// app.use('/admin', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
})


module.exports = app;

