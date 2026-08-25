const credetialService = require('../services/credential.js');
const numeral = require('numeral');
const axios = require('axios');
const logger = require('../../config/logger');

module.exports = class shuketService {
    // 마트 정보 가져오기
    static async getMartInfo(appMartCode) {
        const logBase = `shuket mobile.shuketService.getMartInfo: appMartCode(${appMartCode})`;

        const token = credetialService.getToken("api_smartphone_moa", appMartCode);
        const API_uri = `${SHUKET_API}/moa_back_api/smartphone/v1/martInfo`;
        const sendData = {
            appMartCode: appMartCode
        }
        logger.writeLog("info", `${logBase} ${API_uri} get mart info from shuket API. ${JSON.stringify(sendData)}`);
        logger.writeLog("info", `${logBase} token is ${token}`);
        let responseData = await axios.post(API_uri, sendData, { 
            headers: {
                Authorization: token
            }
        }).then(response => {
            logger.writeLog("info", `${logBase} get mart info complete.`);
            return response.data;
        }).catch(error => {
            logger.writeLog("error", `${logBase} get mart info failure.\nStacktrace: ${error.stack}`);            
            return null;
        });

        return responseData;
    }

    // 앱 푸시에 사용할 특매 정보를 얻는다
    static async getPushProducts(appMartCode) {
        const logBase = `shuket mobile.shuketService.getTemplateProducts: appMartCode(${appMartCode})`;

        const token = credetialService.getToken("api_smartphone_moa", appMartCode);
        const API_uri = `${SHUKET_API}/moa_back_api/smartphone/v1/detailDigitalForPush`;
        const sendData = {
            appMartCode: appMartCode
        }
        logger.writeLog("info", `${logBase} ${API_uri} get mart selected products from shuket API. ${token} ${JSON.stringify(sendData)}`);
        let responseData = await axios.post(API_uri, sendData, { 
            headers: {
                Authorization: token
            }
        }).then(response => {
            logger.writeLog("info", `${logBase} get mart selected products complete. ${appMartCode} / ${token}`);
            return response.data;
        }).catch(error => {
            logger.writeLog("error", `${logBase} get mart selected products failure.\nStacktrace: ${error.stack}`);            
            return null;
        });

        return responseData;
    }    

    // 앱 푸시 발송
    static async sendAppPush(M_MOA_CODE, appLogo, pushTitle, pushContent, pushTime, pushOption, pushTarget = 'N', pushTargetScreenCode = '') {
        const logBase = `shuket mobile.shuketService.sendPush: M_MOA_CODE(${M_MOA_CODE}), pushTitle(${pushTitle})`;

        logger.writeLog("info", `[슈켓] 푸시 연동 호출로 앱 푸시를 발송합니다.`);
        // const token = credetialService.getToken("api_smartphone_moa", appMartCode);
        // const API_uri = `${SHUKET_API}/moa_back_api/api/v1/sendPushUseMartCode`;
        const API_uri = `${SHUKET_API}/moa_back_api/api/v1/sendPushUseMartCodeWithScreenCode`;
        const sendData = {
            code: M_MOA_CODE,
            logo: appLogo,
            pushTarget: pushTarget,
            pushTargetScreenCode: pushTargetScreenCode,
            pushTitle: pushTitle,
            pushContent: pushContent,
            pushTime: pushTime,
            pushOption: pushOption
        }
        logger.writeLog("info", `${logBase} ${API_uri} send app push. ${SHUKET_TOKEN_FOR_PUSH} ${JSON.stringify(sendData)}`);
        let responseData = await axios.post(API_uri, sendData, { 
            headers: {
                "Authorization": "Bearer " + SHUKET_TOKEN_FOR_PUSH
            }
        }).then(response => {
            console.log("발송결과", response.data.errors)
            logger.writeLog("info", `${logBase} [슈켓] 앱 푸시가 발송되었습니다. ${JSON.stringify(response.data)}`);
            return response.data;
        }).catch(error => {
            logger.writeLog("error", `${logBase} [슈켓] 앱 푸시 발송이 실패하였습니다.\nStacktrace: ${error.stack}`);            
            return null;
        });

        return responseData;
    }  

    static  interSectSets(setA, setB){
        var intersection = new Set()
        setA.forEach(e=>{
            if(!setB.has(e)) intersection.add(e)
        })
        return intersection
    }
    
    // 앱 고객 목록 얻기
    static async getAppMembers(M_MOA_CODE) {
        const logBase = `shuket mobile.getAppMembers.sendPush: M_MOA_CODE(${M_MOA_CODE})`;

        const API_uri = `${SHUKET_API}/moa_back_api/api/v1/getUsers`;
        const sendData = {
            martCode: M_MOA_CODE
        }
        logger.writeLog("info", `${logBase} ${API_uri} get app members. ${SHUKET_TOKEN} ${JSON.stringify(sendData)}`);
        let responseData = await axios.post(API_uri, sendData, { 
            headers: {
                "Authorization": "Bearer " + SHUKET_TOKEN_FOR_PUSH
            }
        }).then(response => {
            logger.writeLog("info", `${logBase} get app members complete.`);
            return response.data;
        }).catch(error => {
            logger.writeLog("error", `${logBase} get app members failure.\nStacktrace: ${error.stack}`);            
            return {};
        });

        return responseData;
    }  

    // 아트엠 수신 거부자에 동시 등록하기
    static async addRefuse(phone, comment) {
        const logBase = `아트엠 수신 거부자 연동 등록: phone(${phone}), comment(${comment})`;

        const API_uri = `${ARTM_API}/refuse/smsdisagree`;
        logger.writeLog("info", `${logBase} ${API_uri}`);
        let responseData = await axios.post(API_uri, {
            deniedphoneno: phone
        }).then(response => {
            logger.writeLog("info", `${logBase} 수신 거부 등록 성공`);
            return response.data;
        }).catch(error => {
            logger.writeLog("error", `${logBase} 수신 거부 등록 실패.\nStacktrace: ${error.stack}`);            
            return {};
        });

        return responseData;
    } 
}