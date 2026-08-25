var express = require('express');
var router = express.Router();

const messageController = require('../app/controllers/messageController.js');
const authController = require('../app/controllers/authController.js');
const kakaoController = require('../app/controllers/kakaoController.js');
const shuketConnectController = require('../app/controllers/shuketConnectController.js');

// 카카오비즈의 API 호출 >> MTS로 이전 중
router.post('/apiGetKakaoTemplateList', authController.verify, kakaoController.getTemplateList);
router.post('/apiGetKakaoTemplate', authController.verify, kakaoController.getTemplate);

// APP push 관련
router.post('/apiAppMartInfo', authController.verify, shuketConnectController.getAppMartInfo);

router.post('/apiAppPushProducts', authController.verify, shuketConnectController.getAppPushProducts);

router.post('/apiSendAppPush', authController.verify, shuketConnectController.sendAppPush);

// 발송
router.post('/apiSendMessage', authController.verify, messageController.sendMessage);

// 외부 발송용
router.post('/apiSendMessageExt', authController.verify, messageController.sendMessageExt);

module.exports = router;
