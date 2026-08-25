var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const templateController = require('../app/controllers/templateController.js');

router.post('/apiList', authController.verify, templateController.list);
router.post('/apiGet', authController.verify, templateController.get);


module.exports = router;
