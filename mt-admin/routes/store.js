const express = require('express');
const router = express.Router();
const auth = require('../app/controllers/authController.js');
const storeController = require('../app/controllers/storeController.js');

/* GET home page. */
router.get('/list', auth.verify, auth.redirectLogin, storeController.list);

router.get('/charge', auth.verify, auth.redirectLogin, storeController.charge);

router.get('/account', auth.verify, auth.redirectLogin, storeController.account);

router.get('/accountmanage', auth.verify, auth.redirectLogin, storeController.accountManage);

module.exports = router;
