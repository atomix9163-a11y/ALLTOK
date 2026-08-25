const apiService = require('../services/apiService.js');

const numeral = require('numeral');
const moment = require('moment');

module.exports = {
    async service(req, res, next) {
        const xToken = req.cookies.xToken;
        const storeCount = await apiService.storeCount(xToken);

        res.render('system/service', {             
            layout: 'layouts/default',
            pageTitle: "서비스 운영 설정",
            active: "service",
            storeCount: storeCount,
            moment: moment,
            numeral: numeral,
            user: req.user
        });
    },
    
}