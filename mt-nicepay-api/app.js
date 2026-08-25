const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const app = express();

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/assets", express.static(path.join(__dirname, "/assets")));
app.use("/plugins", express.static(path.join(__dirname, "/plugins")));
app.use("/node_modules", express.static(path.join(__dirname, "/node_modules")));
app.use("/public", express.static(path.join(__dirname, "/public")));


global.NICEPAY_MID = process.env.NICEPAY_MID;
global.NICEPAY_MERCHANTKEY = process.env.NICEPAY_MERCHANTKEY;

const nicepayRouter = require("./routes/nicepay");

app.use("/nicepay", nicepayRouter);


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
