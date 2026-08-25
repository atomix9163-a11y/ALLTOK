var express = require('express');
var router = express.Router();

const authController = require('../app/controllers/authController.js');
const messageController = require('../app/controllers/messageController.js');
const storeController = require('../app/controllers/storeController.js');

// 외부 발송용
router.post('/sendMessage', authController.verify, messageController.sendMessageExt);

// 스토어 정보 교환용
router.post('/store/add', authController.verify, storeController.createAPI);
router.post('/store/get', authController.verify, storeController.getAPI);
router.post('/auth/getToken', authController.createToken);

module.exports = router;
