const templateModel = require('../models/templateModel.js');

module.exports = {
    async get(req, res, next) {
        let templateCode = req.body.templateCode;
        let data = await templateModel.get(templateCode);

        res.status(200).json({
            result: true,
            data: data
        });
    },

    async list(req, res, next) {
        const page = req.body.page;
        const rowCount = req.body.rowCount;
        let data = await templateModel.list(page, rowCount);

        res.status(200).json({
            result: true,
            data: data
        });
    },

}