var express = require('express');
var router = express.Router();
const nicePayController = require('../app/controllers/nicepayController.js');

router.post('/apiCallBack', nicePayController.callback);
router.get('/apiCallBackTest', nicePayController.callbackTest);

module.exports = router;
