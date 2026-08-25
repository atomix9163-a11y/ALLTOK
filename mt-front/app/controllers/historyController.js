const storeService = require('../services/storeService.js');

module.exports = {
    //**************** */ KKO BIZ and RCS
    async list(req, res, next) {
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기
        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);
        const page = (req.query.page) ? req.query.page : "1";
        
        res.render('history/rcslist', {             
            layout: 'layouts/default',
            pageTitle: "문자(단문,장문,알림톡) 발송 내역",
            active: "history",
            user: req.user,
            storeInfo: storeInfo,
            page: page            
        });
    },

    async listYearMonth(req, res, next) {
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기
        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);
        const yearMonth = req.query.yearMonth;
        const page = (req.query.page) ? req.query.page : "1";
        
        res.render('history/rcslistYearMonth', {             
            layout: 'layouts/default',
            pageTitle: "문자(단문,장문,알림톡) 발송 내역 - 이전 기록",
            active: "historyOld",
            user: req.user,
            storeInfo: storeInfo,
            yearMonth: yearMonth,
            page: page            
        });
    },

    async details(req, res, next) {
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기
        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);
        const reserveCode = (req.query.rcode) ? req.query.rcode : "";
        const yearMonth = (req.query.yearMonth) ? req.query.yearMonth : "";
        const page = (req.query.page) ? req.query.page : "1";

        if (reserveCode == "") {
            res.redirect("/history/list");
        }

        res.render('history/rcsdetails', {
            layout: 'layouts/default',
            pageTitle: "문자/알림톡 발송 상세 내역",
            active: yearMonth == "" ? "history" : "historyOld",
            user: req.user,
            storeInfo: storeInfo,
            reserveCode: reserveCode,
            yearMonth: yearMonth,
            page: page
        });
    },
    //**************** */ KKO BIZ and RCS end

    //**************** MTS AT/SMS/LMS
    async listMTS(req, res, next) {
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기
        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);
        const page = (req.query.page) ? req.query.page : "1";
        
        res.render('history/rcslistMTS', {             
            layout: 'layouts/default',
            pageTitle: "문자(단문,장문,알림톡) 발송 내역",
            active: "historyMTS",
            user: req.user,
            storeInfo: storeInfo,
            page: page            
        });
    },

    async listYearMonthMTS(req, res, next) {
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기
        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);
        const yearMonth = req.query.yearMonth;
        const page = (req.query.page) ? req.query.page : "1";
        
        res.render('history/rcslistYearMonthMTS', {             
            layout: 'layouts/default',
            pageTitle: "문자(단문,장문,알림톡) 발송 내역 - 이전 기록",
            active: "historyOldMTS",
            user: req.user,
            storeInfo: storeInfo,
            yearMonth: yearMonth,
            page: page            
        });
    },

    async detailsMTS(req, res, next) {
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기
        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);
        const reserveCode = (req.query.rcode) ? req.query.rcode : "";
        const yearMonth = (req.query.yearMonth) ? req.query.yearMonth : "";
        const type = (req.query.type) ? req.query.type : "AT";
        const page = (req.query.page) ? req.query.page : "1";

        if (reserveCode == "") {
            res.redirect("/history/listMTS");
        }

        res.render('history/rcsdetailsMTS', {
            layout: 'layouts/default',
            pageTitle: "문자/알림톡 발송 상세 내역",
            active: yearMonth == "" ? "historyMTS" : "historyOldMTS",
            user: req.user,
            storeInfo: storeInfo,
            reserveCode: reserveCode,
            type: type,
            yearMonth: yearMonth,
            page: page
        });
    },
    //**************** MTS AT/SMS/LMS end
}