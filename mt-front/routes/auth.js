var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');

router.get('/login', authController.login);

router.get('/logout', authController.logout);

router.get('/manage/:storeCode/:xToken', authController.manage);

module.exports = router;
