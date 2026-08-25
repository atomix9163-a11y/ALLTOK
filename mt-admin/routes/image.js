const express = require('express');
const router = express.Router();
const auth = require('../app/controllers/authController.js');
const imageController = require('../app/controllers/imageController.js');

/* GET home page. */
router.get('/list', auth.verify, auth.redirectLogin, imageController.list);

module.exports = router;
