const storeService = require('../services/storeService.js');
const customersService = require('../services/customerService.js');

const numeral = require('numeral');

module.exports = {
    async agreement(req, res, next) {
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기
        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);

        res.render('agreement/agreement', {             
            layout: 'layouts/default',
            pageTitle: "서비스 약관",
            active: "agreement",
            user: req.user,
            storeInfo: storeInfo,
            numeral: numeral
        });
    },

    async privacy(req, res, next) {
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기
        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);

        res.render('agreement/privacy', {
            layout: 'layouts/default',
            pageTitle: "이용자보호",
            active: "privacy",
            user: req.user,
            storeInfo: storeInfo,
            numeral: numeral
        });
    },


}