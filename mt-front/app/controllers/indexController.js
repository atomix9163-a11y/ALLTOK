const storeService = require('../services/storeService.js');

module.exports = {
    async indexRouter(req, res, next) {
        // 마트의 서비스 상황에 따라서 첫 페이지를 이동한다
        // AT -> SMS -> LMS 순서
        // 마트 서비스 정보를 가져온다
        const xToken = req.cookies.xToken;
        const storeCode = req.user.storeCode
        const service = await storeService.getService(xToken, storeCode);
        
        console.log(req.user, service)

        if (service.AT == 'Y') {
            res.redirect("/message/kkoAT");
        } else if (service.RCSSMS == 'Y') {
            res.redirect("/message/rcssms");
        } else if (service.SMS == 'Y') {
            res.redirect("/message/sms");
        } else if (service.RCSLMS == 'Y') {
            res.redirect("/message/rcslms");
        } else if (service.LMS == 'Y') {
            res.redirect("/message/lms");
        } else {
            res.redirect("/store/info");
        }
    },


}