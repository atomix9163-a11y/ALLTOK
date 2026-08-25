const logger = require('../../config/logger.js');
const axios = require('axios');

module.exports = class apiService {
    static async authLogin(loginId, password) {
        let returnData = await axios.post(`${apiServer}/auth/verify`, {
            loginId: loginId,
            password: password
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.storeCount: ${error}`)
            return null;
        });
        return returnData;
    }

    static async storeCount(xToken) {
        let returnData = await axios.post(`${apiServer}/store/apiCount`, {},
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.storeCount: ${error}`)
            return 0;
        });
        return returnData;
    }
    
    static async storeList(xToken, searchKey, page, rowCount) {
        let returnData = await axios.post(`${apiServer}/store/apiList`, {
            storeType: "AT",
            searchKey: searchKey,
            page: page,
            rowCount: rowCount            
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.storeList: ${error}`)
            return null;
        });
        return returnData;
    }

    static async storeGet(xToken, storeCode) {
        let returnData = await axios.post(`${apiServer}/store/apiGet`, {
            storeCode: storeCode            
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.storeGet: ${error}`)
            return null;
        });
        return returnData;
    }

    static async storeCreate(xToken, mCode, martCode, shopType, shuketManager, managerId, POSType, name, owener, nameReg, regno, address, email, contact, loginId, loginPwd, active) {
        let returnData = await axios.post(`${apiServer}/store/apiCreate`, {            
            mCode: mCode,
            martCode, martCode,
            shuketManager: shuketManager,
            managerId: managerId,
            POSType: POSType,            
            name: name, 
            owener: owener, 
            nameReg: nameReg,
            regno: regno, 
            address: address, 
            email: email, 
            contact: contact,
            loginId: loginId,
            loginPwd: loginPwd,
            shopType: shopType,
            active: active
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.storeCreate: ${error}`)
            return null;
        });
        return returnData;
    }
    
    static async storeUpdate(xToken, mCode, martCode, storeCode, shopType, shuketManager, managerId, POSType, name, owener, nameReg, regno, address, email, contact, loginId, loginPwd, active) {
        let returnData = await axios.post(`${apiServer}/store/apiUpdate`, {
            storeCode: storeCode,
            mCode: mCode,
            martCode, martCode,
            shuketManager: shuketManager,
            managerId: managerId,
            POSType: POSType,            
            name: name, 
            owener: owener, 
            nameReg: nameReg,
            regno: regno, 
            address: address, 
            email: email, 
            contact: contact,
            loginId: loginId,
            loginPwd: loginPwd,
            shopType: shopType,
            active: active
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.storeUpdate: ${error}`)
            return null;
        });
        return returnData;
    }

    static async storeServiceGet(xToken, storeCode) {
        let returnData = await axios.post(`${apiServer}/store/apiGetService`, {
            storeCode: storeCode            
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.storeServiceGet: ${error}`)
            return null;
        });
        return returnData;
    }    

    static async storeServiceSave(xToken, storeCode, serviceJSON) {
        let returnData = await axios.post(`${apiServer}/store/apiSaveService`, {
            storeCode: storeCode,
            callPhone: serviceJSON.callPhone,
            balanceCheck: serviceJSON.balanceCheck,
            useShop: serviceJSON.useShop,
            allowAppPush: serviceJSON.allowAppPush,
            allowSendRepeat: serviceJSON.allowSendRepeat,
            shopShortUrl: serviceJSON.shopShortUrl,
            shopIndex: serviceJSON.shopIndex,
            SMS: serviceJSON.SMS,
            LMS: serviceJSON.LMS,
            AT: serviceJSON.AT,
            RCSSMS: serviceJSON.RCSSMS,
            RCSLMS: serviceJSON.RCSLMS,
            brandKey: serviceJSON.brandKey,
            kakaoClientId: serviceJSON.kakaoClientId,
            kakaoProfilekey: serviceJSON.kakaoProfilekey,
            kakaoDefaultTemplate: serviceJSON.kakaoDefaultTemplate,
            MTS_use: serviceJSON.MTS_use,
            MTS_kakaoProfilekey: serviceJSON.MTS_kakaoProfilekey,
            MTS_kakaoDefaultTemplate: serviceJSON.MTS_kakaoDefaultTemplate,
            androidScheme: serviceJSON.androidScheme,
            androidPackage: serviceJSON.androidPackage,
            iosAppId: serviceJSON.iosAppId,
            UP_AT: serviceJSON.UP_AT,
            UP_SMS: serviceJSON.UP_SMS,
            UP_LMS: serviceJSON.UP_LMS,
            UP_RCSSMS: serviceJSON.UP_RCSSMS,
            UP_RCSLMS: serviceJSON.UP_RCSLMS
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.storeServiceSave: ${error}`)
            return null;
        });
        return returnData;
    }    
    
    static async storeCashHistory(xToken, storeCode, cashType, startDate, endDate, page, rowCount) {        
        let returnData = await axios.post(`${apiServer}/cash/apiCashHistoryList`, {
            storeCode: storeCode,
            startDate: startDate,
            endDate: endDate,
            page: page,
            rowCount : rowCount,
            cashType: cashType            
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.storeCashHistory: ${error}`)
            return null;
        });
        return returnData;
    }

    static async storeCashAdd(xToken, storeCode, cashType, amount) {        
        let returnData = await axios.post(`${apiServer}/cash/apiAdd`, {
            storeCode: storeCode,
            cashType: cashType,
            amount: amount
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.storeCashAdd: ${error}`)
            return null;
        });
        return returnData;
    }

    static async accountList(xToken, notAssigned, accountType, searchKey, page, rowCount) {
        console.log("accountType", accountType)
        let returnData = await axios.post(`${apiServer}/nicepay/apiAccountList`, {
            notAssigned: notAssigned,
            searchKey: searchKey,
            accountType: accountType,
            page: page,
            rowCount: rowCount            
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.storeList: ${error}`)
            return null;
        });
        return returnData;
    }
    
    static async accountLink(xToken, accountCode, storeCode) {
        let returnData = await axios.post(`${apiServer}/nicepay/apiAccountLink`, {
            accountCode: accountCode,
            storeCode: storeCode          
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.accountLink: ${error}`)
            return null;
        });
        return returnData;
    }

    static async accountHistory(xToken, storeCode, page, rowCount) {
        let returnData = await axios.post(`${apiServer}/nicepay/apiAccountHistory`, {
            storeCode: storeCode,
            page: page,
            rowCount: rowCount            
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.accountHistory: ${error}`)
            return null;
        });
        return returnData;
    }

    static async accountHistoryMonth(xToken, year, month, page, rowCount) {
        let returnData = await axios.post(`${apiServer}/nicepay/apiAccountHistoryMonth`, {
            year: year,
            month: month,
            page: page,
            rowCount: rowCount            
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.accountHistory: ${error}`)
            return null;
        });
        return returnData;
    }

    static async accountHistoryMonthERP(xToken, year, month) {
        let returnData = await axios.post(`${apiServer}/nicepay/apiAccountHistoryMonthERP`, {
            year: year,
            month: month
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.accountHistory: ${error}`)
            return null;
        });
        return returnData;
    }

    static async phoneList(xToken, page, rowCount) {
        let returnData = await axios.post(`${apiServer}/phone/apiList`, {
            page: page,
            rowCount: rowCount
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.phoneList: ${error}`)
            return null;
        });
        return returnData;
    }

    static async phoneCreate(xToken, phone, comment) {
        let returnData = await axios.post(`${apiServer}/phone/apiCreate`, {
            phone: phone, 
            comment: comment
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.phoneCreate: ${error}`)
            return null;
        });
        return returnData;
    }

    static async phoneRemove(xToken, seq) {
        let returnData = await axios.post(`${apiServer}/phone/apiRemove`, {
            seq: seq
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.phoneRemove: ${error}`)
            return null;
        });
        return returnData;
    }

    static async userList(xToken, adminType, page, rowCount) {
        let returnData = await axios.post(`${apiServer}/user/apiList`, {
            adminType: adminType,
            page: page,
            rowCount: rowCount
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.userList: ${error}`)
            return null;
        });
        return returnData;
    }

    static async userGet(xToken, seq) {
        let returnData = await axios.post(`${apiServer}/user/apiGet`, {
            seq: seq
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.userGet: ${error}`)
            return null;
        });
        return returnData;
    }
    
    static async userUpdate(xToken, seq, loginId, password, name, adminType, active) {
        let returnData = await axios.post(`${apiServer}/user/apiUpdate`, {
            seq: seq,
            loginId: loginId, 
            password: password, 
            name: name, 
            adminType: adminType, 
            active: active
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.userUpdate: ${error}`)
            return null;
        });
        return returnData;
    }

    static async userCreate(xToken, loginId, password, name, adminType, active) {
        let returnData = await axios.post(`${apiServer}/user/apiCreate`, {
            loginId: loginId, 
            password: password, 
            name: name, 
            adminType: adminType, 
            active: active
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.userUpdate: ${error}`)
            return null;
        });
        return returnData;
    }

    static async systemGet(xToken, page, rowCount) {
        let returnData = await axios.post(`${apiServer}/system/apiGet`, {
            keyword: "SERVICE"
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.systemGet: ${error}`)
            return null;
        });
        return returnData;
    }

    static async profileList(xToken, page, rowCount) {
        let returnData = await axios.post(`${apiServer}/kakao/apiProfileList`, {
            page: page,
            rowCount: rowCount
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.profileList 에러 발생`)
            logger.writeLog('error', `services/apiService.profileList: ${error}`)
            return null;
        });
        return returnData;
    }

    static async kakaoCategoryList(xToken) {
        let returnData = await axios.post(`${apiServer}/kakao/apiCategoryList`, {
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.kakaoCategoryList 에러 발생`)
            logger.writeLog('error', `services/apiService.kakaoCategoryList: ${error}`)
            return null;
        });
        return returnData;
    }
    
    static async sendToken(xToken, yellowId, phoneNumber) {
        let returnData = await axios.post(`${apiServer}/kakao/apiSendToken`, {
            yellowId: yellowId,
            phoneNumber: phoneNumber
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.sendToken 에러 발생`)
            logger.writeLog('error', `services/apiService.sendToken: ${error}`)
            return null;
        });
        return returnData;
    }
    
    static async kakaoProfileAdd(xToken, storeCode, yellowId, categoryCode, categoryName, phoneNumber, token) {
        let returnData = await axios.post(`${apiServer}/kakao/apiProfileAdd`, {
            storeCode: storeCode,
            yellowId: yellowId,
            categoryCode: categoryCode,
            categoryName: categoryName,
            phoneNumber: phoneNumber,
            token: token
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.kakaoProfileAdd 에러 발생`)
            logger.writeLog('error', `services/apiService.kakaoProfileAdd: ${error}`)
            return null;
        });
        return returnData;
    }
    
    static async kakaoProfileRemove(xToken, storeCode, yellowId) {
        let returnData = await axios.post(`${apiServer}/kakao/apiProfileRemove`, {
            storeCode: storeCode,
            yellowId: yellowId
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.kakaoProfileRemove 에러 발생`)
            logger.writeLog('error', `services/apiService.kakaoProfileRemove: ${error}`)
            return null;
        });
        return returnData;
    }

    static async kakaoTemplateList(xToken, page, rowCount) {
        let returnData = await axios.post(`${apiServer}/kakao/apiTemplateList`, {
            page: page,
            rowCount: rowCount
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.kakaoTemplateList 에러 발생`)
            logger.writeLog('error', `services/apiService.kakaoTemplateList: ${error}`)
            return null;
        });
        return returnData;
    }

    static async kakaoTemplateAdd(xToken, storeCode, templateCode, templateName, status) {
        let returnData = await axios.post(`${apiServer}/kakao/apiTemplateAdd`, {
            storeCode: storeCode,
            templateCode: templateCode,
            templateName: templateName,
            status: status
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.kakaoTemplateAdd 에러 발생`)
            logger.writeLog('error', `services/apiService.kakaoTemplateAdd: ${error}`)
            return null;
        });
        return returnData;
    }

    static async kakaoTemplateUpdate(xToken, seq, storeCode, templateCode, templateName, status) {
        let returnData = await axios.post(`${apiServer}/kakao/apiTemplateUpdate`, {
            seq: seq,            
            storeCode: storeCode,
            templateCode: templateCode,
            templateName: templateName,
            status: status
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.kakaoTemplateRemove 에러 발생`)
            logger.writeLog('error', `services/apiService.kakaoTemplateRemove: ${error}`)
            return null;
        });
        return returnData;
    }
}
