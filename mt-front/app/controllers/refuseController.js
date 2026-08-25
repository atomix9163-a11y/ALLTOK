const storeService = require('../services/storeService.js');
// const customerService = require('../services/customerService.js');

module.exports = {
    async list(req, res, next) {
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기
        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);

        res.render('refuse/list', {             
            layout: 'layouts/default',
            pageTitle: "수신거부 관리",
            active: "refuse",
            user: req.user,
            storeInfo: storeInfo
        });
    },

}