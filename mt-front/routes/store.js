var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const storeController = require('../app/controllers/storeController.js');

router.get('/info', authController.verify, authController.redirectLogin, storeController.info);

// router.get('/banner', authController.verify, authController.redirectLogin, affiliatedStore.banner);

// router.get('/banneruse', authController.verify, authController.redirectLogin, affiliatedStore.bannerUse);

// router.get('/notice', authController.verify, authController.redirectLogin, affiliatedStore.notice);

module.exports = router;
