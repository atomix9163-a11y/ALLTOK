const logger = require('../../config/logger.js');
const axios = require('axios');
const moment = require('moment');

const storeService = require('./storeService.js');
const customerModel = require('../models/customerModel.js');
const historyModel = require('../models/historyModel.js');

// 카카오비즈니스 처리용 서비스
const kakaoService = require('./kakaoService.js');
const messageModel = require('../models/messageModel.js');

// MTS 컴퍼니 처리용 서비스
const MTSService = require('./MTSService.js');
const messageMTSModel = require('../models/messageMTSModel.js');

const rcsService = require('./rcsService.js');
const shuketService = require('./shuketService.js');
const qmService = require('./qmService.js');

module.exports = class messageService {
    static getReserveTime(sendType, reserveTime) {
        let timeData;
        // 예약이면 발송 시간은 지금
        if (sendType == "I") {
            timeData = moment(new Date()).format('YYYY-MM-DD HH:mm');
        } else {
            if (reserveTime) {
                timeData = moment(new Date(reserveTime)).format('YYYY-MM-DD HH:mm');
            } else {
                timeData = "";
            }
        }
        return timeData;
    }

    static async getMemberList(targetGroups) {
        // 중복 제거
        let members = new Set();
        if (targetGroups.length > 0) {
            let memberList = await customerModel.groupsAllMembers(targetGroups);
            // console.log("member======================", memberList)
            for (let member of memberList) {
                // console.log("member======================", member.phone, member.phone.trim().length)
                if (member.phone && member.phone.trim().length <= 15) {
                    members.add(member.phone);
                }
            }
        }
        return members;
    }

    static buildKakaoButton(buttons) {
        console.log(buttons)
        if (buttons) {
            let buttonsJSON = []
            for (let button of buttons) {
                let buttonJSON = {
                    "name": button.name,
                    "type": button.linkType,
                    "url_mobile": button.linkMo,
                    "url_pc": button.linkPc,
                }
                buttonsJSON.push(buttonJSON);
            }
            return JSON.stringify(buttonsJSON);
        } else {
            return "";
        }
    }

    // 복합 발송
    static async sendMessage(storeCode, msgType, msgData, targetGroups, buttons, images, service = "alltok", single = "") {
        const logBase = `/service/messageService/sendMessage:`;

        logger.writeLog("info", `복합발송을 시작합니다.==============================n${storeCode}\n${msgType}\n${JSON.stringify(msgData)}\n${targetGroups}`)
        let storeInfo = await storeService.get(storeCode);        
        let members;
        if (targetGroups.length > 0) {
            members = await messageService.getMemberList(`'${targetGroups}'`);
        } else {
            members = new Set();
            let singlePhoneArray = single.split(",");
            for (let singlePhone of singlePhoneArray) {
                members.add(singlePhone);
            }            
        }
        // console.log("members================", members)

        // 단독 발송이 아닐 경우, 발송 대상에서 수신 거부 목록을 제거한다
        if (single == "") {
            // 수신 거부 목록 처리
            let refuseMemberList = await customerModel.refuseMembers(storeCode);
            let refuseMembers = new Set();
            for (let member of refuseMemberList) {
                refuseMembers.add(member.phone);
            }

            let tergateMembers = new Set([...members].filter(x => !refuseMembers.has(x))); // set1 - set2
            members = tergateMembers;
        }
        // 푸시 데이터를 기록한다
        let requestTime = moment(new Date()).format('YYYY-MM-DD HH:mm');       
        let reserveTime = messageService.getReserveTime(msgData.sendType, msgData.reserveTime);

        let messagePolicy = await messageModel.getMessageProcess(msgData.mpCode);        
        if (!messagePolicy) {
            logger.writeLog("error", `${logBase} ${msgData.mpCode} 메시지 정책을 찾을 수 없습니다. 발송이 중단됩니다.`)
            return false;
        }
        logger.writeLog("info", `메시지 정책 ${msgData.mpCode}\n${JSON.stringify(messagePolicy)}`)

        logger.writeLog("info", `${storeInfo.M_MOA_CODE} 푸시 발송 여부 ${msgData.usePush}`);
        // if (msgData.usePush && storeInfo.M_MOA_CODE.length > 0 ) {            
        if (msgData.usePush) {
            // 푸시 발송이면 이미 따로 처리를 했으므로, 발송 대상에서 제외해야 한다

            // 푸시 대상 얻기
            let pushMembers = new Set();
            // q마켓인지 슈켓인지에 따라서 발송된 고객 목록을 얻는다
            let response = null;
            let shuketAppMembers = [];
            logger.writeLog("info", `${storeInfo.M_MOA_CODE} 마트 타입 ${msgData.shopType}`);

            if (msgData.shopType == 'U') {
                // 단독인데 푸시를 쓴 경우 - 슈켓 단독 + 푸시 사용으로 간주
                response = await shuketService.getAppMembers(storeInfo.M_MOA_CODE);
                shuketAppMembers = response.data.users;
            } else {
                // 
                response = (msgData.shopType == 'L') 
                    ? await shuketService.getAppMembers(storeInfo.M_MOA_CODE)
                    : await qmService.getSendPushMembers(msgData.pushCode)
                shuketAppMembers = (msgData.shopType == 'L') ? response.data.users : response.data;
            }
            
            console.log("====================================================================")
            console.log(shuketAppMembers)
            console.log("====================================================================")
            if (shuketAppMembers) {
                for (let member of shuketAppMembers) {
                    pushMembers.add((msgData.shopType == 'L' || msgData.shopType == 'U') ? member.phone : member)
                }
            }
            // console.log("====================================================================")
            // console.log(pushMembers)
            // console.log("====================================================================")
            // 푸시 대상을 제외한 나머지 얻기
            const destMembers = shuketService.interSectSets(members, pushMembers);
            members = destMembers;
            // console.log("====================================================================")
            // console.log(members)
            // console.log("====================================================================")            
        }
        
        // 복합 발송용 데이터를 만들어서 추가한다
        let messageJSON = [];        
        for (let process of messagePolicy.process) {
            let JSON = {}
            if (process.method == 'AT') {
                // 카카오 비즈니스를 쓰는 경우와 MTS 컴퍼니를 쓰는 경우를 구분해서 데이터를 생성한다                
                const kakaoProfilekey = (msgData.kakaoProfilekey && msgData.kakaoProfilekey != "") ? msgData.kakaoProfilekey : 
                    (storeInfo.service.MTS_use && storeInfo.service.MTS_use == 'Y') ? storeInfo.service.MTS_kakaoProfilekey : storeInfo.service.kakaoProfilekey;
                if (storeInfo.service.MTS_use && storeInfo.service.MTS_use == 'Y') {
                    let template = await MTSService.getTemplate(kakaoProfilekey, msgData.kakaoTemplate);                    
                    JSON = {
                        SERVICE: 'MTS',
                        METHOD: process.method,
                        AT_TYPE: template.templateEmphasizeType,
                        SENDER_KEY: storeInfo.service.MTS_kakaoProfilekey,
                        CLIENT_ID: '',
                        BUTTON: (template.buttons) ? messageService.buildKakaoButton(template.buttons) : "",
                        TMPLCD: msgData.kakaoTemplate,
                        MSG2: msgData.kakaoText,
                        UNIT_PRICE: storeInfo.service.UP_AT
                    }
                } else {
                    let template = await kakaoService.getTemplate(kakaoProfilekey, msgData.kakaoTemplate);
                    JSON = {
                        SERVICE: 'KKO',
                        METHOD: process.method,
                        AT_TYPE: template.templateEmphasizeType,
                        SENDER_KEY: storeInfo.service.kakaoProfilekey,
                        CLIENT_ID: storeInfo.service.kakaoClientId,
                        BUTTON: (template.buttons) ? messageService.buildKakaoButton(template.buttons) : "",
                        TMPLCD: msgData.kakaoTemplate,
                        MSG2: msgData.kakaoText,
                        UNIT_PRICE: storeInfo.service.UP_AT
                    }
                }
            } else if (process.method == 'FT') {
                // 친구톡은 카카오비즈니스로만 발송
                // MTS에는 친구톡 계약은 되어 있지 않음
                JSON = {
                    SERVICE: 'KKO',
                    METHOD: process.method,
                    SENDER_KEY: storeInfo.service.kakaoProfilekey,
                    CLIENT_ID: storeInfo.service.kakaoClientId,
                    BUTTON: buttons,
                    IMAGE: images,
                    MSG2: msgData.kakaoText,
                    UNIT_PRICE: storeInfo.service.UP_FT
                }
            } else if (process.method == 'RCSLMS') {
                // RCS는 카카오비즈니스 에이전트에서만 발송
                let rejectPhone = '080-808-0165';
                let agencykey = AGENCY_KEY;
                let brandKey = storeInfo.service.brandKey;    
                let messageJSON = rcsService.buildMessage(agencykey, brandKey, storeInfo.name, storeInfo.service.callPhone, rejectPhone, msgData.RCSText, msgData.useWebLink, msgData.webLink, process.method);
                
                JSON = {
                    SERVICE: 'KKO',
                    METHOD: process.method,
                    SUBJECT: storeInfo.name,
                    MSG: msgData.SMSText,
                    MSG2: messageJSON,
                    UNIT_PRICE: storeInfo.service.UP_RCSLMS
                }
            } else if (process.method == 'RCSSMS') {
                // RCS는 카카오비즈니스 에이전트에서만 발송
                // RCS는 기존 서비스를 그대로 이용한다
                let rejectPhone = '080-808-0165';
                let agencykey = AGENCY_KEY;
                let brandKey = storeInfo.service.brandKey;    
                // console.log("storeInfo.service", storeInfo.service)
                let messageJSON = rcsService.buildMessage(agencykey, brandKey, storeInfo.name, storeInfo.service.callPhone, rejectPhone, msgData.RCSText, msgData.useWebLink, msgData.webLink, process.method);
                JSON = {
                    SERVICE: 'KKO',
                    METHOD: process.method,
                    SUBJECT: storeInfo.name,
                    MSG: msgData.SMSText,
                    MSG2: messageJSON,
                    UNIT_PRICE: storeInfo.service.UP_RCSSMS
                }
            } else if (process.method == 'LMS') {
                if (storeInfo.service.MTS_use && storeInfo.service.MTS_use == 'Y') {
                    JSON = {
                        SERVICE: 'MTS',
                        METHOD: process.method,
                        MSG: msgData.SMSText,
                        UNIT_PRICE: storeInfo.service.UP_LMS
                    }
                } else {
                    JSON = {
                        SERVICE: 'KKO',
                        METHOD: process.method,
                        MSG: msgData.SMSText,
                        UNIT_PRICE: storeInfo.service.UP_LMS
                    }
                }
            } else if (process.method == 'SMS') {
                if (storeInfo.service.MTS_use && storeInfo.service.MTS_use == 'Y') {
                    JSON = {
                        SERVICE: 'MTS',
                        METHOD: process.method,
                        MSG: msgData.SMSText,
                        UNIT_PRICE: storeInfo.service.UP_SMS
                    }
                } else {
                    JSON = {
                        SERVICE: 'KKO',
                        METHOD: process.method,
                        MSG: msgData.SMSText,
                        UNIT_PRICE: storeInfo.service.UP_SMS
                    }
                }
            }
            messageJSON.push(JSON)
        }

        logger.writeLog("info", `잔액 검사여부 ${storeInfo.service.balanceCheck}`)
        if (storeInfo.service.balanceCheck == "Y") {
            logger.writeLog("info", `잔액을 검사합니다. 현재 ${storeInfo.store_code} 마트의 잔액은 ${storeInfo.balance}원입니다`)
            // 잔액 검사. 예상 발송 금액과 잔액을 비교한다
            const balance = parseFloat(storeInfo.balance);
            const estimatedCost = members.size * parseFloat(messageJSON[0].UNIT_PRICE);

            logger.writeLog("info", `예상 발송액은 ${estimatedCost}원입니다`)
            if (balance < estimatedCost) {
                logger.writeLog("info", `${storeInfo.store_code} 발송의 잔액이 발송 예상 금액보다 적습니다. 충전을 먼저 해 주세요.`)
                return {
                    returnCode: -5,
                    returnMessage: "잔액이 발송 예상 금액보다 적습니다. 충전을 먼저 해 주세요."
                }
            }
        }

        let reserveCode = await historyModel.add(storeCode, msgData.mpCode, requestTime, (msgData.sendType == "I") ? null : reserveTime, JSON.stringify(messageJSON), members.size, msgType, (msgType == "RCSSMS" || msgType == "RCSLMS") ? "KKO" : storeInfo.service.MTS_use && storeInfo.service.MTS_use == 'Y' ? "MTS" : "KKO", msgData.pushCode);
        // 발송 정보에 따라 기록 시작

        // 프로세스 정보에서 첫번째 발송을 얻어서 발송 등록을 한다.
        // 다음 프로세스는 발송 상태가 3이지만 결과가 0 이 아닌 값에 대해 스케줄러가 처리한다
        // console.log(members)
        if (messagePolicy.process.length > 0 && members.size > 0) {
            let firstSend = messagePolicy.process[0];
            // console.log(firstSend)

            let sendResult;
            if (firstSend.method == 'AT') {
                // 알림톡 발송
                let AT_messageJSON = messageJSON.find(e => { return e.METHOD == "AT"})
                if (AT_messageJSON.SERVICE == "KKO") {
                    // 카카오비즈니스 서비스
                    sendResult = await messageModel.sendAT(
                        storeInfo.service.kakaoProfilekey,
                        storeInfo.service.kakaoClientId,
                        members, 
                        storeInfo.service.callPhone, 
                        AT_messageJSON.BUTTON, 
                        AT_messageJSON.TMPLCD,
                        msgData.sendType,
                        reserveTime,
                        AT_messageJSON.MSG2,
                        "",
                        storeCode,
                        ((AT_messageJSON.AT_TYPE == "IMAGE") ? "AI" : "AT"),
                        AT_messageJSON.UNIT_PRICE,
                        reserveCode
                    );
                } else {
                    // MTS 서비스
                    sendResult = await messageMTSModel.sendAT(
                        storeInfo.service.MTS_kakaoProfilekey,                        
                        members, 
                        storeInfo.service.callPhone, 
                        AT_messageJSON.BUTTON, 
                        AT_messageJSON.TMPLCD,
                        msgData.sendType,
                        reserveTime,
                        AT_messageJSON.MSG2,
                        "",
                        storeCode,
                        ((AT_messageJSON.AT_TYPE == "IMAGE") ? "51" : "5"),
                        AT_messageJSON.UNIT_PRICE,
                        reserveCode
                    );
                }
            } else if (firstSend.method == 'FT') {
                // 알림톡 발송
                let FT_messageJSON = messageJSON.find(e => { return e.METHOD == "FT"})
                sendResult = await messageModel.sendFT(
                    storeInfo.service.kakaoProfilekey,
                    storeInfo.service.kakaoClientId,
                    members, 
                    storeInfo.service.callPhone, 
                    FT_messageJSON.BUTTON, 
                    FT_messageJSON.IMAGE,
                    msgData.sendType,
                    reserveTime,
                    FT_messageJSON.MSG2,
                    "",
                    storeCode,
                    "FT",
                    FT_messageJSON.UNIT_PRICE,
                    reserveCode
                );
            } else if (firstSend.method == 'RCSLMS') {
                // RCS SMS 발송
                let RCSLMS_messageJSON = messageJSON.find(e => { return e.METHOD == "RCSLMS"})
                // console.log(RCSSMS_messageJSON)
                sendResult = await messageModel.sendRCS(
                    members, 
                    storeInfo.service.callPhone, 
                    RCSLMS_messageJSON.SUBJECT, 
                    msgData.sendType,
                    reserveTime, 
                    JSON.stringify(RCSLMS_messageJSON.MSG2), 
                    RCSLMS_messageJSON.MSG,
                    storeCode,
                    "RCSLMS",
                    RCSLMS_messageJSON.UNIT_PRICE,                    
                    reserveCode
                );
            } else if (firstSend.method == 'RCSSMS') {
                // RCS SMS 발송
                let RCSSMS_messageJSON = messageJSON.find(e => { return e.METHOD == "RCSSMS"})
                // console.log(RCSSMS_messageJSON)
                sendResult = await messageModel.sendRCS(
                    members, 
                    storeInfo.service.callPhone, 
                    RCSSMS_messageJSON.SUBJECT, 
                    msgData.sendType,
                    reserveTime, 
                    JSON.stringify(RCSSMS_messageJSON.MSG2), 
                    RCSSMS_messageJSON.MSG,
                    storeCode,
                    "RCSSMS",
                    RCSSMS_messageJSON.UNIT_PRICE,                    
                    reserveCode
                );
            } else if (firstSend.method == 'LMS') {
                // SMS 발송
                let LMS_messageJSON = messageJSON.find(e => { return e.METHOD == "LMS"})
                if (LMS_messageJSON.SERVICE == "KKO") {
                    sendResult = await messageModel.sendSMS(
                        members, 
                        storeInfo.service.callPhone, 
                        msgData.sendType,
                        reserveTime, 
                        LMS_messageJSON.MSG, 
                        storeCode,
                        "LMS",
                        LMS_messageJSON.UNIT_PRICE,                    
                        reserveCode
                    );
                } else {
                    sendResult = await messageMTSModel.sendSMS(
                        members, 
                        storeInfo.service.callPhone, 
                        msgData.sendType,
                        reserveTime, 
                        LMS_messageJSON.MSG, 
                        storeCode,
                        "LMS",
                        LMS_messageJSON.UNIT_PRICE,                    
                        reserveCode
                    );
                }
            } else if (firstSend.method == 'SMS') {
                // SMS 발송
                let SMS_messageJSON = messageJSON.find(e => { return e.METHOD == "SMS"})
                console.log(SMS_messageJSON)
                if (SMS_messageJSON.SERVICE == "KKO") {
                    sendResult = await messageModel.sendSMS(
                        members, 
                        storeInfo.service.callPhone, 
                        msgData.sendType,
                        reserveTime, 
                        SMS_messageJSON.MSG, 
                        storeCode,
                        "SMS",
                        SMS_messageJSON.UNIT_PRICE,                    
                        reserveCode
                    );
                } else {
                    sendResult = await messageMTSModel.sendSMS(
                        members, 
                        storeInfo.service.callPhone, 
                        msgData.sendType,
                        reserveTime, 
                        SMS_messageJSON.MSG, 
                        storeCode,
                        "SMS",
                        SMS_messageJSON.UNIT_PRICE,                    
                        reserveCode
                    );
                }
            }            
            if (sendResult) {
                return {
                    returnCode: 0,
                    returnMessage: "발송이 완료되었습니다."
                }
            } else {
                return {
                    returnCode: -2,
                    returnMessage: "(DB ERROR) 발송 정보 등록이 실패했습니다."
                }
            }
        } else {
            if (messagePolicy.process.length == 0) {
                return {
                    returnCode: -3,
                    returnMessage: "발송 서비스가 선택되지 않았습니다."
                }
            } else {
                return {
                    returnCode: -4,
                    returnMessage: "보낼 대상이 없습니다"
                }
            }
        }
    }

    // 외부 발송용 API
    static async sendMessageExt(storeCode, msgType, msgData, targets, service = "alltok") {
        const logBase = `/service/messageService/sendMessageExt:`;

        logger.writeLog("info", `외부 발송용 복합발송을 시작합니다.\n${storeCode}\n${msgType}\n${JSON.stringify(msgData)}\n${targets}`)
        let storeInfo = await storeService.get(storeCode);        
        let members = new Set();
        let singlePhoneArray = targets.split(",");
        for (let singlePhone of singlePhoneArray) {
            members.add(singlePhone);
        }            
        
        // 기본 정보를 체크하고 세팅한다
        let requestTime = moment(new Date()).format('YYYY-MM-DD HH:mm');       
        let reserveTime = messageService.getReserveTime(msgData.sendType, msgData.reserveTime);

        let messagePolicy = await messageModel.getMessageProcess(msgData.mpCode);        
        if (!messagePolicy) {
            logger.writeLog("error", `${logBase} ${msgData.mpCode} 메시지 정책을 찾을 수 없습니다. 발송이 중단됩니다.`)
            return false;
        }
        logger.writeLog("info", `메시지 정책 ${msgData.mpCode}\n${JSON.stringify(messagePolicy)}`)

        // 복합 발송용 데이터를 만들어서 추가한다
        let messageJSON = [];        
        for (let process of messagePolicy.process) {
            let JSON = {}
            if (process.method == 'AT') {
                // 카카오 비즈니스를 쓰는 경우와 MTS 컴퍼니를 쓰는 경우를 구분해서 데이터를 생성한다                
                const kakaoProfilekey = (msgData.kakaoProfilekey && msgData.kakaoProfilekey != "") ? msgData.kakaoProfilekey : 
                    (storeInfo.service.MTS_use && storeInfo.service.MTS_use == 'Y') ? storeInfo.service.MTS_kakaoProfilekey : storeInfo.service.kakaoProfilekey;
                const kakaoTemplate = (msgData.kakaoTemplate && msgData.kakaoTemplate != "") ? msgData.kakaoTemplate : 
                    (storeInfo.service.MTS_use && storeInfo.service.MTS_use == 'Y') ? storeInfo.service.MTS_kakaoDefaultTemplate : storeInfo.service.kakaoDefaultTemplate;                
                    // console.log('========================================================')
                    // console.log(storeInfo.service)
                    // console.log('========================================================')
                    // console.log(kakaoProfilekey, kakaoTemplate)
                if (storeInfo.service.MTS_use && storeInfo.service.MTS_use == 'Y') {
                    let template = await MTSService.getTemplate(kakaoProfilekey, kakaoTemplate);                    
                    JSON = {
                        SERVICE: 'MTS',
                        METHOD: process.method,
                        AT_TYPE: template.templateEmphasizeType,
                        SENDER_KEY: storeInfo.service.MTS_kakaoProfilekey,
                        CLIENT_ID: '',
                        BUTTON: (template.buttons) ? messageService.buildKakaoButton(template.buttons) : "",
                        TMPLCD: kakaoTemplate,
                        MSG2: msgData.kakaoText,
                        UNIT_PRICE: storeInfo.service.UP_AT
                    }
                } else {
                    let template = await kakaoService.getTemplate(kakaoProfilekey, kakaoTemplate);
                    // console.log(template)
                    JSON = {
                        SERVICE: 'KKO',
                        METHOD: process.method,
                        AT_TYPE: template.templateEmphasizeType,
                        SENDER_KEY: storeInfo.service.kakaoProfilekey,
                        CLIENT_ID: storeInfo.service.kakaoClientId,
                        BUTTON: (template.buttons) ? messageService.buildKakaoButton(template.buttons) : "",
                        TMPLCD: kakaoTemplate,
                        MSG2: msgData.kakaoText,
                        UNIT_PRICE: storeInfo.service.UP_AT
                    }
                }
            } else if (process.method == 'FT') {
                JSON = {
                    SERVICE: 'KKO',
                    METHOD: process.method,
                    SENDER_KEY: storeInfo.service.kakaoProfilekey,
                    CLIENT_ID: storeInfo.service.kakaoClientId,
                    BUTTON: buttons,
                    IMAGE: images,
                    MSG2: msgData.kakaoText,
                    UNIT_PRICE: storeInfo.service.UP_FT
                }
            } else if (process.method == 'RCSLMS') {
                let rejectPhone = '080-808-0165';
                let agencykey = AGENCY_KEY;
                let brandKey = storeInfo.service.brandKey;    
                let messageJSON = rcsService.buildMessage(agencykey, brandKey, storeInfo.name, storeInfo.service.callPhone, rejectPhone, msgData.RCSText, msgData.useWebLink, msgData.webLink, process.method);
                
                JSON = {
                    SERVICE: 'KKO',
                    METHOD: process.method,
                    SUBJECT: storeInfo.name,
                    MSG: msgData.SMSText,
                    MSG2: messageJSON,
                    UNIT_PRICE: storeInfo.service.UP_RCSLMS
                }
            } else if (process.method == 'RCSSMS') {
                let rejectPhone = '080-808-0165';
                let agencykey = AGENCY_KEY;
                let brandKey = storeInfo.service.brandKey;    
                let messageJSON = rcsService.buildMessage(agencykey, brandKey, storeInfo.name, storeInfo.service.callPhone, rejectPhone, msgData.RCSText, msgData.useWebLink, msgData.webLink, process.method);
                JSON = {
                    SERVICE: 'KKO',
                    METHOD: process.method,
                    SUBJECT: storeInfo.name,
                    MSG: msgData.SMSText,
                    MSG2: messageJSON,
                    UNIT_PRICE: storeInfo.service.UP_RCSSMS
                }
            } else if (process.method == 'LMS') {
                if (storeInfo.service.MTS_use && storeInfo.service.MTS_use == 'Y') {
                    JSON = {
                        SERVICE: 'MTS',
                        METHOD: process.method,
                        MSG: msgData.SMSText,
                        UNIT_PRICE: storeInfo.service.UP_LMS
                    }
                } else {
                    JSON = {
                        SERVICE: 'KKO',
                        METHOD: process.method,
                        MSG: msgData.SMSText,
                        UNIT_PRICE: storeInfo.service.UP_LMS
                    }
                }
            } else if (process.method == 'SMS') {
                if (storeInfo.service.MTS_use && storeInfo.service.MTS_use == 'Y') {
                    JSON = {
                        SERVICE: 'MTS',
                        METHOD: process.method,
                        MSG: msgData.SMSText,
                        UNIT_PRICE: storeInfo.service.UP_SMS
                    }
                } else {
                    JSON = {
                        SERVICE: 'KKO',
                        METHOD: process.method,
                        MSG: msgData.SMSText,
                        UNIT_PRICE: storeInfo.service.UP_SMS
                    }
                }
            }
            messageJSON.push(JSON)
        }

        logger.writeLog("info", `잔액 검사여부 ${storeInfo.service.balanceCheck}`)
        if (storeInfo.service.balanceCheck == "Y") {
            logger.writeLog("info", `잔액을 검사합니다. 현재 ${storeInfo.store_code}의 잔액은 ${storeInfo.balance}원입니다`)
            // 잔액 검사. 예상 발송 금액과 잔액을 비교한다
            const balance = parseFloat(storeInfo.balance);
            const estimatedCost = members.size * parseFloat(messageJSON[0].UNIT_PRICE);

            logger.writeLog("info", `예상 발송액은 ${estimatedCost}원입니다`)
            if (balance < estimatedCost) {
                logger.writeLog("info", `${storeInfo.store_code} 발송의 잔액이 발송 예상 금액보다 적습니다. 충전을 먼저 해 주세요.`)
                return {
                    returnCode: -5,
                    returnMessage: "잔액이 발송 예상 금액보다 적습니다. 충전을 먼저 해 주세요."
                }
            }
        }

        let reserveCode = await historyModel.add(storeCode, msgData.mpCode, requestTime, (msgData.sendType == "I") ? null : reserveTime, JSON.stringify(messageJSON), members.size, msgType, (msgType == "RCSSMS" || msgType == "RCSLMS") ? "KKO" : storeInfo.service.MTS_use && storeInfo.service.MTS_use == 'Y' ? "MTS" : "KKO");
        // 발송 정보에 따라 기록 시작

        // 프로세스 정보에서 첫번째 발송을 얻어서 발송 등록을 한다.
        // 다음 프로세스는 발송 상태가 3이지만 결과가 0 이 아닌 값에 대해 스케줄러가 처리한다
        // console.log(members)
        if (messagePolicy.process.length > 0 && members.size > 0) {
            let firstSend = messagePolicy.process[0];
            // console.log(firstSend)

            let sendResult;
            if (firstSend.method == 'AT') {
                // 알림톡 발송
                let AT_messageJSON = messageJSON.find(e => { return e.METHOD == "AT"})
                if (AT_messageJSON.SERVICE == "KKO") {
                    // 카카오비즈니스 서비스
                    sendResult = await messageModel.sendAT(
                        storeInfo.service.kakaoProfilekey,
                        storeInfo.service.kakaoClientId,
                        members, 
                        storeInfo.service.callPhone, 
                        AT_messageJSON.BUTTON, 
                        AT_messageJSON.TMPLCD,
                        msgData.sendType,
                        reserveTime,
                        AT_messageJSON.MSG2,
                        "",
                        storeCode,
                        ((AT_messageJSON.AT_TYPE == "IMAGE") ? "AI" : "AT"),
                        AT_messageJSON.UNIT_PRICE,
                        reserveCode
                    );
                } else {
                    // MTS 서비스
                    sendResult = await messageMTSModel.sendAT(
                        storeInfo.service.MTS_kakaoProfilekey,                        
                        members, 
                        storeInfo.service.callPhone, 
                        AT_messageJSON.BUTTON, 
                        AT_messageJSON.TMPLCD,
                        msgData.sendType,
                        reserveTime,
                        AT_messageJSON.MSG2,
                        "",
                        storeCode,
                        ((AT_messageJSON.AT_TYPE == "IMAGE") ? "51" : "5"),
                        AT_messageJSON.UNIT_PRICE,
                        reserveCode
                    );
                }
            } else if (firstSend.method == 'FT') {
                // 알림톡 발송
                let FT_messageJSON = messageJSON.find(e => { return e.METHOD == "FT"})
                sendResult = await messageMTSModel.sendFT(
                    storeInfo.service.kakaoProfilekey,
                    storeInfo.service.kakaoClientId,
                    members, 
                    storeInfo.service.callPhone, 
                    FT_messageJSON.BUTTON, 
                    FT_messageJSON.IMAGE,
                    msgData.sendType,
                    reserveTime,
                    FT_messageJSON.MSG2,
                    "",
                    storeCode,
                    "FT",
                    FT_messageJSON.UNIT_PRICE,
                    reserveCode
                );
            } else if (firstSend.method == 'RCSLMS') {
                // RCS SMS 발송
                let RCSLMS_messageJSON = messageJSON.find(e => { return e.METHOD == "RCSLMS"})
                // console.log(RCSSMS_messageJSON)
                sendResult = await messageModel.sendRCS(
                    members, 
                    storeInfo.service.callPhone, 
                    RCSLMS_messageJSON.SUBJECT, 
                    msgData.sendType,
                    reserveTime, 
                    JSON.stringify(RCSLMS_messageJSON.MSG2), 
                    RCSLMS_messageJSON.MSG,
                    storeCode,
                    "RCSLMS",
                    RCSLMS_messageJSON.UNIT_PRICE,                    
                    reserveCode
                );
            } else if (firstSend.method == 'RCSSMS') {
                // RCS SMS 발송
                let RCSSMS_messageJSON = messageJSON.find(e => { return e.METHOD == "RCSSMS"})
                // console.log(RCSSMS_messageJSON)
                sendResult = await messageModel.sendRCS(
                    members, 
                    storeInfo.service.callPhone, 
                    RCSSMS_messageJSON.SUBJECT, 
                    msgData.sendType,
                    reserveTime, 
                    JSON.stringify(RCSSMS_messageJSON.MSG2), 
                    RCSSMS_messageJSON.MSG,
                    storeCode,
                    "RCSSMS",
                    RCSSMS_messageJSON.UNIT_PRICE,                    
                    reserveCode
                );
            } else if (firstSend.method == 'LMS') {
                // SMS 발송
                let LMS_messageJSON = messageJSON.find(e => { return e.METHOD == "LMS"})
                if (LMS_messageJSON.SERVICE == "KKO") {
                    sendResult = await messageModel.sendSMS(
                        members, 
                        storeInfo.service.callPhone, 
                        msgData.sendType,
                        reserveTime, 
                        LMS_messageJSON.MSG, 
                        storeCode,
                        "LMS",
                        LMS_messageJSON.UNIT_PRICE,                    
                        reserveCode
                    );
                } else {
                    sendResult = await messageMTSModel.sendSMS(
                        members, 
                        storeInfo.service.callPhone, 
                        msgData.sendType,
                        reserveTime, 
                        LMS_messageJSON.MSG, 
                        storeCode,
                        "LMS",
                        LMS_messageJSON.UNIT_PRICE,                    
                        reserveCode
                    );
                }
            } else if (firstSend.method == 'SMS') {
                // SMS 발송
                let SMS_messageJSON = messageJSON.find(e => { return e.METHOD == "SMS"})
                if (SMS_messageJSON.SERVICE == "KKO") {
                    sendResult = await messageModel.sendSMS(
                        members, 
                        storeInfo.service.callPhone, 
                        msgData.sendType,
                        reserveTime, 
                        SMS_messageJSON.MSG, 
                        storeCode,
                        "SMS",
                        SMS_messageJSON.UNIT_PRICE,                    
                        reserveCode
                    );
                } else {
                    sendResult = await messageMTSModel.sendSMS(
                        members, 
                        storeInfo.service.callPhone, 
                        msgData.sendType,
                        reserveTime, 
                        SMS_messageJSON.MSG, 
                        storeCode,
                        "SMS",
                        SMS_messageJSON.UNIT_PRICE,                    
                        reserveCode
                    );
                }
                
                // const sendData = {
                //     members:  Array.from(members),
                //     callPhone: storeInfo.service.callPhone,
                //     sendType: msgData.sendType,
                //     reserveTime: reserveTime,
                //     message: SMS_messageJSON.MSG,
                //     storeCode: storeCode,
                //     messageType: "SMS",
                //     unitPrice: SMS_messageJSON.UNIT_PRICE,
                //     reserveCode: reserveCode
                // }
                // sendResult = await messageService.sendMessageToMessageServer(sendData);
            }            
            if (sendResult) {
                return {
                    returnCode: 0,
                    returnMessage: "발송이 완료되었습니다."
                }
            } else {
                return {
                    returnCode: -2,
                    returnMessage: "(DB ERROR) 발송 정보 등록이 실패했습니다."
                }
            }
        } else {
            if (messagePolicy.process.length == 0) {
                return {
                    returnCode: -3,
                    returnMessage: "발송 서비스가 선택되지 않았습니다."
                }
            } else {
                return {
                    returnCode: -4,
                    returnMessage: "보낼 대상이 없습니다"
                }
            }
        }
    }
    // KT RCS 서버로 실제 발송 정보를 전달한다
    // static sendMessageToMessageServer = async (msgData) => {
    //     let logBase = `services/messageService.sendMessageToMessageServer: storeCode(${msgData.storeCode}, 문자종류(${msgData.messageType}), 발송종류(${msgData.sendType}), 발송시간(${msgData.reserveTime}), 발송요청수(${msgData.members.length})`;

    //     const xToken = MSG_AUTH_KEY;
    //     let callApi = `${MSG_API_SERVER_ADDRESS}/push/apiSendBulk`;
    //     let result = await axios.post(callApi, {
    //         msgData: JSON.stringify(msgData)
    //     }, {
    //         headers: {
    //             xtoken: xToken
    //         }
    //     }).then(response => {
    //         if (response.data.result && response.data.data) {
    //             logger.writeLog("info", `${logBase} // 발송요청 등록 성공`);
    //             return true;
    //         } else {
    //             logger.writeLog("info", `${logBase} // 발송요청 등록 실패`);
    //             return false;
    //         }
    //     })
    //     .catch(error => {             
    //         logger.writeLog("error", `${logBase} // 발송요청 호출 실패`);
    //         return false;
    //     });

    //     return result;
    // }


    // 공백을 제외한 모든 특수문자 제거
    static getPlainTextTag(text) {
        let regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
        let plainText = text.replace(regExp, "");

        return plainText;
    }

    static  interSectSets(setA, setB){
        var intersection = new Set()
        setA.forEach(e=>{
            if(!setB.has(e)) intersection.add(e)
        })
        return intersection
    }

    static async checkValueSend(storeCode, targetGroups, mpCode) {
        // 서비스 정보를 얻는다 
        let storeInfo = await storeService.get(storeCode);

        // 대상 목록을 얻는다
        let members = await twagentService.getMemberList(targetGroups);
        // 수신 거부 목록 처리
        let refuseMemberList = await customersModel.refuseMember(storeCode);
        let refuseMembers = new Set();
        for (let member of refuseMemberList) {
            refuseMembers.add(member.phone);
        }
        let tergateMembers = new Set([...members].filter(x => !refuseMembers.has(x))); // set1 - set2
        members = tergateMembers;

        // MP code로부터 발송 항목 중 최대 단가를 얻는다
        let messagePolicy = await messageModel.getMessageProcess(mpCode);

        console.log("messagePolicy", messagePolicy.process)

        let maxUnitPrice = 0;
        for (let mp of messagePolicy.process) {
            if (mp.method == 'AT') {
                if (maxUnitPrice < storeInfo.service.UP_AT) maxUnitPrice = storeInfo.service.UP_AT;
            } else if (mp.method == 'FT') {
                if (maxUnitPrice < storeInfo.service.UP_FT) maxUnitPrice = storeInfo.service.UP_FT;
            } else if (mp.method == 'RCSLMS') {
                if (maxUnitPrice < storeInfo.service.UP_RCSLMS) maxUnitPrice = storeInfo.service.UP_RCSLMS;
            } else if (mp.method == 'RCSSMS') {
                if (maxUnitPrice < storeInfo.service.UP_RCSSMS) maxUnitPrice = storeInfo.service.UP_RCSSMS;
            } else if (mp.method == 'LMS') {
                if (maxUnitPrice < storeInfo.service.UP_LMS) maxUnitPrice = storeInfo.service.UP_LMS;
            } else if (mp.method == 'SMS') {
                if (maxUnitPrice < storeInfo.service.UP_SMS) maxUnitPrice = storeInfo.service.UP_SMS;
            }
        }

        return {
            balance: storeInfo.balance,
            count: members.size,
            maxUnitPrice: maxUnitPrice
        }
    }

    static async checkDuplicateSendMessage(allowSendRepeat, req) {
        let storeCode = req.body.storeCode;
        let msgType = req.body.msgType;
        let msgData = JSON.parse(req.body.msgData);
        let msgDataString = req.body.msgData;
        let targetGroups = req.body.targetGroups;

        // 동일 날짜 내에 같은 발송 기록이 있는지 확인
        // 즉시 발송/예약, 메시지 종류, 타겟 그룹이 당일에 있으면 해당 값을 리턴
        let findRows = allowSendRepeat == "Y" ? await messageModel.getMessageSendHistory(storeCode, msgData.pushSendType + msgData.sendType, msgType, targetGroups) : 
            await messageModel.getMessageSendHistoryDay(storeCode, msgData.pushSendType + msgData.sendType, msgType, targetGroups);

        if (findRows) {
            // 1 건이라고 있으면, 내용이 같은지 확인한다
            let duplicate = false;
            for (let row of findRows) {
                if (row.msg_data == msgDataString) {
                    duplicate = true;
                    break;
                }
            }
            return duplicate;
        } else {
            return false;
        }
    }
}