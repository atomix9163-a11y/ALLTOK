var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const cashController = require('../app/controllers/cashController.js');

router.post('/apiCashHistoryList', authController.verify, cashController.historyList);

router.post('/apiAdd', authController.verify, cashController.add);

module.exports = router;
