require('dotenv').config()
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('connect-flash')
//SESSION, AUTH, DB
const passport = require('passport')
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("./db");
require("./strategies/local")(passport);
require("./strategies/jwt")(passport);
require("./strategies/facebook")(passport)
require("./strategies/google")(passport);
// require("./strategies/twitter")(passport);

//ROUTERS
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/profile');
const authRouter = require('./routes/auth/auth')
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_DB,
    }),
  })
);
app.use(passport.initialize());
app.use(function (req, res, next) {
  if (req.url.match("/api_doesnt_invoke_passport_deserialize")) {
    next(); // does not invoke passport
  } else passport.session()(req, res, next); 
});
app.use(flash());

//routers
app.use('/', indexRouter);
app.use('/profile', usersRouter);
app.use("/auth", authRouter);
app.get("/api_doesnt_invoke_passport_deserialize", (req, res) => {
  setTimeout(() => res.redirect("/"), 500);
});

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
