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
let proxy = require('html2canvas-proxy');
app.use("/html2canvas", proxy());

global.apiServer = process.env.API_SERVER_ADDRESS;
global.msgApiServer = process.env.MSG_API_SERVER_ADDRESS;
global.s3Server = process.env.S3_SERVER_ADDRESS;
global.awsCFServer = process.env.CF_SERVER_ADDRESS;
global.shuketS3Server = process.env.SHUKET_S3_SERVER_ADDRESS;
global.shuketCFServer = process.env.SHUKET_CF_SERVER_ADDRESS;
global.qmSyncServer = process.env.QM_API_SERVER_ADDRESS;

const authRouter = require('./routes/auth');

const indexRouter = require('./routes/index');
const customerRouter = require('./routes/customer');
const messageRouter = require('./routes/message');
// const kakaoRouter = require('./routes/kakao');
const historyRouter = require('./routes/history');
const refuseRouter = require('./routes/refuse');
const cashRouter = require('./routes/cash');
const storeRouter = require('./routes/store');
// const categoryRouter = require('./routes/category');
// const productsRouter = require('./routes/products');
const orderRouter = require('./routes/order');
const leafletRouter = require('./routes/leaflet');
const agreementRouter = require('./routes/agreement');

const { ppid } = require('process');

app.use('/auth', authRouter);

app.use('/', indexRouter);
app.use('/customer', customerRouter);
app.use('/message', messageRouter);
// app.use('/kakao', kakaoRouter);
app.use('/history', historyRouter);
app.use('/refuse', refuseRouter);
app.use('/cash', cashRouter);
app.use('/store', storeRouter);
// app.use('/category', categoryRouter);
// app.use('/products', productsRouter);
app.use('/order', orderRouter);
app.use('/leaflet', leafletRouter);
app.use('/agreement', agreementRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    var requestIp = require('request-ip');
    res.locals.message = process.env.APPLICATION_STATUS === 'development' ? err.message : "";
    res.locals.error = process.env.APPLICATION_STATUS === 'development' ? err : {};

    res.status(err.status || 500);
    const logger = require("./config/logger");
    logger.writeLog("error", `code ${err.status}: IP ${requestIp.getClientIp(req)}`)
    res.render('error', {             
        layout: 'layouts/full',
        err: err.message
    });
});

module.exports = app;
