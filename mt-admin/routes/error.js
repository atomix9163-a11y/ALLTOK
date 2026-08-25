var express = require('express');
var router = express.Router();
const error = require('../app/controllers/error.js');

router.get('/404', error.error404);
router.get('/500', error.error500);

module.exports = router;
