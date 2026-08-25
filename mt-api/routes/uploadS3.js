var express = require("express");
var router = express.Router();
const { S3Client } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')
const uuid = require('uuid');
const path = require("path");
const logger = require("../config/logger");

//* AWS S3 multer 설정
const uploadS3 = multer({
    //* 저장공간
    // s3에 저장
    storage: multerS3({
        // 저장 위치
        s3: new S3Client({
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
            },
            region: "ap-northeast-2",
        }),
        bucket: "alltok.data",        
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key(req, file, cb) {
            cb(null, `${req.headers.location ? req.headers.location : ""}/${uuid.v4()}${path.extname(file.originalname)}`);
        },
    }),
    //* 용량 제한 50Mb
    limits: { fileSize: 50 * 1024 * 1024 },
});

router.post("/uploadSingle", uploadS3.single("uploadFile"), function (req, res, next) {
    const file = req.file;

    if (!file) {
        logger.writeLog("error", `uploadSingleS3: 파일 업로드가 실패했습니다`);
        res.json({ result: "fail", data: "" });
    } else {
        console.log(file)
        logger.writeLog("info", `uploadSingleS3: 파일 업로드 성공 -- ${file.location}`);
        res.json({ result: "success", data: file });
    }
});

module.exports = router;