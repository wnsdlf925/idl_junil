var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config()
const cors = require('cors');
// const corsOptions = {
//   origin: 'http://localhost:80', 
//   credentials: true, 
// };
const app = express();
const app1 = express();



var usersRouter = require('./routes/users');
var memberRouter = require('./routes/member');
var boardRouter = require('./routes/board');
var adminRouter = require('./routes/admin');
//var crawlRouter = require('./common/crawl');


// view engine setup
app1.set('views', path.join(__dirname, '/dist/myfront'));
app1.set('view engine', 'ejs');
app1.engine('html', require('ejs').renderFile);
app1.use(express.static(path.join(__dirname, '/dist/myfront')));


app1.get('*',function(req,res){
  return res.sendFile(path.join(__dirname,'/dist/myfront/index.html'))
});



app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());



app.use('/users', usersRouter);
app.use('/member', memberRouter);
app.use('/board', boardRouter);
app.use('/admin', adminRouter);
//app.use('/crawl', crawlRouter);

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

module.exports = {'app':app,'app1':app1};




