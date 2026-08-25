var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const agreementController = require('../app/controllers/agreementController.js');

router.get('/agreement', authController.verify, authController.redirectLogin, agreementController.agreement);

router.get('/privacy', authController.verify, authController.redirectLogin, agreementController.privacy);

module.exports = router;
