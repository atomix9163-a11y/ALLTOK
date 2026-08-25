var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const historyController = require('../app/controllers/historyController.js');

// router.get('/list', auth.verify, auth.redirectLogin, history.list);

router.get('/rcslist', authController.verify, authController.redirectLogin, historyController.list);

router.get('/rcslistYearMonth', authController.verify, authController.redirectLogin, historyController.listYearMonth);

router.get('/rcsdetails', authController.verify, authController.redirectLogin, historyController.details);

router.get('/rcslistMTS', authController.verify, authController.redirectLogin, historyController.listMTS);

router.get('/rcslistYearMonthMTS', authController.verify, authController.redirectLogin, historyController.listYearMonthMTS);

router.get('/rcsdetailsMTS', authController.verify, authController.redirectLogin, historyController.detailsMTS);

module.exports = router;
