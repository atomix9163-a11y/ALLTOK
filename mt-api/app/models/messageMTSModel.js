const logger = require("../../config/logger");
const pool = require("../../config/database");
const moment = require('moment');

module.exports = class messageMTSModel {
    // toPhones = []
    static async sendAT(senderKey, toPhones, callBack, button, templateCode, sendType, requestDate, message, smsContent, storeCode, msgType, unit_price, reserveCode = "") {
        let logBase = `models/messageMTSModel.sendAT: reserveCode(${reserveCode}), sendType(${sendType}), requestDate(${requestDate}), storeCode(${storeCode}), msgType(${msgType}), sendCount(${toPhones.length})`;
        const connection = await pool.mysqlPool_mts.getConnection(async (conn) => conn);
        try {
            await connection.beginTransaction();
            
            let query = `INSERT INTO MTS_ATALK_MSG (
                TRAN_SENDER_KEY,
                TRAN_TMPL_CD,
                TRAN_BUTTON,
                TRAN_CALLBACK,
                TRAN_PHONE,
                TRAN_SUBJECT,
                TRAN_MSG,
                TRAN_DATE,
                TRAN_TYPE,
                TRAN_STATUS,
                TRAN_REPLACE_TYPE,
                TRAN_REPLACE_MSG,
                TRAN_ETC1,
                TRAN_ETC2,
                TRAN_ETC3,
                TRAN_ETC4
            ) VALUES ?`;

            const registDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            // 즉시 발송이면 현재 시간으로 변경
            if (sendType == "I") requestDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

            let tmsg_msg_list = []
            for (let toPhone of toPhones) {
                let tmsg_msg_data = [senderKey, templateCode, button, callBack, toPhone, '', message, requestDate, msgType, '1', 'N', smsContent, storeCode, 'N', reserveCode, unit_price];
                tmsg_msg_list.push(tmsg_msg_data);
            }

            const [rows, fields] = await connection.query(query, [tmsg_msg_list]);
            
            await connection.commit();
            logger.writeLog("info", `${logBase} MTS AT 발송 등록이 성공하였습니다.`);

            return true;
        } catch (error) {
            await connection.rollback();
            logger.writeLog("error", `${logBase} MTS AT 발송 등록이 실패하였습니다.\nStacktrace: ${error.stack}`);
            return false;
        } finally {
            connection.release();
        }
    }
    // toPhones = []
    static async sendFT(senderKey, client_ID, toPhones, callBack, button, image, sendType, requestDate, kkomessage, message, storeCode, msgType, unit_price, reserveCode = "") {
        let logBase = `models/messageModel.sendFT: reserveCode(${reserveCode}), sendType(${sendType}), requestDate(${requestDate}), storeCode(${storeCode}), msgType(${msgType}), sendCount(${toPhones.length})`;
        const connection = await pool.mysqlPool.getConnection(async (conn) => conn);
        try {

            await connection.beginTransaction();
            
            let query = `INSERT INTO tmsg_msg (
                MESSAGE_TYPE,
                SENDER_KEY, 
                CLIENT_ID,
                PHONE,
                MSG,
                MSG2,
                CALLBACK,
                BUTTON,
                IMAGE,
                STATUS,
                TYPE,
                AD_FLAG,
                REGDATE,
                REQDATE, 
                etc1, etc2, etc3, etc4
            ) VALUES ?;`;

            const registDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            // 즉시 발송이면 현재 시간으로 변경
            if (sendType == "I") requestDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

            let tmsg_msg_list = []
            for (let toPhone of toPhones) {
                let tmsg_msg_data = ['FT', senderKey, client_ID, toPhone, message, kkomessage, callBack, button, image, 0, '5', 'Y', registDate, requestDate, storeCode, 'N', reserveCode, unit_price];
                tmsg_msg_list.push(tmsg_msg_data);
            }
            const [rows, fields] = await connection.query(query, [tmsg_msg_list]);
            
            await connection.commit();
            logger.writeLog("info", `${logBase} ${msgType} 발송 등록이 성공하였습니다.`);

            return rows.insertId;
        } catch (error) {
            await connection.rollback();
            logger.writeLog("error", `${logBase} ${msgType} 발송 등록이 실패하였습니다.\nStacktrace: ${error.stack}`);
            return 0;
        } finally {
            connection.release();
        }
    }
    
    // toPhones = []
    static async sendSMS(toPhones, callPhone, sendType, requestDate, message, storeCode, msgType, unit_price, reserveCode = "") {
        let logBase = `models/messageMTSModel.sendSMS: reserveCode(${reserveCode}), sendType(${sendType}), requestDate(${requestDate}), storeCode(${storeCode}), msgType(${msgType}), sendCount(${toPhones.length})`;
        const connection = await pool.mysqlPool_mts.getConnection(async (conn) => conn);
        try {
            await connection.beginTransaction();            
            // 즉시 발송이면 현재 시간으로 변경
            if (sendType == "I") requestDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            
            const tableName = (msgType == "SMS") ? "MTS_SMS_MSG" : "MTS_MMS_MSG"
            // 메시지에 추가
            let query = `INSERT INTO ${tableName} (
                TRAN_PHONE, TRAN_CALLBACK, TRAN_DATE, TRAN_MSG, TRAN_TYPE, TRAN_ETC1, TRAN_ETC2, TRAN_ETC3, TRAN_ETC4 
            ) VALUES ?`;
            let mts_sms_msg_list = []
            for (let toPhone of toPhones) {
                let mts_sms_msg_data = [toPhone, callPhone, requestDate, message, (msgType == "SMS" ? "0": "4"), storeCode, 'N', reserveCode, unit_price];
                mts_sms_msg_list.push(mts_sms_msg_data);
            }
            const [rows, fields] = await connection.query(query, [mts_sms_msg_list]);

            await connection.commit(); // commit

            logger.writeLog("info", `${logBase} MTS ${msgType} 발송 등록이 성공하였습니다.`);

            return true;
        } catch (error) {
            await connection.rollback; // rollback
            logger.writeLog("error", `${logBase} MTS ${msgType} 발송 등록이 실패하였습니다.\nStacktrace: ${error.stack}`);
            return false;
        } finally {
            connection.release();
        }
    }

}