var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');

router.post('/verify', authController.loginVerify);

router.post('/verifyStore', authController.loginVerifyStore);

module.exports = router;
