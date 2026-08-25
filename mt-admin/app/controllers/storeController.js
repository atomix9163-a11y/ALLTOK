const apiService = require('../services/apiService.js');

const numeral = require('numeral');
const moment = require('moment');

module.exports = {
    async list(req, res, next) {
        const xToken = req.cookies.xToken;
        let storeCount = await apiService.storeCount(xToken);

        res.render('store/list', {             
            layout: 'layouts/default',
            pageTitle: "가맹점 관리",
            active: "store",
            user: req.user,
            storeCount: storeCount,
        });
    },

    async charge(req, res, next) {
        const xToken = req.cookies.xToken;
        let storeCount = await apiService.storeCount(xToken);

        res.render('store/charge', {             
            layout: 'layouts/default',
            pageTitle: "가맹점 충전 관리",
            active: "cash",
            user: req.user,
            storeCount: storeCount,
        });
    },

    async account(req, res, next) {
        const xToken = req.cookies.xToken;
        let storeCount = await apiService.storeCount(xToken);

        res.render('store/account', {             
            layout: 'layouts/default',
            pageTitle: "가상계좌연결 관리",
            active: "account",
            user: req.user,
            storeCount: storeCount,
        });
    },

    async accountManage(req, res, next) {
        const xToken = req.cookies.xToken;
        let storeCount = await apiService.storeCount(xToken);

        res.render('store/accountManage', {             
            layout: 'layouts/default',
            pageTitle: "가상계좌충전내역",
            active: "accountmanage",
            user: req.user,
            storeCount: storeCount,
        });
    },
    
}