const logger = require('../../config/logger.js');
const storeModel = require('../models/storeModel.js');

module.exports = class storeService {
    static async get(storeCode) {
        console.log(storeCode)
        let storeInfo = await storeModel.get(storeCode);
        console.log(storeInfo)
        storeInfo.service = storeService.getService(storeInfo);
        return storeInfo;
    }

    static getService(storeInfo) {
        if (storeInfo) {
            if (storeInfo.service) {
                storeInfo.service = JSON.parse(storeInfo.service);            
            } else {
                storeInfo.service = storeService.buildServiceJSON(null);
            }
            return storeInfo.service;
        } else {
            return null;
        }
    }

    // static async getByMCODE(M_MOA_CODE) {
    //     let storeInfo = await storeModel.getByMCODE(M_MOA_CODE);
    //     if (storeInfo) {
    //         // logger.writeLog("info", `storeService.get(${storeCode})`, JSON.stringify(storeInfo));
            
    //         if (storeInfo.service) {
    //             storeInfo.service = JSON.parse(storeInfo.service);
    //         } else {
    //             storeInfo.service = storeService.buildServiceJSON(null);
    //         }
    //     } else {
    //         logger.writeLog("error", `storeService.get(${M_MOA_CODE})`, "올바르지 않은 접근입니다");
    //         storeInfo = null;
    //     }
    //     return storeInfo;
    // }
    
    // static getUnitPriceJSON(storeInfo) {
    //     // switch (messageType) {
    //     //     case "SMS": return storeInfo.service.UP_SMS;
    //     //     case "LMS": return storeInfo.service.UP_LMS;
    //     //     case "MMS": return storeInfo.service.UP_MMS;
    //     //     case "RCSSMS": return storeInfo.service.UP_RCSSMS;
    //     //     case "RCSLMS": return storeInfo.service.UP_RCSLMS;
    //     //     case "RCSMMS": return storeInfo.service.UP_RCSMMS;
    //     //     case "AT": return storeInfo.service.UP_AT;
    //     //     case "AF": return storeInfo.service.UP_FT;
    //     //     default: return 0;
    //     // }
    //     let unitPrice = {
    //         S: storeInfo.service.UP_SMS,
    //         L: storeInfo.service.UP_LMS,
    //         M: storeInfo.service.UP_MMS,
    //         RS: storeInfo.service.UP_RCSSMS,
    //         RL: storeInfo.service.UP_RCSLMS,
    //         RM: storeInfo.service.UP_RCSMMS,
    //         T: storeInfo.service.UP_AT,
    //         F: storeInfo.service.UP_FT
    //     }
    //     return JSON.stringify(unitPrice);
    // }

    // static getUnitPrice(storeInfo, messageType) {
    //     switch (messageType) {
    //         case "SMS": return storeInfo.service.UP_SMS;
    //         case "LMS": return storeInfo.service.UP_LMS;
    //         case "MMS": return storeInfo.service.UP_MMS;
    //         case "RCSSMS": return storeInfo.service.UP_RCSSMS;
    //         case "RCSLMS": return storeInfo.service.UP_RCSLMS;
    //         case "RCSMMS": return storeInfo.service.UP_RCSMMS;
    //         case "AT": return storeInfo.service.UP_AT;
    //         case "AF": return storeInfo.service.UP_FT;
    //         default: return 0;
    //     }
    // }

    static buildServiceJSON(req) {
        let serviceJSON;
        if (req) {
            serviceJSON = {
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
                MTS_use: req.body.MTS_use ? req.body.MTS_use : 'N',
                MTS_kakaoProfilekey: req.body.MTS_kakaoProfilekey ? req.body.MTS_kakaoProfilekey : '',
                MTS_kakaoDefaultTemplate: req.body.MTS_kakaoDefaultTemplate ? req.body.MTS_kakaoDefaultTemplate : '',
                androidScheme: req.body.androidScheme,
                androidPackage: req.body.androidPackage,
                iosAppId: req.body.iosAppId,
                UP_SMS: parseFloat(req.body.UP_SMS),
                UP_LMS: parseFloat(req.body.UP_LMS),
                UP_RCSSMS: parseFloat(req.body.UP_RCSSMS),
                UP_RCSLMS: parseFloat(req.body.UP_RCSLMS),
                UP_AT: parseFloat(req.body.UP_AT)
            }
        } else {
            serviceJSON = {
                callPhone: '',
                brandKey: '',
                balanceCheck: 'Y',
                useShop: 'Y',
                allowAppPush: 'N',
                allowSendRepeat: 'Y',
                shopShortUrl: "",
                shopIndex: "1",
                SMS: 'N',
                LMS: 'N',
                RCSSMS: 'N',
                RCSLMS: 'N',
                AT: 'N',
                kakaoClientId: '',
                kakaoProfilekey: '',
                kakaoDefaultTemplate: '',
                MTS_use: 'N',
                MTS_kakaoProfilekey: '',
                MTS_kakaoDefaultTemplate: '',
                androidScheme: '',
                androidPackage: '',
                iosAppId: '',
                UP_SMS: 0.0,
                UP_LMS: 0.0,
                UP_RCSSMS: 0.0,
                UP_RCSLMS: 0.0,
                UP_AT: 0.0
            }
        }
        console.log("==========", serviceJSON)
        return serviceJSON;
    }

    // static getServiceJSON() {

    // }
}