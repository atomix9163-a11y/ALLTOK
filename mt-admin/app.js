const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors");
const expressLayouts = require("express-ejs-layouts");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "app/views"));
app.set('view engine', 'ejs');

app.use(cors());
app.use(logger('dev'));
app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/assets", express.static(path.join(__dirname, "/assets")));
global.apiServer = process.env.API_SERVER_ADDRESS;
global.s3Server = process.env.S3_SERVER_ADDRESS;
global.awscfServer = process.env.CF_SERVER_ADDRESS;
global.appStatus = process.env.APPLICATION_STATUS;

const apiRouter = require('./routes/api');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const storeRouter = require('./routes/store');
const phoneRouter = require('./routes/phone');
const userRouter = require('./routes/user');
const imageRouter = require('./routes/image');
const systemRouter = require('./routes/system');
const kakaoRouter = require('./routes/kakao');
const refuseRouter = require('./routes/refuse');

app.use('/api', apiRouter);

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/store', storeRouter);
app.use('/phone', phoneRouter);
app.use('/users', userRouter);
app.use('/image', imageRouter);
app.use('/system', systemRouter);
app.use('/kakao', kakaoRouter);
app.use('/refuse', refuseRouter);

// error handler
app.use(function(err, req, res, next) {
    res.locals.message = process.env.APPLICATION_STATUS === 'development' ? err.message : "";
    res.locals.error = process.env.APPLICATION_STATUS === 'development' ? err : {};

    res.status(err.status || 500);
    console.log("error:", res.locals.error)
    res.render('error/500', {             
        layout: 'layouts/full',
        error: err
    });
});

app.use(function (req, res) {
    res.render('error/404', {             
        layout: 'layouts/full'
    });
});

module.exports = app;
