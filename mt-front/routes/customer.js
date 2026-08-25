var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const customerController = require('../app/controllers/customerController.js');

router.get('/info', authController.verify, authController.redirectLogin, customerController.info);

module.exports = router;
