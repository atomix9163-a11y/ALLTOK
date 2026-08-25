var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const systemController = require('../app/controllers/systemController.js');

/* GET home page. */
router.get('/service', authController.verify, authController.redirectLogin, systemController.service);

module.exports = router;
