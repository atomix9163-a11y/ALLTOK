var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const userController = require('../app/controllers/userController.js');

/* GET home page. */
router.get('/list', authController.verify, authController.redirectLogin, userController.list);

module.exports = router;

