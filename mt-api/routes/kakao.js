var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const MTSController = require('../app/controllers/MTSController.js');

router.post('/apiProfileList', authController.verify, MTSController.getProfileList);

router.post('/apiCategoryList', authController.verify, MTSController.getCategoryList);

router.post('/apiSendToken', authController.verify, MTSController.sendToken);

router.post('/apiProfileAdd', authController.verify, MTSController.profileAdd);

router.post('/apiProfileAddForce', authController.verify, MTSController.profileAddForce);

// router.post('/apiProfileRemove', authController.verify, MTSController.profileRemove);

router.post('/apiProfileRemove', authController.verify, MTSController.profileRemoveForce);

router.post('/apiTemplateList', authController.verify, MTSController.getTemplateList);

router.post('/apiTemplateAdd', authController.verify, MTSController.templateAdd);

router.post('/apiTemplateUpdate', authController.verify, MTSController.templateUpdate);

router.post('/apiGetTemplate', authController.verify, MTSController.getTemplate);

module.exports = router;
