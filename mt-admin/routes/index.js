var express = require('express');
var router = express.Router();
const auth = require('../app/controllers/authController.js');
// const dashboard = require('../app/controllers/dashboard.js');
const storeController = require('../app/controllers/storeController.js');

/* GET home page. */
// router.get('/', auth.verify, auth.redirectLogin, dashboard.dashboard);
router.get('/', auth.verify, auth.redirectLogin, storeController.list);

module.exports = router;
