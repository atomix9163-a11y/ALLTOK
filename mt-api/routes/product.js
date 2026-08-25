var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const productController = require('../app/controllers/productController.js');

// router.post('/apiGet', products.get);

// router.post('/apiGetProductCode', products.getProductCode);

// router.post('/apiGetProductListCode', products.getProductListCode);

// router.post('/apiGetForMobile', products.getForMobile);

// router.post('/apiList', products.list);

// router.post('/apiListSelected', products.listSelected);

// router.post('/apiListForMobile', products.listForMobile);

// router.post('/apiUploadExcel', products.uploadExcel);

// router.post('/apiSetStatus', products.setStatus);

// router.post('/apiSetStatusMulti', products.setStatusMulti);

// router.post('/apiFindPhotoShuket', authController.verify, productController.findPhoto);

// router.post('/apiChangePhoto', authController.verify, productController.changePhoto);

// router.post('/apiUpdate', auth.verify, products.update);

// router.post('/apiCreate', auth.verify, products.create);

// router.post('/apiFind', auth.verify, products.find);

module.exports = router;
