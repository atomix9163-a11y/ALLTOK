const logger = require("../../config/logger");
const moment = require("moment");
const scheduleModel = require("../models/schedule");
const scheduleMTSModel = require("../models/scheduleMTS");
const scheduleService = require("../services/schedule");

module.exports = class scheduler {
    static async processMessage() {
        let logBase = "ALLTOK 메시징 스케쥴러 (KBZ):::"
        logger.writeLog("info", `${logBase} ${moment().format("YYYY-MM-DD HH:mm:ss")} 트리거를 시작합니다.`);

        // 미발송 메시지 처리
        let finishKeys = new Array();
        let details = await scheduleModel.getUnfinished(PROCESS_MAX);        
        if (details && details.length > 0) {
            logger.writeLog("info", `${details.length} records in processing.`);
            for (let detail of details) {
                // 현재 발송 방식으로부터 순번을 얻는다
                const [err, result] = scheduleService.safeJsonParse(detail.MSG2);
                let MSG2 = null;
                if (!err) {
                    MSG2 = result;
                }
                let messageJSON = JSON.parse(detail.message_JSON);
                let policyJSON = JSON.parse(detail.mp_policy);
                
                let original_TYPE_sub = scheduleService.getTypeName(detail.TYPE, MSG2, detail.MESSAGE_TYPE);
                if (original_TYPE_sub == "AI") original_TYPE_sub = "AT";
                // logger.writeLog("info", `${detail.store_code} / ${detail.phone} / ${original_TYPE_sub} 발송 실패에 대한 다음 발송 처리를 수행합니다.`);
                // console.log(policyJSON)

                // 현재 정책을 찾는다
                let findPolicy = policyJSON.find(e => { return e.method == original_TYPE_sub});
                // 정책이 없으면 종료
                if (!findPolicy) continue;

                // 다음 순번을 찾는다
                let nextPolicy = policyJSON.find(e => { return e.seq == findPolicy.seq + 1});
                if (nextPolicy) {
                    // 다음 발송이 있다
                    let service = JSON.parse(detail.service);
                    // 다음 발송을 기록한다. 복합 발송이기 때문에 이전 발송 후 발송이므로 발송 방식(sendType)은 모두 즉시발송(I)이 된다
                    let callPhone = service.call_phone ? service.call_phone : service.callPhone;
                    switch (nextPolicy.method) {
                        case "AT":
                            // 알림톡 등록
                            if (service.AT == 'Y') {
                                logger.writeLog("info", `${detail.store_code} / ${detail.phone} / ${original_TYPE_sub} -> ${nextPolicy.method} 재발송 처리`);
                                let message = messageJSON.find(e => { return e.METHOD == nextPolicy.method});
                                // SMS 등록
                                scheduleModel.sendAT(detail.MSGKEY, message.SENDER_KEY, message.CLIENT_ID, detail.phone, callPhone, message.BUTTON, message.TMPLCD, "I", "", message.MSG2, "", detail.store_code, nextPolicy.method, message.UNIT_PRICE, detail.reserve_code);
                            }
                            break;
                        case "FT":
                            // 친구톡 등록
                            if (service.FT == 'Y') {
                                logger.writeLog("info", `${detail.store_code} / ${detail.phone} / ${original_TYPE_sub} -> ${nextPolicy.method} 재발송 처리`);
                                let message = messageJSON.find(e => { return e.METHOD == nextPolicy.method});
                                // SMS 등록
                                scheduleModel.sendFT(detail.MSGKEY, message.SENDER_KEY, message.CLIENT_ID, detail.phone, callPhone, message.BUTTON, message.IMAGE, "I", "", message.MSG2, "", detail.store_code, nextPolicy.method, message.UNIT_PRICE, detail.reserve_code)
                            }
                            break;
                        case "RCSSMS":
                        case "RCSLMS":
                            // RCSSMS 등록
                            if ((service.RCSLMS == 'Y' && nextPolicy.method == "RCSLMS") || (service.RCSSMS == 'Y' && nextPolicy.method == "RCSSMS")) {
                                logger.writeLog("info", `${detail.store_code} / ${detail.phone} / ${original_TYPE_sub} -> ${nextPolicy.method} 재발송 처리`);

                                let message = messageJSON.find(e => { return e.METHOD == nextPolicy.method});
                                // SMS 등록
                                scheduleModel.sendRCS(detail.MSGKEY, detail.phone, callPhone, message.SUBJECT, "I", '', JSON.stringify(message.MSG2), message.MSG, detail.store_code, nextPolicy.method, message.UNIT_PRICE, detail.reserve_code);
                            }
                            break;
                        case "SMS":
                        case "LMS":
                            // LMS 등록
                            if ((service.LMS == 'Y' && nextPolicy.method == "LMS") || (service.SMS == 'Y' && nextPolicy.method == "SMS")) {
                                logger.writeLog("info", `${detail.store_code} / ${detail.phone} / ${original_TYPE_sub} -> ${nextPolicy.method} 재발송 처리`);

                                let message = messageJSON.find(e => { return e.METHOD == nextPolicy.method});
                                // console.log(message);
                                // SMS 등록
                                scheduleModel.sendSMS(detail.MSGKEY, detail.phone, callPhone, "I", '', message.MSG, detail.store_code, nextPolicy.method, message.UNIT_PRICE, detail.reserve_code);
                            }
                            break;
                        }
                } else {
                    // 발송이 없다
                    // logger.writeLog("info", `${detail.store_code} / ${detail.phone} / ${original_TYPE_sub} 후속 발송이 없으므로 종료 등록합니다.`);
                    finishKeys.push(detail.MSGKEY);
                }
                // console.log(findPolicy, nextPolicy);

            }
            if (finishKeys.length > 0) {
                logger.writeLog("info", `${finishKeys.length}개의 종료 등록된 항목을 종료 처리합니다`);
                // console.log(finishKeys.join())
                await scheduleModel.setFinishArray(finishKeys);
            }
            
        } else {
            logger.writeLog("info", `${logBase} 발송할 대상이 없습니다.`);
        }
    }

    static async processMessageMTS() {
        let logBase = "ALLTOK 메시징 스케쥴러 (MTS):::"
        logger.writeLog("info", `${logBase} ${moment().format("YYYY-MM-DD HH:mm:ss")} 트리거를 시작합니다.`);

        // 미발송 메시지 처리
        let finishKeys = new Array();
        let details = await scheduleMTSModel.getUnfinished(PROCESS_MAX_MTS);        
        if (details && details.length > 0) {
            logger.writeLog("info", `${details.length} records in processing.`);
            for (let detail of details) {
                // console.log(detail)
                // 현재 발송 방식으로부터 순번을 얻는다
                let messageJSON = JSON.parse(detail.message_JSON);
                let policyJSON = JSON.parse(detail.mp_policy);
                
                let original_TYPE_sub = (detail.TRAN_TYPE == "1") ? "SMS" : (detail.TRAN_TYPE == "4") ? "LMS" : "AT";
                logger.writeLog("info", `${detail.store_code} / ${detail.phone} / ${original_TYPE_sub} 발송 실패에 대한 다음 발송 처리를 수행합니다.`);
                // console.log(policyJSON)

                // 현재 정책을 찾는다
                let findPolicy = policyJSON.find(e => { return e.method == original_TYPE_sub});
                // 정책이 없으면 종료
                if (!findPolicy) continue;

                // 다음 순번을 찾는다
                let nextPolicy = policyJSON.find(e => { return e.seq == findPolicy.seq + 1});
                if (nextPolicy) {
                    // 다음 발송이 있다
                    let service = JSON.parse(detail.service);
                    // 다음 발송을 기록한다. 복합 발송이기 때문에 이전 발송 후 발송이므로 발송 방식(sendType)은 모두 즉시발송(I)이 된다
                    let callPhone = service.call_phone ? service.call_phone : service.callPhone;
                    console.log(nextPolicy.method)
                    switch (nextPolicy.method) {
                        case "AT":
                            // 알림톡 등록
                            if (service.AT == 'Y') {
                                logger.writeLog("info", `MTS ${detail.store_code} / ${detail.phone} / ${original_TYPE_sub} -> ${nextPolicy.method} 재발송 처리`);
                                let message = messageJSON.find(e => { return e.METHOD == nextPolicy.method});
                                // SMS 등록                                
                                const sendATresult = scheduleMTSModel.sendAT(message.SENDER_KEY, detail.phone, callPhone, message.BUTTON, message.TMPLCD, "I", "", message.MSG2, detail.store_code, nextPolicy.method, message.UNIT_PRICE, detail.reserve_code);
                                if (sendATresult) finishKeys.push(detail.TRAN_PR);
                            }
                            break;
                        case "SMS":
                        case "LMS":
                            // LMS 등록
                            if ((service.LMS == 'Y' && nextPolicy.method == "LMS") || (service.SMS == 'Y' && nextPolicy.method == "SMS")) {
                                logger.writeLog("info", `${detail.store_code} / ${detail.phone} / ${original_TYPE_sub} -> ${nextPolicy.method} 재발송 처리`);

                                let message = messageJSON.find(e => { return e.METHOD == nextPolicy.method});
                                // console.log(message);
                                // SMS 등록
                                const sendATresult = scheduleMTSModel.sendSMS(detail.phone, callPhone, "I", '', message.MSG, detail.store_code, nextPolicy.method, message.UNIT_PRICE, detail.reserve_code);
                                if (sendATresult) finishKeys.push(detail.TRAN_PR);
                            } else {
                                finishKeys.push(detail.TRAN_PR);
                            }
                            break;
                        }
                } else {
                    // 발송이 없다
                    logger.writeLog("info", `${detail.store_code} / ${detail.phone} / ${original_TYPE_sub} 후속 발송이 없으므로 종료 등록합니다.`);
                    finishKeys.push(detail.TRAN_PR);
                }
                // console.log(findPolicy, nextPolicy);

            }
            console.log(finishKeys)
            if (finishKeys.length > 0) {
                logger.writeLog("info", `${finishKeys.length}개의 종료 등록된 항목을 종료 처리합니다`);
                // console.log(finishKeys.join())
                await scheduleMTSModel.setFinishArray(finishKeys);
            }
            
        } else {
            logger.writeLog("info", `${logBase} 발송할 대상이 없습니다.`);
        }
    }

}