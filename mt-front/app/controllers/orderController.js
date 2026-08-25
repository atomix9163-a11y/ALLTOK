const storeService = require('../services/storeService.js');
const orderService = require('../services/orderService.js');
const numeral = require('numeral');
const moment = require('moment');

module.exports = {
    async list(req, res, next) {
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기
        const searchType = req.query.searchType;
        const searchValue = req.query.searchValue;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const o_status = req.query.o_status;
        const o_payMethod = req.query.o_payMethod;
        const o_platform = req.query.o_platform;
        const page = (req.query.page) ? req.query.page : "1";

        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);

        res.render('order/list', {             
            layout: 'layouts/default',
            pageTitle: "주문 내역",
            active: "order",
            user: req.user,
            storeInfo: storeInfo,
            searchType: searchType,
            searchValue: searchValue,
            startDate: startDate,
            endDate: endDate,
            o_status: o_status,
            o_payMethod: o_payMethod,
            o_platform: o_platform,
            page: page
        });
    },

    async details(req, res, next) {
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기
        const O_CODE = req.query.O_CODE;
        const searchType = req.query.searchType;
        const searchValue = req.query.searchValue;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const o_status = req.query.o_status;
        const o_payMethod = req.query.o_payMethod;
        const o_platform = req.query.o_platform;
        const page = (req.query.page) ? req.query.page : "1";

        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);

        // 주문 상세 얻기
        const orderInfo = await orderService.get(O_CODE);
        let orderDetails = await orderService.getDetails(O_CODE);
        let orderHistory = await orderService.getHistory(O_CODE);

        res.render('order/details', {             
            layout: 'layouts/default',
            pageTitle: "주문 상세",
            active: "order",
            user: req.user,
            storeInfo: storeInfo,
            moment: moment,
            numeral: numeral,
            orderInfo: orderInfo,
            searchType: searchType,
            searchValue: searchValue,
            startDate: startDate,
            endDate: endDate,
            o_status: o_status,
            o_payMethod: o_payMethod,
            o_platform: o_platform,
            orderDetails: orderDetails,
            orderHistory: orderHistory,
            page: page
        });
    },

    async print(req, res, next) {
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기
        const O_CODE = req.query.O_CODE;

        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);

        // 주문 상세 얻기
        const orderInfo = await orderService.get(O_CODE);
        let orderDetails = await orderService.getDetails(O_CODE);       

        res.render('order/print', {             
            layout: 'layouts/blink',
            pageTitle: "주문 상세",
            active: "order",
            user: req.user,
            storeInfo: storeInfo,
            moment: moment,
            numeral: numeral,
            orderInfo: orderInfo,
            orderDetails: orderDetails
        });
    },
    
    async smsadmin(req, res, next) {
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기

        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);
        storeInfo.use_hide_sms = JSON.stringify(storeInfo.use_hide_sms);
        
        res.render('order/smsadmin', {             
            layout: 'layouts/default',
            pageTitle: "주문 알림",
            active: "smsadmin",
            user: req.user,
            storeInfo: storeInfo
        });
    },
    
}