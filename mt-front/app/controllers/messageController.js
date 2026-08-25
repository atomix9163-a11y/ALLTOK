const storeService = require('../services/storeService.js');
const customerService = require('../services/customerService.js');

const numeral = require('numeral');
const moment = require('moment');

module.exports = {
    async sms(req, res, next) {
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기
        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);

        res.render('message/sms', {             
            layout: 'layouts/default',
            pageTitle: "짧은 문자(SMS) 보내기",
            active: "sms",
            user: req.user,
            storeInfo: storeInfo
        });
    },

    async lms(req, res, next) {
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기
        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);

        res.render('message/lms', {             
            layout: 'layouts/default',
            pageTitle: "긴 문자(LMS) 보내기",
            active: "lms",
            user: req.user,
            storeInfo: storeInfo
        });
    },
    
    async rcssms(req, res, next) {
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기
        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);
        
        res.render('message/rcssms', {             
            layout: 'layouts/default',
            pageTitle: "짧은 문자(RCS SMS) 보내기",
            active: "sms",
            user: req.user,
            storeInfo: storeInfo
        });
    },

    async rcslms(req, res, next) {
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기
        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);

        res.render('message/rcslms', {             
            layout: 'layouts/default',
            pageTitle: "긴 문자(RCS LMS) 보내기",
            active: "lms",
            user: req.user,
            storeInfo: storeInfo
        });
    },    
    
    async kkoAT(req, res, next) {
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기
        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);

        // const ejs = (storeCode == "AT000010" || storeCode == "MT000006") ? 'message/kkoAT2' : 'message/kkoAT';
        res.render('message/kkoAT', {
            layout: 'layouts/default',
            pageTitle: "카카오 알림톡",
            active: "at",
            user: req.user,
            storeInfo: storeInfo
        });
    },

    async kkoFT(req, res, next) {
        const store_code = req.user.store_code;   // 로그인한 마트의 번호 얻기
        let storeInfo = await storeService.getInfo(store_code, req.cookies.xToken);

        let groupList = await customerService.getGroupList(store_code, ['P', 'K', 'N'], req.cookies.xToken);
        res.render('message/kkoFT', {             
            layout: 'layouts/default',
            pageTitle: "카카오 친구(채널)톡",
            active: "message",
            user: req.user,
            storeInfo: storeInfo,
            numeral: numeral,
            groupList: groupList
        });
    },

    // 푸시 정보 입력 - 앱 푸시 및 복합 푸시용
    async complex(req, res, next) {
        const store_code = req.user.store_code;   // 로그인한 마트의 번호 얻기
        let storeInfo = await storeService.getInfo(store_code, req.cookies.xToken);        
        
        let topicList = [];
        let groupList = await customerService.getGroupList(store_code, ['P', 'K', 'N'], req.cookies.xToken);
        res.render('message/complex', {             
            layout: 'layouts/default',
            pageTitle: "복합 문자/웹주문 발송 시스템",
            active: "message",
            user: req.user,
            storeInfo: storeInfo,
            numeral: numeral,
            topicList: topicList,
            groupList: groupList
        });
    },

}