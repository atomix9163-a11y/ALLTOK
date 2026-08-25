var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const leafletController = require('../app/controllers/leafletController.js');

router.get('/list', authController.verify, authController.redirectLogin, leafletController.list);

router.get('/edit', authController.verify, authController.redirectLogin, leafletController.edit);

module.exports = router;
