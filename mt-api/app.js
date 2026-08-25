const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

// const indexRouter = require('./routes/index');
const app = express();
app.use(
    cors({
        origin: true,
        credentials: true,
    })
);
app.use(
    express.json({
        limit: "1000mb",
    })
);
app.use(
    express.urlencoded({
        limit: "1000mb",
        extended: false,
    })
);

app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/assets", express.static(path.join(__dirname, "/assets")));
app.use("/plugins", express.static(path.join(__dirname, "/plugins")));
app.use("/node_modules", express.static(path.join(__dirname, "/node_modules")));
app.use("/public", express.static(path.join(__dirname, "/public")));

global.SHUKET_API = process.env.SHUKET_API;
global.SHUKET_TOKEN = process.env.SHUKET_TOKEN;
global.SHUKET_TOKEN_FOR_PUSH = process.env.SHUKET_TOKEN_FOR_PUSH;
global.MSG_API_SERVER_ADDRESS = process.env.MSG_API_SERVER_ADDRESS;
global.MSG_AUTH_KEY = process.env.MSG_AUTH_KEY;
global.AGENCY_KEY = process.env.AGENCY_KEY;
global.KAKAO_ID = process.env.KAKAO_ID;
global.KAKAO_PWD = process.env.KAKAO_PWD;
global.CRYPTO_KEY = process.env.CRYPTO_KEY;
global.CRYPTO_IV = process.env.CRYPTO_IV;
global.NICEPAY_MID = process.env.NICEPAY_MID;
global.NICEPAY_MERCHANTKEY = process.env.NICEPAY_MERCHANTKEY;
global.MTS_AUTH = process.env.MTS_AUTH_CODE;
global.QMARKET_API = process.env.QMARKET_API;
global.ARTM_API = process.env.ARTM_API;

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/user');
const storeRouter = require('./routes/store');
const cashRouter = require("./routes/cash");
const systemRouter = require("./routes/system");
const customerRouter = require('./routes/customer');
const messageRouter = require('./routes/message');
const historyRouter = require('./routes/history');
const refuseRouter = require("./routes/refuse");
const templateRouter = require("./routes/template");
const leafletRouter = require("./routes/leaflet");
// const productRouter = require("./routes/product");
const orderRouter = require("./routes/order");
const phoneVerifyRouter = require("./routes/phoneverify");  // 발신번호 등록 관리를 위해 추가 >> 실제로 사용하지 않음
const uploadRouter = require("./routes/upload");
const uploadS3Router = require("./routes/uploadS3");
const imageRouter = require("./routes/image");
const nicepayRouter = require("./routes/nicepay");
const kakaoRouter = require('./routes/kakao');
const apiRouter = require('./routes/api');
// const sendRouter = require('./routes/send');
// const categoryRouter = require("./routes/category");
// const bannerRouter = require("./routes/banner");

// catch 404 and forward to error handler

// app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/user', usersRouter);
app.use('/store', storeRouter);
app.use('/cash', cashRouter);
app.use("/system", systemRouter);
app.use('/customer', customerRouter);
app.use('/message', messageRouter);
app.use('/history', historyRouter);
app.use("/refuse", refuseRouter);
app.use("/template", templateRouter);
app.use("/leaflet", leafletRouter);
// app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use("/image", imageRouter);
app.use("/phone", phoneVerifyRouter);
app.use("/upload", uploadRouter);
app.use("/uploadS3", uploadS3Router);
app.use("/nicepay", nicepayRouter);
app.use("/kakao", kakaoRouter);
app.use("/api", apiRouter);

// app.use('/send', sendRouter);
// app.use('/category', categoryRouter);
// app.use('/banner', bannerRouter);

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
