const apiService = require('../services/apiService.js');

module.exports = {
    async list(req, res, next) {

        const xToken = req.cookies.xToken;
        const categoryCode = req.query.category ? req.query.category : "";
        let storeCount = await apiService.storeCount(xToken);

        res.render('image/list', {             
            layout: 'layouts/default',
            pageTitle: "이미지 관리",
            active: "image",
            storeCount: storeCount,
            categoryCode: categoryCode,
            user: req.user
        });
    }
}