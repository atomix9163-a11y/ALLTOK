var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const orderController = require('../app/controllers/orderController.js');

router.get('/list', authController.verify, authController.redirectLogin, orderController.list);

router.get('/details', authController.verify, authController.redirectLogin, orderController.details);

router.get('/print', authController.verify, authController.redirectLogin, orderController.print);

router.get('/smsadmin', authController.verify, authController.redirectLogin, orderController.smsadmin);

module.exports = router;
