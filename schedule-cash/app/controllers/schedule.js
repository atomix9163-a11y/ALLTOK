const logger = require("../../config/logger");
const moment = require("moment");
const scheduleModel = require("../models/schedule");
const scheduleMTSModel = require("../models/scheduleMTS");

module.exports = class scheduler {
    static async processMessage() {
        let logBase = "ALLTOK 정산 스케쥴러 (KBZ):::"
        logger.writeLog("info", `${logBase} ${moment().format("YYYY-MM-DD HH:mm:ss")} 트리거를 시작합니다================================`);        

        // 정산 처리
        let adjusts = await scheduleModel.getNotAdjust(PROCESS_MAX);
        if (adjusts && adjusts.length > 0) {
            logger.writeLog("info", `${logBase} 정산을 수행합니다.`);
            for (let adjust of adjusts) {
                // 잔액 차감 처리
                let updateBalnaceResult = await scheduleModel.updateBalance(adjust.store_code, adjust.use_amount, adjust.MSGKEYS);
                if (updateBalnaceResult) {
                    logger.writeLog("info", `${logBase} ${adjust.store_code}/${adjust.use_amount}원을 차감합니다`);
                } else {
                    logger.writeLog("error", `${logBase} ${adjust.store_code}/${adjust.use_amount}원을 차감하지 못했습니다. 잠시 후 다시 시도합니다.`);
                }
            }
        } else {
            logger.writeLog("info", `${logBase} 정산할 내역이 없습니다.`);
        }
    }

    static async processMessageMTS() {        
        let logBase = "ALLTOK 정산 스케쥴러 (MTS):::"
        logger.writeLog("info", `${logBase} ${moment().format("YYYY-MM-DD HH:mm:ss")} 트리거를 시작합니다================================`);

        // 정산 처리, MTS는 알림톡, MMS, SMS의 테이블이 분리되어 있어서, 3번에 걸쳐서 해 줘야 한다.
        const adjustSet = async (sendType) => {
            let adjusts = await scheduleMTSModel.getNotAdjust(sendType, PROCESS_MAX_MTS);
            if (adjusts && adjusts.length > 0) {
                logger.writeLog("info", `${logBase} ${sendType} 정산을 수행합니다.`);
    
                for (let adjust of adjusts) {
                    // 잔액 차감 처리
                    let updateBalnaceResult = await scheduleMTSModel.updateBalance(sendType, adjust.store_code, adjust.use_amount, adjust.TRAN_PRS);
                    if (updateBalnaceResult) {
                        logger.writeLog("info", `${logBase} ${sendType}/${adjust.store_code}/${adjust.use_amount}원을 차감합니다`);
                    } else {
                        logger.writeLog("error", `${logBase} ${sendType}/${adjust.store_code}/${adjust.use_amount}원을 차감하지 못했습니다. 잠시 후 다시 시도합니다.`);
                    }
                }
            } else {
                logger.writeLog("info", `${logBase} ${sendType}을 정산할 내역이 없습니다.`);
            }
        }

        // 알림톡
        await adjustSet("ATALK");
        await adjustSet("MMS");
        await adjustSet("SMS");        
    }
}