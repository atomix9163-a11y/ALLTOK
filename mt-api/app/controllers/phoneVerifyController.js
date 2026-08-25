const phoneVerifyModel = require('../models/phoneVerifyModel.js');
const logger = require("../../config/logger.js");

module.exports = {
    async list(req, res, next) {
        let phone = "";
        let page = req.body.page;
        let rowCount = req.body.rowCount;
        
        const result = await phoneVerifyModel.list(phone, page, rowCount);

        res.status(200).json({
            result: true,
            data: result
        });
    },

    async create(req, res, next) {
        let phone = req.body.phone;
        let comment = req.body.comment;
        
        let result = await phoneVerifyModel.create(phone, comment);

        res.status(200).json({
            result: (result) ? "success" : "fail"
        });
    },

    async remove(req, res, next) {
        let seq = req.body.seq;

        let result = await phoneVerifyModel.remove(seq);

        res.status(200).json({
            result: (result) ? "success" : "fail"
        });
    }
    
}
