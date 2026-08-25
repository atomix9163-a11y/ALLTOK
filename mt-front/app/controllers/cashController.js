const storeService = require('../services/storeService.js');

module.exports = {
    async notice(req, res, next) {
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기
        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);

        // 가상계좌 연결 정보를 가져온다
        const accountInfo = await storeService.getVirtualAccount(storeCode, req.cookies.xToken);

        let ejs = (accountInfo && accountInfo.bank_account != '') ? 'cash/virtualBank' : 'cash/notice' ;
        
        res.render(ejs, {
            layout: 'layouts/default',
            pageTitle: "예치금 가상 계좌 충전안내",
            active: "cashinfo",
            user: req.user,
            storeInfo: storeInfo
        });
    },

    async history(req, res, next) {
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기
        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);

        const page = (req.query.page) ? req.query.page : "1";

        res.render('cash/history', {             
            layout: 'layouts/default',
            pageTitle: "예치금 충전내역",
            active: "cash",
            user: req.user,
            storeInfo: storeInfo,
            page: page           
        });
    },

}