const imageModel = require('../models/imageModel.js');
const shuketConnectModel = require('../models/shuketConnect.js');
const logger = require("../../config/logger");

module.exports = {
    async listCategory(req, res, next) {
        const result = await imageModel.listCategory();

        res.status(200).json({
            result: true,
            data: result
        });
    },

    async list(req, res, next) {
        const categoryCode = req.body.categoryCode;
        const tags = req.body.tags ? req.body.tags : "";
        let page = req.body.page;
        let rowCount = req.body.rowCount;
        let active = req.body.active ? req.body.active : 'Y';
        
        const result = await imageModel.list(categoryCode, tags, page, rowCount, active);

        res.status(200).json({
            result: true,
            data: result
        });
    },

    async get(req, res, next) {
        const imageCode = req.body.imageCode;

        let result = await imageModel.get(imageCode);

        res.status(200).json({
            result: (result) ? true : false,
            data: result
        });
    },

    async create(req, res, next) {
        let categoryCode = req.body.categoryCode;
        let path = req.body.path;
        let tags = req.body.tags;
        let C_ID = (req.user) ? req.user.loginId : null;
        
        let result = await imageModel.create(categoryCode, path, tags, C_ID);

        res.status(200).json({
            result: (result) ? "success" : "fail"
        });
    },

    async update(req, res, next) {
        let imageCode = req.body.imageCode;
        let categoryCode = req.body.categoryCode;        
        let tags = req.body.tags;        
        let M_ID = (req.user) ? req.user.loginId : null;

        let result = await imageModel.update(imageCode, categoryCode, tags, M_ID);

        res.status(200).json({
            result: (result) ? "success" : "fail"
        });
    },

    async terminate(req, res, next) {
        // 이미지 정보를 얻는다
        const imageCode = req.body.imageCode;
        const imageInfo = await imageModel.get(imageCode);

        // S3파일을 먼저 삭제
        const aws = require('aws-sdk');
        const s3 = new aws.S3({
            accessKeyId: process.env.S3_ACCESS_KEY, 
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            region: "ap-northeast-2"
        });
        logger.writeLog("info", `S3에서 ${imageCode}를 삭제합니다.`);
        s3.deleteObject({
            Bucket: 'alltok.data', // 삭제하고 싶은 이미지가 있는 버킷 이름
            Key: imageInfo.path, // 삭제하고 싶은 이미지의 key 
        }, async (err, data) => {
            if (err) {
                logger.writeLog("error", `S3에서 ${imageCode}를 삭제 실패했습니다.`);
                res.status(200).json({
                    result: "fail"
                });
            }
            else {
                logger.writeLog("info", `S3에서 ${imageCode}를 삭제하였습니다.`);
                await imageModel.remove(imageCode);
                res.status(200).json({
                    result: "success"
                });
            }
        });

    },

    async findPhotoShuket(req, res, next) {
        let existBarCode = req.body.existBarCode;
        let keyword = req.body.keyword;
        let page = req.body.page;
        let rowCount = req.body.rowCount;

        let data = await shuketConnectModel.findPhotoShuketByName(existBarCode, keyword, page, rowCount);

        res.status(200).json({
            result: true,
            data: data
        });
    },

    async getPhotoShuket(req, res, next) {
        let barcodes = req.body.barcodes;

        let result = await shuketConnectModel.getPhotoShuket(barcodes);

        res.status(200).json({
            result: (result) ? "success" : "fail",
            data: result
        });
    },

    async getPhotoByNameShuket(req, res, next) {
        let findPhotoJSONArray = JSON.parse(req.body.findPhotoJSONString);

        let data = await shuketConnectModel.findPhotosShuketByName(findPhotoJSONArray);

        res.status(200).json({
            result: true,
            data: data
        });
    },
    
}
