var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');

/* GET home page. */
router.get('/login', authController.login);

router.get('/logout', authController.logout);

module.exports = router;
