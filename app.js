require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session')
//var logger = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var app = express();
var multer = require('multer')
// import router 
var indexRouter = require('./routes/user.route');
var qltkRouter = require('./routes/qlkt.router')
var userktRouter = require('./routes/user.kt')
// dùng router house
var houseRouter = require('./routes/house.router')
var routerdongco = require('./routes/dongco.router')

// path database
mongoose.connect(process.env.DATABASE_URL,{useNewUrlParser:true, useUnifiedTopology: true });
require('./config/passport'); //vượt qua passport để config trang đăng nhâp/đăng ký
app.use(session({
  secret: 'thangkhungtheki',
  resave: false,
  saveUninitialized: false,
}))

// backup mongodb 



app.use(flash());
app.use(passport.initialize())
app.use(passport.session());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'multer-upload/uploads')));
app.use(express.static(path.join(__dirname, 'uploads')));

// sử dụng router 
app.use('/', indexRouter);
app.use('/qlkt/', qltkRouter);
app.use('/user/' ,userktRouter )
app.use('/house/', houseRouter)
app.use('/dongco/', routerdongco)

app.use((req, res, next) => {
  res.status(404).redirect("/signin");
});

// app.use((err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     // Lỗi từ Multer
//     console.error('Multer error:', err);
//     res.status(500).send('Multer Error');
//   } else if (err) {
//     // Lỗi khác
//     console.error('Unknown error:', err);
//     res.status(500).send('Unknown Error');
//   } else {
//     // Tiếp tục sang middleware tiếp theo nếu không có lỗi
//     next();
//   }
// });

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// app.listen(process.env.PORT || 3000,()=>{
//     console.log("App chay port 3000")
// })

module.exports = app;