const credetialService = require('./credential.js');
const numeral = require('numeral');
const axios = require('axios');
const logger = require('../../config/logger.js');

module.exports = class qmService {
    // 앱 푸시 발송
    static async sendAppPush(martId, title, summary, webviewUrl, sendImmediately, scheduledAt) {
        const logBase = `qmarket mobile.qmService.sendPush: martId(${martId}), title(${title}), summary(${summary}), webviewUrl(${webviewUrl}), sendImmediately(${sendImmediately}), scheduledAt(${scheduledAt})`;

        logger.writeLog("info", `[큐마켓] 푸시 연동 호출로 앱 푸시를 발송합니다.`);
        const API_uri = `${QMARKET_API}/fcm/alltok`;
        const sendData = {
            martId: martId,
            type: "ALL_TOK",
            title: title,
            summary: summary,
            webviewUrl: webviewUrl,
            sendImmediately: sendImmediately == "I" ? true : false,
            scheduledAt: sendImmediately == "I" ? "" : scheduledAt.split(" ")[0] + "T" + scheduledAt.split(" ")[1] + ":00"
        }
        logger.writeLog("info", `${logBase} ${API_uri} send qmarket app push. ${JSON.stringify(sendData)}`);
        let responseData = await axios.post(
            API_uri, 
            sendData
        ).then(response => {
            console.log("발송결과", response.data)
            logger.writeLog("info", `${logBase} [큐마켓] 앱 푸시가 발송되었습니다. ${JSON.stringify(response.data)}`);
            return response.data;
        }).catch(error => {
            logger.writeLog("error", `${logBase} [큐마켓] 앱 푸시 발송이 실패하였습니다.\nStacktrace: ${error.stack}`);
            return null;
        });

        return responseData;
    }  
   
    // 앱 푸시 삭제
    static async removeAppPush(martNotificationId) {
        const logBase = `qmarket mobile.qmService.sendPush: martNotificationId(${martNotificationId})`;

        logger.writeLog("info", `[큐마켓] 앱푸시를 취소합니다. martNotificationId(${martNotificationId})`);
        const API_uri = `${QMARKET_API}/fcm/alltok/${martNotificationId}`;        
        let responseData = await axios.put(API_uri).then(response => {            
            logger.writeLog("info", `${logBase} remove qmarket app push complete. ${JSON.stringify(response.data)}`);
            return response.data;
        }).catch(error => {
            logger.writeLog("error", `${logBase} remove qmarket app push failure.\nStacktrace: ${error.stack}`);            
            return null;
        });

        return responseData;
    }  
   
    // 푸시 발송 고객 목록 얻기
    static async getSendPushMembers(martNotificationId) {
        const logBase = `qmarket mobile.qmService.getSendPushMembers: martNotificationId(${martNotificationId})`;

        const API_uri = `${QMARKET_API}/fcm/alltok/${martNotificationId}`;
        logger.writeLog("info", `${logBase} ${API_uri} .`);
        let responseData = await axios.get(
            API_uri            
        ).then(response => {
            logger.writeLog("info", `${martNotificationId} 큐마켓 푸시 발송 대상 목록을 돌려 줍니다.`);
            return response.data;
        }).catch(error => {
            logger.writeLog("error", `${martNotificationId} 큐마켓 푸시 발송 대상 목록을 얻는 중 오류가 발생했습니다.\nStacktrace: ${error.stack}`);            
            return {};
        });

        return responseData;
    }  
}