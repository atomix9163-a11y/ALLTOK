const apiService = require('../services/apiService.js');

module.exports = {
    async profile(req, res, next) {

        const xToken = req.cookies.xToken;
        let storeCount = await apiService.storeCount(xToken);

        res.render('kakao/profileList', {             
            layout: 'layouts/default',
            pageTitle: "카카오 프로파일 관리",
            active: "profile",
            storeCount: storeCount,
            user: req.user
        });
    },

    async template(req, res, next) {

        const xToken = req.cookies.xToken;
        let storeCount = await apiService.storeCount(xToken);

        res.render('kakao/templateList', {             
            layout: 'layouts/default',
            pageTitle: "카카오 템플릿 관리",
            active: "template",
            storeCount: storeCount,
            user: req.user
        });
    }
}