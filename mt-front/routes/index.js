var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const indexController = require('../app/controllers/indexController.js');

router.get('/', authController.verify, authController.redirectLogin, indexController.indexRouter);

module.exports = router;
