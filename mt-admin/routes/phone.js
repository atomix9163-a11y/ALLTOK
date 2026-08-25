var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const phoneController = require('../app/controllers/phoneController.js');

/* GET home page. */
router.get('/list', authController.verify, authController.redirectLogin, phoneController.list);

module.exports = router;

