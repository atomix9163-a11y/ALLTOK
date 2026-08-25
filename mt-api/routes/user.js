var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const userController = require('../app/controllers/userController.js');

// router.get('/apiList', auth.verify, user.list);
router.post('/apiList', authController.verify, userController.list);

router.post('/apiGet', authController.verify, userController.get);

// router.post('/apiRemove', users.apiRemove);

router.post('/apiCreate', authController.verify, userController.create);

router.post('/apiUpdate', authController.verify, userController.update);

// router.post('/apiUpdateStatus', users.apiUpdateStatus);

module.exports = router;
