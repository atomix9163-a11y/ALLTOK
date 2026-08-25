var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const phoneVerifyController = require('../app/controllers/phoneVerifyController.js');

router.post('/apiList', authController.verify, phoneVerifyController.list);
router.post('/apiCreate', authController.verify, phoneVerifyController.create);
router.post('/apiRemove', authController.verify, phoneVerifyController.remove);

module.exports = router;
