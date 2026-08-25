var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const orderController = require('../app/controllers/orderController.js');

router.post('/apiList', authController.verify, orderController.list);

router.post('/apiGet', orderController.get);
router.post('/apiDetail', orderController.detail);
router.post('/apiHistory', orderController.history);

router.post('/apiSetPrint', authController.verify, orderController.setPrint);
router.post('/apiSetStatus', authController.verify, orderController.setStatus);

router.post('/apiGetOCODEBase', orderController.getOCodeBase);

router.post('/apiGetPAYCODEBase', orderController.getPAYCODEBase);

router.post('/apiCreate', orderController.create);

router.post('/apiFindByPhone', orderController.findByPhone);

module.exports = router;
