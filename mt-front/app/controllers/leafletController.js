const storeService = require('../services/storeService.js');
const leafletService = require('../services/leafletService.js');

module.exports = {
    async list(req, res, next) {
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기
        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);

        res.render('leaflet/list', {             
            layout: 'layouts/default',
            pageTitle: "상품세트관리",
            active: "leaflet",
            user: req.user,
            storeInfo: storeInfo
        });
    },

    async edit(req, res, next) {
        const leafletCode = req.query.leafletCode;
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기

        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);        
        let leafletInfo = await leafletService.get(leafletCode, req.cookies.xToken);

        res.render('leaflet/edit', {             
            layout: 'layouts/default',
            pageTitle: "상품상세관리",
            active: "leaflet",
            user: req.user,
            storeInfo: storeInfo,
            leafletInfo: leafletInfo
        });
    },
}