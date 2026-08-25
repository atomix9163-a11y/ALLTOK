var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const nicePayController = require('../app/controllers/nicepayController.js');

router.post('/apiSendVerify', authController.verify, nicePayController.sendVerify);
router.post('/apiLiveVirtualBank', authController.verify, nicePayController.getLiveVirtualBank);

router.post('/apiAccountList', authController.verify, nicePayController.accountList);
router.post('/apiAccountLink', authController.verify, nicePayController.accountLink);
router.post('/apiAccountUnlink', authController.verify, nicePayController.accountUnlink);
router.post('/apiAccountHistory', authController.verify, nicePayController.accountHistory);
router.post('/apiAccountHistoryMonth', authController.verify, nicePayController.accountHistoryMonth);
router.post('/apiAccountHistoryMonthERP', authController.verify, nicePayController.accountHistoryMonthERP);

module.exports = router;
