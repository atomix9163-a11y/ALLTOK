const bcrypt = require("bcrypt");
const cryptoService = require('../services/cryptoService.js');
const userModel = require('../models/userModel.js');

module.exports = {
    async list(req, res, next) {
        let page = req.body.page;
        let rowCount = req.body.rowCount;
        let adminType = req.body.adminType ? req.body.adminType : "";   //"" => all
        let active = req.body.active ? req.body.active : "A";
        
        const result = await userModel.list(page, rowCount, adminType, active);

        res.status(200).json({
            result: true,
            data: result
        });
    },

    async get(req, res, next) {
        const seq = (req.body.seq) ? req.body.seq : "";

        let result = await userModel.get(seq);

        res.status(200).json({
            result: (result) ? true : false,
            data: result
        });
    },

    async create(req, res, next) {
        let loginId = req.body.loginId;
        let password = req.body.password;
        let name = req.body.name;
        let adminType = req.body.adminType;
        let active = req.body.active;
        let C_ID = (req.user) ? req.user.loginId : null;
        
        let duplicateCount = await userModel.checkDuplicate(loginId);
        if (duplicateCount > 0) {
            res.status(200).json({
                result: "duplicate"
            });   
        } else {
            let salt = bcrypt.genSaltSync(10);
            password = bcrypt.hashSync(password, salt);
            // password = cryptoService.cipher(password)

            let result = await userModel.create(loginId, password, name, adminType, active, C_ID);

            res.status(200).json({
                result: (result) ? "success" : "fail"
            });
        }
    },

    async update(req, res, next) {
        let seq = req.body.seq;
        let loginId = req.body.loginId;
        let password = req.body.password;
        let name = req.body.name;
        let adminType = req.body.adminType;
        let active = req.body.active;
        let M_ID = (req.user) ? req.user.loginId : null;

        let salt = bcrypt.genSaltSync(10);
        password = (password.length > 0) ? bcrypt.hashSync(password, salt) : "";
        // password = cryptoService.cipher(password)

        let result = await userModel.update(seq, loginId, password, name, adminType, active, M_ID);

        res.status(200).json({
            result: (result) ? "success" : "fail"
        });
    },

}