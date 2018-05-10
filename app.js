var createError = require('http-errors');
var express = require('express');
var path = require('path');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var fs = require('fs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var personalRouter = require('./routes/personal_data');
var studentImportRouter = require('./routes/student_import');
//var studentEnrolsRouter = require('./routes/course_enrols');
var listToken = require('./routes/list_token');
var loginRouter = require('./routes/login');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: '53336a676c64c1396553b2b7c92f38126768827c93b64d9142069c10eda7a721',
  resave: false,
  saveUninitialized: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/personal', personalRouter);
app.use('/student_import', studentImportRouter);
//app.use('/student_enrols', studentEnrolsRouter);
app.use('/list_token', listToken);
app.use('/', loginRouter);

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
});

module.exports = app;
