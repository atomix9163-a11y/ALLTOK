const apiService = require('../services/apiService.js');

module.exports = {
    async list(req, res, next) {

        const xToken = req.cookies.xToken;
        let storeCount = await apiService.storeCount(xToken);

        res.render('phone/list', {             
            layout: 'layouts/default',
            pageTitle: "발신번호 등록관리",
            active: "phone",
            storeCount: storeCount,
            user: req.user
        });
    }
}