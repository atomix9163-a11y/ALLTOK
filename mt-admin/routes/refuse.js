var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const refuseController = require('../app/controllers/refuseController.js');

/* GET home page. */
router.get('/list', authController.verify, authController.redirectLogin, refuseController.list);

module.exports = router;

