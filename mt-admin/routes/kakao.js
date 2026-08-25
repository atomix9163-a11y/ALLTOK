var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const kakaoController = require('../app/controllers/kakaoController.js');

router.get('/profile', authController.verify, authController.redirectLogin, kakaoController.profile);

router.get('/template', authController.verify, authController.redirectLogin, kakaoController.template);

module.exports = router;
