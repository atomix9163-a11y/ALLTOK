var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const refuseController = require('../app/controllers/refuseController.js');

// router.get('/apiAddAuto', refuse.smsdisagree);

router.post('/smsdisagree', refuseController.smsdisagree);

router.post('/apiAdd', authController.verify, refuseController.add);

router.post('/apiList', authController.verify, refuseController.list);

router.post('/apiRemove', authController.verify, refuseController.remove);

router.post('/apiUploadExcel', authController.verify, refuseController.uploadExcel);

module.exports = router;
