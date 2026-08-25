var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const systemController = require('../app/controllers/systemController.js');

router.post('/apiGet', authController.verify, systemController.get);

router.post('/apiList', authController.verify, systemController.list);

router.post('/apiSave', authController.verify, systemController.save);

module.exports = router;
