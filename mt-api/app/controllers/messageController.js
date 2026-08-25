const moment = require('moment');
const messageService = require('../services/messageService.js');
const messageModel = require('../models/messageModel.js');
const storeModel = require('../models/storeModel.js');
// const affiliatedStoreModel = require('../models/affiliatedStore.js');
// const pushModel = require('../models/push.js');
// const storeService = require('../services/store.js');
const logger = require("../../config/logger.js");
const requestIp = require("request-ip");

module.exports = {
    // 시스템 메시지 발송
    async sendMessage(req, res, next) {
        let storeCode = req.body.storeCode;
        let msgType = req.body.msgType;
        let msgData = JSON.parse(req.body.msgData);
        let msgDataString = req.body.msgData;
        msgData.pushData = (msgData.pushData != {}) ? JSON.parse(msgData.pushData) : {};
        let targetGroups = req.body.targetGroups;
        let service = req.body.service ? req.body.service : 'alltok';

        let buttons = req.body.buttons; // FT에서만 사용
        let images = req.body.images; // FT에서만 사용

        logger.writeLog("info", `${storeCode} 메시지를 발송하기 위해 중복 여부를 확인합니다.`, requestIp.getClientIp(req));

        // 중복 발송 여부 체크를 위하여 서비스 정보를 가져온다
        let serviceJSON = await storeModel.getService(storeCode);
        if (!serviceJSON) {
            serviceJSON = storeService.buildServiceJSON(null);
        } else {
            serviceJSON = JSON.parse(serviceJSON.data);
        }       

        let duplicateSend = await messageService.checkDuplicateSendMessage(serviceJSON.allowSendRepeat ? serviceJSON.allowSendRepeat : 'Y', req);
        
        if (!duplicateSend) {
            logger.writeLog("info", `${storeCode} 중복 점검에 사용할 데이터를 기록합니다.`);
            // 당일 중복 방지 발송을 위한 데이터 기록
            await messageModel.saveMessageSendHistory(storeCode, msgData.pushSendType + msgData.sendType, msgType, targetGroups, msgDataString);

            logger.writeLog("info", `${storeCode} 메시지를 발송 시작합니다.=============================`, requestIp.getClientIp(req));
            let result = await messageService.sendMessage(storeCode, msgType, msgData, targetGroups, buttons, images, service);

            if (result.returnCode != 0) {            
                logger.writeLog("info", `${storeCode} 발송 등록이 실패했습니다. ${JSON.stringify(result)}`);
            }
    
            res.status(200).json({
                result: true,
                data: result
            });
        } else {
            logger.writeLog("info", `${storeCode} 중복된 메시지를 ${duplicateSend ? "찾았습니다. 발송을 중단합니다." : "찾지 못했습니다. 발송을 계속합니다."}`);

            res.status(200).json({
                result: true,
                data: {
                    returnCode: -1,
                    returnMessage: "같은 메시지를 같은 대상 그룹에 같은 날에 보낼 수 없습니다."
                }

            });
        }
    },

    // 외부 발송 API용
    async sendMessageExt(req, res, next) {
        let storeCode = req.body.storeCode;
        let msgType = req.body.msgType;
        let msgData = JSON.parse(req.body.msgData);
        let targets = req.body.targets;
        let service = 'alltok';

        logger.writeLog("info", `${storeCode} 외부 발송용 문자 발송을 시작합니다.================`);
        let result = await messageService.sendMessageExt(storeCode, msgType, msgData, targets, service);

        res.status(200).json({
            result: true,
            data: result
        });
    },

}