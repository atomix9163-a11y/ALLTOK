var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const imageController = require('../app/controllers/imageController.js');

router.post('/apiListCategory', authController.verify, imageController.listCategory);
router.post('/apiList', authController.verify, imageController.list);
router.post('/apiGet', authController.verify, imageController.get);
router.post('/apiCreate', authController.verify, imageController.create);
router.post('/apiUpdate', authController.verify, imageController.update);

router.post('/apiTerminate', authController.verify, imageController.terminate);

// 키워드로 슈켓 이미지 검색
router.post('/apiFindPhotoShuket', authController.verify, imageController.findPhotoShuket);
// 바코드 목록으로 슈켓 이미지 검색
router.post('/apiGetPhotosShuket', authController.verify, imageController.getPhotoShuket);
// 이름 목록으로 슈켓 이미지 검색
router.post('/apiGetPhotosFromNameShuket', authController.verify, imageController.getPhotoByNameShuket);

module.exports = router;
