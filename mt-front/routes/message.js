var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const messageController = require('../app/controllers/messageController.js');

router.get('/sms', authController.verify, authController.redirectLogin, messageController.sms);

router.get('/lms', authController.verify, authController.redirectLogin, messageController.lms);

router.get('/rcssms', authController.verify, authController.redirectLogin, messageController.rcssms);

router.get('/rcslms', authController.verify, authController.redirectLogin, messageController.rcslms);

router.get('/kkoAT', authController.verify, authController.redirectLogin, messageController.kkoAT);

router.get('/kkoFT', authController.verify, authController.redirectLogin, messageController.kkoFT);

module.exports = router;
