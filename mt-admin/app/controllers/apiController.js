const apiService = require('../services/apiService.js');
// const moment = require('moment');

module.exports = {
    /***************************************************/
    // 로그인
    async authLogin(req, res, next) {
        const loginId = req.body.loginId;
        const password = req.body.password;

        let response = await apiService.authLogin(loginId, password);

        res.status(200).json({
            result: true,
            data: response
        });
    },
    // 로그인 끝
    /***************************************************/

    /***************************************************/
    // 스토어
    async storeList(req, res, next) {
        const xToken = req.cookies.xToken;
        const searchKey = (req.body.searchKey) ? req.body.searchKey : "";        
        const page = (req.body.page) ? req.body.page : "1";
        const rowCount = (req.body.rowCount) ? req.body.rowCount : "20";

        let response = await apiService.storeList(xToken, searchKey, page, rowCount);

        res.status(200).json({
            result: true,
            data: response
        });
    },

    async storeGet(req, res, next) {
        const xToken = req.cookies.xToken;
        const storeCode = req.body.storeCode;

        let response = await apiService.storeGet(xToken, storeCode);

        res.status(200).json({
            result: true,
            data: response
        });
    },    

    async storeCreate(req, res, next) {
        const xToken = req.cookies.xToken;
        const mCode = req.body.mCode;
        const martCode = req.body.martCode;
        const POSType = req.body.POSType;
        const name = req.body.name;
        const owener = req.body.owener;
        const nameReg = req.body.nameReg;
        const regno = req.body.regno;
        const address = req.body.address;
        const email = req.body.email;
        const contact = req.body.contact;
        const loginId = req.body.loginId;
        const loginPwd = req.body.loginPwd;
        const shuketManager = req.body.shuketManager;
        const managerId = req.body.managerId;
        const shopType = req.body.shopType;
        const active = req.body.active;
        
        let response = await apiService.storeCreate(xToken, mCode, martCode, shopType, shuketManager, managerId, POSType, name, owener, nameReg, regno, address, email, contact, loginId, loginPwd, active);

        res.status(200).json({
            result: true,
            data: response
        });
    },    

    async storeUpdate(req, res, next) {
        const xToken = req.cookies.xToken;
        const storeCode = req.body.storeCode;
        const mCode = req.body.mCode;
        const martCode = req.body.martCode;
        const POSType = req.body.POSType;        
        const name = req.body.name;
        const owener = req.body.owener;
        const nameReg = req.body.nameReg;
        const regno = req.body.regno;
        const address = req.body.address;
        const email = req.body.email;
        const contact = req.body.contact;
        const loginId = req.body.loginId;
        const loginPwd = req.body.loginPwd;
        const shuketManager = req.body.shuketManager;
        const managerId = req.body.managerId;
        const shopType = req.body.shopType;
        const active = req.body.active;
        
        let response = await apiService.storeUpdate(xToken, mCode, martCode, storeCode, shopType, shuketManager, managerId, POSType, name, owener, nameReg, regno, address, email, contact, loginId, loginPwd, active);

        res.status(200).json({
            result: true,
            data: response
        });
    },  
    // 스토어 끝
    /***************************************************/

    /***************************************************/
    // 스토어 서비스
    async storeServiceGet(req, res, next) {
        const xToken = req.cookies.xToken;
        const storeCode = req.body.storeCode;
        
        let response = await apiService.storeServiceGet(xToken, storeCode);

        res.status(200).json({
            result: true,
            data: response
        });
    },  
    
    async storeServiceSave(req, res, next) {
        const xToken = req.cookies.xToken;
        const storeCode = req.body.storeCode;
        const serviceJSON = {
            callPhone: req.body.callPhone,
            brandKey: req.body.brandKey,
            balanceCheck: req.body.balanceCheck,                
            useShop: req.body.useShop,
            allowAppPush: req.body.allowAppPush,
            allowSendRepeat: req.body.allowSendRepeat,
            shopShortUrl: req.body.shopShortUrl,
            shopIndex: req.body.shopIndex,                
            SMS: req.body.SMS,
            LMS: req.body.LMS,
            RCSSMS: req.body.RCSSMS,
            RCSLMS: req.body.RCSLMS,
            AT: req.body.AT,
            kakaoClientId: req.body.kakaoClientId,
            kakaoProfilekey: req.body.kakaoProfilekey,
            kakaoDefaultTemplate: req.body.kakaoDefaultTemplate,
            MTS_use: req.body.MTS_use,
            MTS_kakaoProfilekey: req.body.MTS_kakaoProfilekey,
            MTS_kakaoDefaultTemplate: req.body.MTS_kakaoDefaultTemplate,
            androidScheme: req.body.androidScheme,
            androidPackage: req.body.androidPackage,
            iosAppId: req.body.iosAppId,
            UP_SMS: req.body.UP_SMS,
            UP_LMS: req.body.UP_LMS,
            UP_RCSSMS: req.body.UP_RCSSMS,
            UP_RCSLMS: req.body.UP_RCSLMS,
            UP_AT: req.body.UP_AT
        }
        console.log(serviceJSON)
        
        let response = await apiService.storeServiceSave(xToken, storeCode, serviceJSON);

        res.status(200).json({
            result: true,
            data: response
        });
    },     
    // 스토어 서비스 끝
    /***************************************************/

    /***************************************************/
    // 스토어 캐시
    async storeCashHistory(req, res, next) {
        const xToken = req.cookies.xToken;
        const storeCode = req.body.storeCode;
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;
        const page = req.body.page;
        const rowCount = req.body.rowCount;
        const cashType = req.body.cashType;
        
        let response = await apiService.storeCashHistory(xToken, storeCode, cashType, startDate, endDate, page, rowCount);

        res.status(200).json({
            result: true,
            data: response
        });
    },
    
    async storeCashAdd(req, res, next) {
        const xToken = req.cookies.xToken;
        const storeCode = req.body.storeCode;
        const amount = req.body.amount;
        const cashType = req.body.cashType;
        
        let response = await apiService.storeCashAdd(xToken, storeCode, cashType, amount);

        res.status(200).json({
            result: true,
            data: response
        });
    },
    // 스토어 /***************************************************/ 끝
    /***************************************************/

    /***************************************************/
    // 가상계좌
    async accountList(req, res, next) {
        const xToken = req.cookies.xToken;
        const notAssigned = (req.body.notAssigned) ? req.body.notAssigned : "N";
        const accountType = (req.body.accountType) ? req.body.accountType : "62";
        const searchKey = (req.body.searchKey) ? req.body.searchKey : "";
        const page = (req.body.page) ? req.body.page : "1";
        const rowCount = (req.body.rowCount) ? req.body.rowCount : "20";

        let response = await apiService.accountList(xToken, notAssigned, accountType, searchKey, page, rowCount);

        res.status(200).json({
            result: true,
            data: response
        });
    },

    async accountLink(req, res, next) {
        const xToken = req.cookies.xToken;
        const accountCode = req.body.accountCode;
        const storeCode = req.body.storeCode;

        let response = await apiService.accountLink(xToken, accountCode, storeCode);

        res.status(200).json({
            result: true,
            data: response
        });
    },

    async accountHistory(req, res, next) {
        const xToken = req.cookies.xToken;
        const storeCode = req.body.storeCode;
        const page = (req.body.page) ? req.body.page : "1";
        const rowCount = (req.body.rowCount) ? req.body.rowCount : "20";

        let response = await apiService.accountHistory(xToken, storeCode, page, rowCount);

        res.status(200).json({
            result: true,
            data: response
        });
    },
    
    async accountHistoryMonth(req, res, next) {
        const xToken = req.cookies.xToken;
        const year = req.body.year;
        const month = req.body.month;
        const page = (req.body.page) ? req.body.page : "1";
        const rowCount = (req.body.rowCount) ? req.body.rowCount : "20";

        let response = await apiService.accountHistoryMonth(xToken, year, month, page, rowCount);

        res.status(200).json({
            result: true,
            data: response
        });
    },
    

    async accountHistoryMonthERP(req, res, next) {
        const xToken = req.cookies.xToken;
        const year = req.body.year;
        const month = req.body.month;

        let response = await apiService.accountHistoryMonthERP(xToken, year, month);

        res.status(200).json({
            result: true,
            data: response
        });
    },

    
    /***************************************************/
    // 발신번호 
    async phoneList(req, res, next) {
        const xToken = req.cookies.xToken;
        const page = (req.body.page) ? req.body.page : "1";
        const rowCount = (req.body.rowCount) ? req.body.rowCount : "20";

        let response = await apiService.phoneList(xToken, page, rowCount);

        res.status(200).json({
            result: true,
            data: response
        });
    },

    async phoneCreate(req, res, next) {
        const xToken = req.cookies.xToken;
        const phone = req.body.phone;
        const comment = req.body.comment;

        let response = await apiService.phoneCreate(xToken, phone, comment);

        res.status(200).json({
            result: true,
            data: response
        });
    },

    async phoneRemove(req, res, next) {
        const xToken = req.cookies.xToken;
        const seq = req.body.seq;        

        let response = await apiService.phoneRemove(xToken, seq);

        res.status(200).json({
            result: true,
            data: response
        });
    },

    // 발신번호 끝
    /***************************************************/
    
    /***************************************************/
    // 사용자 
    async userList(req, res, next) {
        const xToken = req.cookies.xToken;
        const adminType = (req.body.adminType) ? req.body.adminType : "";
        const page = (req.body.page) ? req.body.page : "1";
        const rowCount = (req.body.rowCount) ? req.body.rowCount : "20";

        let response = await apiService.userList(xToken, adminType, page, rowCount);

        res.status(200).json({
            result: true,
            data: response
        });
    },

    async userGet(req, res, next) {
        const xToken = req.cookies.xToken;
        const seq = req.body.seq;        

        let response = await apiService.userGet(xToken, seq);

        res.status(200).json({
            result: true,
            data: response
        });
    },

    async userCreate(req, res, next) {
        const xToken = req.cookies.xToken;
        const loginId = req.body.loginId;
        const password = req.body.password;
        const name = req.body.name;
        const adminType = req.body.adminType;
        const active = req.body.active;

        let response = await apiService.userCreate(xToken, loginId, password, name, adminType, active);

        res.status(200).json({
            result: true,
            data: response
        });
    },

    async userUpdate(req, res, next) {
        const xToken = req.cookies.xToken;
        const seq = req.body.seq;
        const loginId = req.body.loginId;
        const password = req.body.password;
        const name = req.body.name;
        const adminType = req.body.adminType;
        const active = req.body.active;     

        let response = await apiService.userUpdate(xToken, seq, loginId, password, name, adminType, active);

        res.status(200).json({
            result: true,
            data: response
        });
    },
    // 사용자 끝
    /***************************************************/

    /***************************************************/
    // 시스템 
    async systemGet(req, res, next) {
        const xToken = req.cookies.xToken;
        const keyword = req.body.leyword;

        let response = await apiService.systemGet(xToken, keyword);

        res.status(200).json({
            result: true,
            data: response
        });
    },
    // 시스템 끝
    /***************************************************/

    /***************************************************/
    // MTS 카카오 
    async profileList(req, res, next) {
        const xToken = req.cookies.xToken;
        const page = req.body.page;
        const rowCount = req.body.rowCount;

        let response = await apiService.profileList(xToken, page, rowCount);

        res.status(200).json({
            result: true,
            data: response
        });
    },

    async categoryList(req, res, next) {
        const xToken = req.cookies.xToken;

        let response = await apiService.kakaoCategoryList(xToken);

        res.status(200).json({
            result: true,
            data: response
        });
    },

    async sendToken(req, res, next) {
        const xToken = req.cookies.xToken;
        const yellowId = req.body.yellowId;
        const phoneNumber = req.body.phoneNumber;

        let response = await apiService.sendToken(xToken, yellowId, phoneNumber);

        res.status(200).json({
            result: true,
            data: response
        });
    },
    
    async profileAdd(req, res, next) {
        const xToken = req.cookies.xToken;
        const storeCode = req.body.storeCode;
        const yellowId = req.body.yellowId;
        const categoryCode = req.body.categoryCode;
        const categoryName = req.body.categoryName;
        const phoneNumber = req.body.phoneNumber;
        const token = req.body.token;

        let response = await apiService.kakaoProfileAdd(xToken, storeCode, yellowId, categoryCode, categoryName, phoneNumber, token);

        res.status(200).json({
            result: true,
            data: response
        });
    },

    async profileRemove(req, res, next) {
        const xToken = req.cookies.xToken;
        const storeCode = req.body.storeCode;
        const yellowId = req.body.yellowId;

        let response = await apiService.kakaoProfileRemove(xToken, storeCode, yellowId);

        res.status(200).json({
            result: true,
            data: response
        });
    },

    async templateList(req, res, next) {
        const xToken = req.cookies.xToken;
        const page = req.body.page;
        const rowCount = req.body.rowCount;

        let response = await apiService.kakaoTemplateList(xToken, page, rowCount);

        res.status(200).json({
            result: true,
            data: response
        });
    },

    async templateAdd(req, res, next) {
        const xToken = req.cookies.xToken;
        const storeCode = req.body.storeCode;
        const templateCode = req.body.templateCode;
        const templateName = req.body.templateName;
        const status = req.body.templateStatus;

        let response = await apiService.kakaoTemplateAdd(xToken, storeCode, templateCode, templateName, status);

        res.status(200).json({
            result: true,
            data: response
        });
    },

    async templateUpdate(req, res, next) {
        const xToken = req.cookies.xToken;
        const templateSeq = req.body.templateSeq;
        const storeCode = req.body.storeCode;
        const templateCode = req.body.templateCode;
        const templateName = req.body.templateName;
        const status = req.body.templateStatus;

        let response = await apiService.kakaoTemplateUpdate(xToken, templateSeq, storeCode, templateCode, templateName, status);

        res.status(200).json({
            result: true,
            data: response
        });
    },
    
    //  MTS 카카오 끝
    /***************************************************/
}