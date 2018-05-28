var createError = require('http-errors');
var express = require('express');
var path = require('path');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var pdf = require('express-pdf');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var fs = require('fs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var personalRouter = require('./routes/personal_data');
var studentImportRouter = require('./routes/student_import');
<<<<<<< HEAD
//var studentEnrolsRouter = require('./routes/course_enrols');
var tokens = require('./routes/tokens');
=======
var studentEnrolsRouter = require('./routes/course_enrols');
var vpisniPdfRouter = require('./routes/vpisni_to_pdf');
>>>>>>> 0c8e9a5e87c9bae62f73522c0933263255346493
var loginRouter = require('./routes/login');
var enrolRouter = require('./routes/enrol');

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
app.use(pdf);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/personal', personalRouter);
app.use('/student_import', studentImportRouter);
<<<<<<< HEAD
//app.use('/student_enrols', studentEnrolsRouter);
app.use('/tokens', tokens);
=======
app.use('/student_enrols', studentEnrolsRouter);
app.use('/vpisni_to_pdf', vpisniPdfRouter);
>>>>>>> 0c8e9a5e87c9bae62f73522c0933263255346493
app.use('/', loginRouter);
app.use('/enrol', enrolRouter);

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
