const apiService = require('../services/apiService.js');

module.exports = {
    async list(req, res, next) {

        const xToken = req.cookies.xToken;
        let storeCount = await apiService.storeCount(xToken);

        res.render('users/list', {             
            layout: 'layouts/default',
            pageTitle: "사용자 관리",
            active: "user",
            storeCount: storeCount,
            user: req.user
        });
    }
}