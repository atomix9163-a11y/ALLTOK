const bcrypt = require("bcrypt");
const storeService = require('../services/storeService.js');
const storeModel = require('../models/storeModel.js');
const shuketService = require('../services/shuketService.js');
const virtualBankModel = require('../models/virtualBankModel.js');
const moment = require('moment');

const logger = require("../../config/logger");

module.exports = {
    async count(req, res, next) {
        let count = await storeModel.count();

        let activeA = count.find(e => { return e.active == 'A'});
        let activeW = count.find(e => { return e.active == 'W'});
        let activeD = count.find(e => { return e.active == 'D'});
        res.status(200).json({
            result: true,
            data: {
                'A' : (activeA) ? activeA.FOUND : 0,
                'W' : (activeW) ? activeW.FOUND : 0,
                'D' : (activeD) ? activeD.FOUND : 0,
            }
        });
    },

    async list(req, res, next) {
        let managerId = req.body.managerId ? req.body.managerId : ''; // MT 알톡
        let searchKey = req.body.searchKey;
        let storeType = "MT";
        let page = req.body.page;
        let rowCount = req.body.rowCount;
        let active = req.body.active ? req.body.active : '';

        const data = await storeModel.list(managerId, page, rowCount, searchKey, storeType, active);

        res.status(200).json({
            result: true,
            data: data
        });
    },

    async create(req, res, next) {        
        const POSType = req.body.POSType;
        const mCode = req.body.mCode;
        const martCode = req.body.martCode; // 연동 코드
        const name = req.body.name;
        const owener = req.body.owener;
        const nameReg = req.body.nameReg;
        const regno = req.body.regno;
        const address = req.body.address;
        const email = req.body.email;
        const contact = req.body.contact;
        const loginId = req.body.loginId;
        let loginPwd = req.body.loginPwd;
        const useMobileShop = 'Y';
        const useMobileOrder = 'Y';
        const mobileOrderLimit = 0;
        const shuketManager = req.body.shuketManager;
        const managerId = req.body.managerId;
        const shopType = req.body.shopType;
        const active = req.body.active;
        const C_ID = req.user.loginId;

        let salt = bcrypt.genSaltSync(10);
        loginPwd = bcrypt.hashSync(loginPwd, salt);

        // 이미 아이디가 존재하는지 확인한다
        const findCount = await storeModel.findLoginId(loginId);

        if (findCount == 0) {
            let result = await storeModel.create(mCode, martCode, shopType, shuketManager, managerId, POSType, name, owener, nameReg, regno, address, email, contact, loginId, loginPwd, useMobileShop, useMobileOrder, mobileOrderLimit, active, C_ID);

            res.status(200).json({
                result: (result) ? "success" : "fail"
            });
        } else {
            res.status(200).json({
                result: "fail",
                data: 2
            });
        }
    },

    async createAPI(req, res, next) {        
        const POSType = 'QM';
        const mCode = '';
        const martCode = req.body.martCode ?? ''; // 연동 코드
        const name = req.body.name ?? '';
        const owener = req.body.owener ?? '';
        const nameReg = req.body.nameReg ?? '';
        const regno = req.body.regno ?? '';
        const address = req.body.address ?? '';
        const email = '';
        const contact = '';
        const loginId = req.body.loginId ?? '';
        let loginPwd = req.body.loginPwd ?? '';
        const useMobileShop = req.body.useMobileShop ?? 'Y';
        const useMobileOrder = req.body.useMobileOrder ?? 'Y';
        const mobileOrderLimit = req.body.orderLimit ?? 0;
        const shuketManager = req.body.manager ?? '';
        const managerId = '';
        const shopType = req.body.shopType ?? 'U';
        const active = req.body.active ?? 'A';
        const C_ID = req.user.loginId;

        let salt = bcrypt.genSaltSync(10);
        loginPwd = bcrypt.hashSync(loginPwd, salt);

        // 이미 아이디가 존재하는지 확인한다
        const findCount = await storeModel.findLoginId(loginId);
        if (findCount != 0) {
            res.status(200).json({
                resultCode: 104,
                resultMessage: "이미 존재하는 로그인 아이디입니다.",
                resultData: null
            });
            return;
        }
        // 데이터 검증
        let verifyResult = true;
        let verifyMessage = '';
        let resultCode = 200;
        if (martCode == '') {
            verifyResult = false;
            resultCode = 101;
            verifyMessage = "연동 코드는 필수입니다.";
        }
        if (name == '') {
            verifyResult = false;
            resultCode = 102;
            verifyMessage = "마트명은 필수입니다.";
        }
        if (loginId == '') {
            verifyResult = false;
            resultCode = 103;
            verifyMessage = "로그인할 수 있는 아이디는 필수입니다. 중복되지 않은 아이디를 사용하세요.";
        }
        if (loginPwd == '') {
            verifyResult = false;
            resultCode = 105;
            verifyMessage = "접속 암호는 필수입니다.";
        }
        const shopTypes = ["U", "L", "Q", "QU"];
        if (!shopTypes.includes(shopType)) {
            verifyResult = false;
            resultCode = 106;
            verifyMessage = "shop 종류는 U, L 또는 Q 중 하나여야 합니다.";
        }
        const actives = ["A", "C", "T"];
        if (!actives.includes(active)) {
            verifyResult = false;
            resultCode = 107;
            verifyMessage = "상태는 A, C 또는 T 중 하나여야 합니다.";
        }        
        if (verifyResult) {
            let result = await storeModel.create(mCode, martCode, shopType, shuketManager, managerId, POSType, name, owener, nameReg, regno, address, email, contact, loginId, loginPwd, useMobileShop, useMobileOrder, mobileOrderLimit, active, C_ID);

            if (result) {
                res.status(200).json({
                    resultCode: 200,
                    resultMessage: "새 마트가 추가되었습니다.",
                    resultData: result
                });
            } else {
                res.status(200).json({
                    resultCode: 300,
                    resultMessage: "새 마트를 추가할 때 데이터베이스 오류가 발생했습니다.",
                    resultData: null
                });            
            }
        } else {
            res.status(200).json({
                resultCode: resultCode,
                resultMessage: verifyMessage,
                resultData: null
            });            
        }
    },

    // 관리자가 정보 수정
    async update(req, res, next) {
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
        let loginPwd = req.body.loginPwd;
        const useMobileShop = 'Y';
        const useMobileOrder = 'Y';
        const mobileOrderLimit = 0;
        const shuketManager = req.body.shuketManager;
        const managerId = req.body.managerId;
        const shopType = req.body.shopType;
        const active = req.body.active;
        const M_ID = req.user.loginId;

        let salt = bcrypt.genSaltSync(10);
        loginPwd = (loginPwd.length > 0) ? bcrypt.hashSync(loginPwd, salt) : "";
        
        // 이미 아이디가 존재하는지 확인한다
        const findCount = await storeModel.findLoginId(loginId, storeCode);

        if (findCount == 0) {
            let result = await storeModel.update(storeCode, mCode, martCode, shopType, shuketManager, managerId, POSType, name, owener, nameReg, regno, address, email, contact, loginId, loginPwd, useMobileShop, useMobileOrder, mobileOrderLimit, active, M_ID);

            console.log(0)
            res.status(200).json({
                result: result,
                data: 0
            });
        } else {
            console.log(2)
            res.status(200).json({
                result: false,
                data: 2
            });
        }
    },
    
    async get(req, res, next) {
        const storeCode = req.body.storeCode;

        let storeInfo = await storeModel.get(storeCode);        
        if (storeInfo) {
            storeInfo.service = storeService.getService(storeInfo);
            // if (storeInfo.app_mart_code && storeInfo.app_mart_code != "") {
            if (storeInfo.shop_type == 'L' && storeInfo.app_mart_code != "") {
                // 슈켓 연동 샵이면 로고를 슈켓에서 가져온다.
                const response = await shuketService.getMartInfo(storeInfo.app_mart_code);                
                storeInfo.logo_image = (response.resultData.data && response.resultData.data.M_LOGO) ? response.resultData.data.M_LOGO : "";
            }
        }

        res.status(200).json({
            result: (storeInfo) ? true : false,
            data: storeInfo
        });
    },

    async getAPI(req, res, next) {
        const storeCode = req.body.storeCode;

        let storeInfo = await storeModel.get(storeCode);        
        if (storeInfo) {
            storeInfo.service = storeService.getService(storeInfo);
            // if (storeInfo.app_mart_code && storeInfo.app_mart_code != "") {
            if (storeInfo.shop_type == 'L' && storeInfo.app_mart_code != "") {
                // 슈켓 연동 샵이면 로고를 슈켓에서 가져온다.
                const response = await shuketService.getMartInfo(storeInfo.app_mart_code);                
                storeInfo.logo_image = (response.resultData.data && response.resultData.data.M_LOGO) ? response.resultData.data.M_LOGO : "";
            }
        }

        if (storeInfo) {
            // 불필요한 항목 제거
            delete storeInfo.M_MOA_CODE;
            storeInfo.manager = storeInfo.shuket_manager;
            delete storeInfo.shuket_manager;
            delete storeInfo.manager_id;
            delete storeInfo.POS_type;
            delete storeInfo.owener;
            delete storeInfo.name_reg;
            delete storeInfo.regno;
            delete storeInfo.email;
            delete storeInfo.map_location;
            delete storeInfo.login_pwd;
            delete storeInfo.use_hide_sms;
            delete storeInfo.notice_top;
            delete storeInfo.delivery_comment;
            delete storeInfo.C_ID;
            delete storeInfo.M_ID;
            delete storeInfo.M_TIME;
            storeInfo.createTime = moment(storeInfo.C_TIME).format("YYYY-MM-DD HH:mm:ss");
            delete storeInfo.C_TIME;
            storeInfo.use_pay_method = storeInfo.use_pay_method ? JSON.parse(storeInfo.use_pay_method) : storeInfo.use_pay_method;
            storeInfo.use_time_limit = storeInfo.use_time_limit ? JSON.parse(storeInfo.use_time_limit) : storeInfo.use_time_limit;

            if (storeInfo.service) {
                delete storeInfo.service.brandKey;
                delete storeInfo.service.shopIndex;
                delete storeInfo.service.RCSSMS;
                delete storeInfo.service.RCSLMS;
                delete storeInfo.service.kakaoClientId;
                delete storeInfo.service.kakaoProfilekey;
                delete storeInfo.service.kakaoDefaultTemplate;
                delete storeInfo.service.MTS_use;
                delete storeInfo.service.MTS_kakaoProfilekey;
                delete storeInfo.service.MTS_kakaoDefaultTemplate;
                delete storeInfo.service.UP_RCSSMS;
                delete storeInfo.service.UP_RCSLMS;
                storeInfo.service.UnitPrice_AT = storeInfo.service.UP_AT;
                storeInfo.service.UnitPrice_SMS = storeInfo.service.UP_SMS;
                storeInfo.service.UnitPrice_LMS = storeInfo.service.UP_LMS;
                delete storeInfo.service.UP_AT;
                delete storeInfo.service.UP_SMS;
                delete storeInfo.service.UP_LMS;
                delete storeInfo.service.androidScheme;
                delete storeInfo.service.androidPackage;
                delete storeInfo.service.iosAppId;
            }
            res.status(200).json({
                resultCode: 200,
                resultMessage: "마트 정보를 리턴합니다.",
                resultData: storeInfo
            });
        } else {
            res.status(200).json({
                resultCode: 101,
                resultMessage: "마트 정보를 찾을 수 없습니다.",
                resultData: null
            });
        }
    },
        
    async getByLoginId(req, res, next) {
        const loginId = (req.body.loginId) ? req.body.loginId : "";

        let storeInfo = await storeModel.getByLoginId(loginId);
        storeInfo.service = storeService.getService(storeInfo);
        if (storeInfo.shop_type == 'L') {
        // if (storeInfo.app_mart_code && storeInfo.app_mart_code != "") {
            // 슈켓 연동 샵이면 로고를 슈켓에서 가져온다.
            const response = await shuketService.getMartInfo(storeInfo.app_mart_code);
            storeInfo.logo_image = (response.resultData.data && response.resultData.data.M_LOGO) ? response.resultData.data.M_LOGO : "";
        }

        res.status(200).json({
            result: (storeInfo) ? true : false,
            data: storeInfo
        });
    },

    // 가맹점에서 정보 수정
    async updateByFront(req, res, next) {
        const storeCode = req.body.storeCode;
        const contact = req.body.contact;
        let loginPwd = req.body.loginPwd;
        const noticeTop = req.body.noticeTop;
        const workingTime = req.body.workingTime;
        const holidays = req.body.holidays;
        const useMobileShop = req.body.useMobileShop;
        const useMobileOrder = req.body.useMobileOrder;
        const useMobileTitle = req.body.useMobileTitle;
        const mobileOrderLimit = req.body.mobileOrderLimit;
        const deliveryComment = req.body.deliveryComment;
        const address = req.body.address;
        const usePayMethod = req.body.usePayMethod;
        const useTimeLimit = req.body.useTimeLimit;
        const M_ID = req.user.loginId;

        let salt = bcrypt.genSaltSync(10);
        loginPwd = (loginPwd.length > 0) ? bcrypt.hashSync(loginPwd, salt) : "";

        let result = await storeModel.updateStore(
            storeCode,
            contact,
            loginPwd,
            noticeTop,
            workingTime,
            holidays,
            deliveryComment,
            address,
            useMobileShop,
            useMobileOrder,
            useMobileTitle,
            mobileOrderLimit,
            usePayMethod,
            useTimeLimit,
            M_ID);
        res.status(200).json({
            result: (result) ? true : false
        });
    },

    // 가맹점에서 정보 수정
    async updateStorePhoto(req, res, next) {
        const storeCode = req.body.storeCode;
        const target = req.body.target;
        const photo = req.body.photo;
        const M_ID = req.user.loginId;

        if (photo == "") {
            // photo == ""이면 파일을 없애는 것이므로, S3에서 파일을 삭제한다
            let storeInfo = await storeModel.get(storeCode);
            let s3Key = (target == "logo_image") ? storeInfo.logo_image : (target == "mart-image-review") ? storeInfo.mart_image : storeInfo.mart_image2;
            if (s3Key != "") {
                // S3파일을 먼저 삭제
                const aws = require('aws-sdk');
                const s3 = new aws.S3({
                    accessKeyId: process.env.S3_ACCESS_KEY, 
                    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
                    region: "ap-northeast-2"
                });
                logger.writeLog("info", `S3에서 ${target}을 삭제합니다.`);
                s3.deleteObject({
                    Bucket: 'alltok.data', // 삭제하고 싶은 이미지가 있는 버킷 이름
                    Key: s3Key, // 삭제하고 싶은 이미지의 key 
                }, async (err, data) => {
                    if (err) {
                        logger.writeLog("error", `S3에서 ${target}을 삭제 실패했습니다.`);
                    }
                    else {
                        logger.writeLog("info", `S3에서 ${target}을 삭제하였습니다.`);
                    }
                });
            }
        }
        
        let result = await storeModel.updateStorePhoto(storeCode, target, photo, M_ID);
        res.status(200).json({
            result: (result) ? true : false
        });
    },

    async getService(req, res, next) {
        const storeCode = req.body.storeCode;

        let serviceJSON = await storeModel.getService(storeCode);
        if (!serviceJSON) {
            serviceJSON = storeService.buildServiceJSON(null);
        } else {
            serviceJSON = JSON.parse(serviceJSON.data);
        }       

        res.status(200).json({
            result: true,
            data: serviceJSON
        });
    },

    async saveService(req, res, next) {
        const storeCode = (req.body.storeCode) ? req.body.storeCode : "";
        const C_ID = (req.user.loginId) ? req.user.loginId : "system";

        let serviceJSON = storeService.buildServiceJSON(req);
        let result = await storeModel.saveService(storeCode, JSON.stringify(serviceJSON), C_ID);

        res.status(200).json({
            result: true,
            data: result
        });

    },

    async apiGetVirtualAccount(req, res, next) {
        const storeCode = (req.body.storeCode) ? req.body.storeCode : "";
        let result = await virtualBankModel.getAccount(storeCode);

        res.status(200).json({
            result: true,
            data: result
        });
    },

    // async getDeepLink(req, res, next) {
    //     const store_code = (req.body.store_code) ? req.body.store_code : "";

    //     let deepLink = await storeModel.getDeepLink(store_code);

    //     // console.log(store_code, affiliatedStoreInfo)
    //     res.status(200).json({
    //         result: (deepLink) ? true : false,
    //         data: deepLink
    //     });
    // },

    // async saveDeepLink(req, res, next) {
    //     const storeCode = (req.body.storeCode) ? req.body.storeCode : "";
    //     const M_MOA_CODE = (req.body.M_MOA_CODE) ? req.body.M_MOA_CODE : "";
    //     const directLink = (req.body.directLink) ? req.body.directLink : "N";
    //     const anr_scheme = (req.body.androidScheme) ? req.body.androidScheme : "";
    //     const anr_package = (req.body.androidPackage) ? req.body.androidPackage : "";
    //     const ios_scheme = (req.body.iosScheme) ? req.body.iosScheme : "";
    //     const ios_appId = (req.body.iosAppId) ? req.body.iosAppId : "";
    //     const M_ID = "system";

    //     let deepLinkCode = await storeModel.saveDeepLink(storeCode, M_MOA_CODE, directLink, anr_scheme, anr_package, ios_scheme, ios_appId, M_ID);

    //     // console.log(store_code, affiliatedStoreInfo)
    //     res.status(200).json({
    //         result: (deepLinkCode) ? true : false,
    //         data: deepLinkCode
    //     });
    // },

    async listSMSAdmin(req, res, next) {
        const storeCode = (req.body.storeCode) ? req.body.storeCode : "";

        let list = await storeModel.listSMSAdmin(storeCode);

        res.status(200).json({
            result: true,
            data: list
        });
    },

    async createSMSAdmin(req, res, next) {
        const storeCode = (req.body.storeCode) ? req.body.storeCode : "";
        const phone = (req.body.phone) ? req.body.phone : "";
        const M_ID = "system";

        let insertId = await storeModel.createSMSAdmin(storeCode, phone, M_ID);

        // console.log(store_code, affiliatedStoreInfo)
        res.status(200).json({
            result: (insertId) ? true : false,
            data: insertId
        });
    },

    async deleteSMSAdmin(req, res, next) {
        const saCode = (req.body.saCode) ? req.body.saCode : "";
        const M_ID = "system";

        let result = await storeModel.deleteSMSAdmin(saCode, M_ID);

        res.status(200).json({
            result: result,
            data: result
        });
    },

    // async useHideSMSUpdate(req, res, next) {
    //     const storeCode = (req.body.storeCode) ? req.body.storeCode : "";
    //     const useHideSMSJSON = (req.body.useHideSMSJSON) ? req.body.useHideSMSJSON : "{}";
    //     const M_ID = "system";

    //     let deepLinkCode = await storeModel.updateUseHideSMS(storeCode, useHideSMSJSON, M_ID);

    //     // console.log(store_code, affiliatedStoreInfo)
    //     res.status(200).json({
    //         result: (deepLinkCode) ? true : false,
    //         data: deepLinkCode
    //     });
    // },
    
    // async apiGetMCode(req, res, next) {
    //     const M_MOA_CODE = (req.body.M_MOA_CODE) ? req.body.M_MOA_CODE : "";

    //     let storeInfo = await storeModel.getMCode(M_MOA_CODE);
       
    //     res.status(200).json({
    //         result: (storeInfo) ? true : false,
    //         data: storeInfo
    //     });
    // },

    // async apiGetDeepLinkMCode(req, res, next) {
    //     const M_MOA_CODE = (req.body.M_MOA_CODE) ? req.body.M_MOA_CODE : "";

    //     let deepLink = await storeModel.getDeepLinkMCode(M_MOA_CODE);

    //     console.log(M_MOA_CODE, deepLink)
    //     res.status(200).json({
    //         result: (deepLink) ? true : false,
    //         data: deepLink
    //     });
    // },
    

}