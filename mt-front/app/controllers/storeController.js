const storeService = require('../services/storeService.js');
const customersService = require('../services/customerService.js');

const numeral = require('numeral');

module.exports = {
    async info(req, res, next) {
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기
        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);

        res.render('store/info', {             
            layout: 'layouts/default',
            pageTitle: "가맹점 정보",
            active: "info",
            user: req.user,
            storeInfo: storeInfo,
            numeral: numeral
        });
    },

    // async banner(req, res, next) {
    //     const store_code = req.user.store_code;   // 로그인한 마트의 번호 얻기

    //     let storeInfo = await storeService.getInfo(store_code, req.cookies.xToken);

    //     res.render('affiliatedStore/banner', {             
    //         layout: 'layouts/default',
    //         pageTitle: "배너 관리",
    //         active: "banner",
    //         user: req.user,
    //         storeInfo: storeInfo
    //     });
    // },

    // async bannerUse(req, res, next) {
    //     const store_code = req.user.store_code;   // 로그인한 마트의 번호 얻기

    //     let storeInfo = await storeService.getInfo(store_code, req.cookies.xToken);

    //     res.render('affiliatedStore/bannerUse', {             
    //         layout: 'layouts/default',
    //         pageTitle: "배너 관리",
    //         active: "banner",
    //         user: req.user,
    //         storeInfo: storeInfo
    //     });
    // },

    // async notice(req, res, next) {
    //     const store_code = req.user.store_code;   // 로그인한 마트의 번호 얻기

    //     let storeInfo = await storeService.getInfo(store_code, req.cookies.xToken);

    //     res.render('affiliatedStore/notice', {             
    //         layout: 'layouts/default',
    //         pageTitle: "공지사항 관리",
    //         active: "notice",
    //         user: req.user,
    //         storeInfo: storeInfo
    //     });
    // },
    

}