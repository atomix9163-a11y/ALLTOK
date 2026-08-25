const systemModel = require('../models/systemModel.js');
const systemService = require('../services/systemService.js');

module.exports = {
    async get(req, res, next) {
        let keyword = req.body.keyword;
        let data = await systemModel.get(keyword);

        res.status(200).json({
            result: true,
            data: data
        });
    },

    async list(req, res, next) {
        let data = await systemModel.list();

        res.status(200).json({
            result: true,
            data: data
        });
    },

    async save(req, res, next) {
        let keyword = req.body.keyword;

        if (keyword == "SERVICE") {
            systemService.saveUseService(req, res, next);
        }
    },

}