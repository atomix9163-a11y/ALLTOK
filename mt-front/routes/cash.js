var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const cashController = require('../app/controllers/cashController.js');

router.get('/notice', authController.verify, authController.redirectLogin, cashController.notice);

router.get('/history', authController.verify, authController.redirectLogin, cashController.history);

module.exports = router;
