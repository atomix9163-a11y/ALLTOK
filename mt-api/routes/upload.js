var express = require("express");
var router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const appRoot = require("app-root-path");
var uuid = require('uuid');
const logger = require("../config/logger");
const imageStorageModel = require('../app/models/imageStorageModel.js');

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var mediaPath = `${appRoot}/public/uploads/${(req.headers.location) ? req.headers.location : ""}`;      
        if (!fs.existsSync(mediaPath)) { fs.mkdirSync(mediaPath, {recursive:true}); };
        callback(null, mediaPath)
    },
    filename: function (req, file, callback) {
        callback(null, uuid.v4() + path.extname(file.originalname));
    }
})

var upload = multer({ storage: storage })

router.post('/uploadSingle', upload.single('uploadFile'), async function(req, res, next) {
    const file = req.file;

    if (!file) {
        logger.writeLog("error", `router/uploadSingle: 파일 업로드가 실패했습니다`);
        res.json({result: 'fail', data: ''});  
    } else {
        const imagePath = `/public/uploads/store/${req.headers.location}/${file.filename}`;
        let imageCode = await imageStorageModel.add(imagePath)
        // console.log(file);
        logger.writeLog("info", `router/uploadSingle: 파일 업로드 성공 -- ${file.path}`);
        res.json({result: 'success', imageCode: imageCode, data: file });
    }
});

router.post('/uploadMulti', upload.array('uploadFiles'), function(req, res, next) {
    const file = req.file;

    if (!file) {
        logger.writeLog("error", `router/uploadSingle: 파일 업로드가 실패했습니다`);
        res.json({result: 'fail', data: ''});  
    } else {
        // console.log(file);
        logger.writeLog("info", `router/uploadSingle: 파일 업로드 성공 -- ${file.path}`);
        res.json({result: 'success', data: file });
    }
});

module.exports = router;