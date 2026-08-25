const apiService = require('../services/apiService.js');

module.exports = {
    async list(req, res, next) {
        const xToken = req.cookies.xToken;
        let storeCount = await apiService.storeCount(xToken);

        res.render('refuse/list', {             
            layout: 'layouts/default',
            pageTitle: "080 수신거부 관리",
            active: "refuse",
            apiServer: apiServer,
            storeCount: storeCount,
            user: req.user
        });
    },

}