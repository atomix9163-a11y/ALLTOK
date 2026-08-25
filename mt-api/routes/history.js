var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const historyController = require('../app/controllers/historyController.js');


// KKO BIZ & RCS
router.post('/apiList', authController.verify, historyController.list);

router.post('/apiListYearMonth', authController.verify, historyController.listYearMonth);

router.post('/apiCancelReserve', authController.verify, historyController.cancelReserve);

router.post('/apiListDetails', authController.verify, historyController.listDetails);

// MTS
router.post('/apiListMTS', authController.verify, historyController.listMTS);

router.post('/apiListYearMonthMTS', authController.verify, historyController.listYearMonthMTS);

router.post('/apiCancelReserveMTS', authController.verify, historyController.cancelReserveMTS);

router.post('/apiListDetailsMTS', authController.verify, historyController.listDetailsMTS);


module.exports = router;
