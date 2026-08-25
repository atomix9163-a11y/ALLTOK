const logger = require("../../config/logger");
const pool = require("../../config/database");
const moment = require('moment');

module.exports = class messageModel {
    static async getMessageProcess(mpCode) {
        let logBase = `models/messageModel.getMessageProcess: mpCode(${mpCode})`
        try {
            let query = `
            SELECT 
                seq,
                mp_code,
                mp_policy
            FROM 
                tbl_message_policy
            WHERE
                mp_code = ?`;

            const [rows, fields] = await pool.mysqlPool.query(query, [mpCode]);
            if (rows.length > 0) {
                let mpInfo = rows[0];
                mpInfo.process = JSON.parse(mpInfo.mp_policy)
                return mpInfo;
            } else {
                return [];
            }
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return [];
        }
    }
    
    static async listMessageProcess() {
        let logBase = `models/customerModel.listMessageProcess`
        try {
            let query = `
            SELECT 
                seq,
                mp_code,
                mp_policy
            FROM 
                tbl_message_policy
            ORDER BY
                mp_code
            `;

            const [rows, fields] = await pool.mysqlPool.query(query, [store_code]);
            if (rows.length > 0) {
                // logger.writeLog("info", `${logBase} - ${rows.length} rows return`);
                return rows;
            } else {
                // logger.writeLog("info", `${logBase} - No data found`);
                return rows;
            }

        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    // toPhones = []
    static async sendRCS(toPhones, callPhone, subject, sendType, requestDate, message, message_instead, storeCode, msgType, unit_price, reserveCode = "") {
        let logBase = `models/messageModel.sendRCS: reserveCode(${reserveCode}), sendType(${sendType}), requestDate(${requestDate}), storeCode(${storeCode}), msgType(${msgType}), sendCount(${toPhones.length})`;
        const connection = await pool.mysqlPool.getConnection(async (conn) => conn);
        try {
            await connection.beginTransaction();
            let sendMethod = (msgType == "RCSSMS" || msgType == "RCSLMS") ? "3" : (msgType == "SMS" || msgType == "LMS") ? "1" : "2";
            // 즉시 발송이면 현재 시간으로 변경
            if (sendType == "I") requestDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            
            // 메시지에 추가
            let query = `INSERT INTO tmsg_msg (
                subject, phone, callback, status, reqdate, msg, type, msg2, etc1, etc2, etc3, etc4
            ) VALUES ?`;
            let tmsg_msg_list = []
            for (let toPhone of toPhones) {
                let tmsg_msg_data = [subject, toPhone, callPhone, 0, requestDate, message_instead, sendMethod, message, storeCode, 'N', reserveCode, unit_price];
                tmsg_msg_list.push(tmsg_msg_data);
            }
            const [rows, fields] = await connection.query(query, [tmsg_msg_list]);

            await connection.commit(); // commit
            logger.writeLog("info", `${logBase} ${msgType} 발송 등록이 성공하였습니다.`);

            return true;
        } catch (error) {
            await connection.rollback; // rollback
            logger.writeLog("error", `${logBase} ${msgType} 발송 등록이 실패하였습니다.\nStacktrace: ${error.stack}`);

            return false;
        } finally {
            connection.release();
        }
    }
    // toPhones = []
    static async sendAT(senderKey, client_ID, toPhones, callBack, button, templateCode, sendType, requestDate, message, smsContent, storeCode, msgType, unit_price, reserveCode = "") {
        let logBase = `models/messageModel.sendAT: reserveCode(${reserveCode}), sendType(${sendType}), requestDate(${requestDate}), storeCode(${storeCode}), msgType(${msgType}), sendCount(${toPhones.length})`;
        const connection = await pool.mysqlPool.getConnection(async (conn) => conn);
        try {
            await connection.beginTransaction();
            
            let query = `INSERT INTO tmsg_msg (
                MESSAGE_TYPE, SENDER_KEY, CLIENT_ID, PHONE, MSG, MSG2, CALLBACK, BUTTON, TMPLCD, STATUS, TYPE, REGDATE, REQDATE, etc1, etc2, etc3, etc4
            ) VALUES ?`;

            const registDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            // 즉시 발송이면 현재 시간으로 변경
            if (sendType == "I") requestDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

            let tmsg_msg_list = []
            for (let toPhone of toPhones) {
                let tmsg_msg_data = [msgType, senderKey, client_ID, toPhone, smsContent, message, callBack, button, templateCode, '0', '5', registDate, requestDate, storeCode, 'N', reserveCode, unit_price];
                tmsg_msg_list.push(tmsg_msg_data);
            }

            const [rows, fields] = await connection.query(query, [tmsg_msg_list]);
            
            await connection.commit();
            logger.writeLog("info", `${logBase} ${msgType} 발송 등록이 성공하였습니다.`);

            return true;
        } catch (error) {
            await connection.rollback();
            logger.writeLog("error", `${logBase} ${msgType} 발송 등록이 실패하였습니다.\nStacktrace: ${error.stack}`);
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
        let logBase = `models/messageModel.sendSMS: reserveCode(${reserveCode}), sendType(${sendType}), requestDate(${requestDate}), storeCode(${storeCode}), msgType(${msgType}), sendCount(${toPhones.length})`;
        const connection = await pool.mysqlPool.getConnection(async (conn) => conn);
        try {
            await connection.beginTransaction();
            let sendMethod = (msgType == "SMS") ? "1" : "2";
            // 즉시 발송이면 현재 시간으로 변경
            if (sendType == "I") requestDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            
            // 메시지에 추가
            let query = `INSERT INTO tmsg_msg (
                phone, callback, status, reqdate, msg, type, etc1, etc2, etc3, etc4
            ) VALUES ?`;
            let tmsg_msg_list = []
            for (let toPhone of toPhones) {
                let tmsg_msg_data = [toPhone, callPhone, 0, requestDate, message, sendMethod, storeCode, 'N', reserveCode, unit_price];
                tmsg_msg_list.push(tmsg_msg_data);
            }
            const [rows, fields] = await connection.query(query, [tmsg_msg_list]);

            await connection.commit(); // commit

            logger.writeLog("info", `${logBase} ${msgType} 발송 등록이 성공하였습니다.`);

            return true;
        } catch (error) {
            await connection.rollback; // rollback
            logger.writeLog("error", `${logBase} ${msgType} 발송 등록이 실패하였습니다.\nStacktrace: ${error.stack}`);
            return false;
        } finally {
            connection.release();
        }
    }

    static async saveMessageSendHistory(storeCode, sendType, msgType, targetGroups, msgData) {
        let logBase = `models/messageModel.saveMessageSendHistory: storeCode(${storeCode}), sendType(${sendType}), msgType(${msgType}), targetGroups(${targetGroups})`;
        try {           
            let query = `INSERT INTO tbl_message_send_history (
                store_code,
                send_type, 
                msg_type,
                target_groups,
                msg_data,
                C_TIME
            ) VALUES (
                ?,
                ?, 
                ?,
                ?,
                ?,
                ?
            )`;

            const [rows] = await pool.mysqlPool.query(query, [storeCode, sendType, msgType, targetGroups, msgData, new Date()]);

            logger.writeLog("info", `${logBase} 발송 내역이 기록되었습니다.`);
            return rows.insertId;
        } catch (error) {
            logger.writeLog("error", `${logBase} 발송 등록이 실패하였습니다.\nStacktrace: ${error.stack}`);
            return 0;
        }
    }

    // 2분 이내에 발송 기록이 있는지 체크
    static async getMessageSendHistory(storeCode, sendType, msgType, targetGroups) {
        let logBase = `models/messageModel.getMessageSendHistory: storeCode(${storeCode}), sendType(${sendType}), msgType(${msgType}), targetGroups(${targetGroups})`;
        try {           
            // let query = `SELECT msg_data FROM tbl_message_send_history WHERE 
            //     store_code = ? AND
            //     send_type = ? AND
            //     msg_type = ? AND
            //     target_groups = ? AND
            //     DATE_FORMAT(C_TIME, '%Y%m%d') = ?
            // `;

            let query = `SELECT msg_data FROM tbl_message_send_history WHERE 
                store_code = ? AND
                send_type = ? AND
                msg_type = ? AND
                target_groups = ? AND
                ? BETWEEN C_TIME AND DATE_ADD(C_TIME, INTERVAL 2 MINUTE);
            `;

            const [rows] = await pool.mysqlPool.query(query, [storeCode, sendType, msgType, targetGroups, new Date()]);

            logger.writeLog("info", `${logBase} 2분 이내에 발송 기록이 있는지 발송 내역을 검색하여 ${rows.length} 건을 찾았습니다`);
            return rows;
        } catch (error) {
            logger.writeLog("error", `${logBase} 2분 이내에 발송 기록이 있는지 발송 내역을 검색할 때 오류가 발생했습니다.\nStacktrace: ${error.stack}`);
            return null;
        }
    }

    // 당일 발송 기록이 있는지 체크
    static async getMessageSendHistoryDay(storeCode, sendType, msgType, targetGroups) {
        let logBase = `models/messageModel.getMessageSendHistory: storeCode(${storeCode}), sendType(${sendType}), msgType(${msgType}), targetGroups(${targetGroups})`;
        try {           
            let query = `SELECT msg_data FROM tbl_message_send_history WHERE 
                store_code = ? AND
                send_type = ? AND
                msg_type = ? AND
                target_groups = ? AND
                DATE_FORMAT(C_TIME, '%Y%m%d') = ?
            `;

            const [rows] = await pool.mysqlPool.query(query, [storeCode, sendType, msgType, targetGroups, moment().format("YYYYMMDD")]);

            logger.writeLog("info", `${logBase} 금일 발송 내역을 검색하여 ${rows.length} 건을 찾았습니다`);
            return rows;
        } catch (error) {
            logger.writeLog("error", `${logBase} 금일 발송 내역을 검색할 때 오류가 발생했습니다.\nStacktrace: ${error.stack}`);
            return null;
        }

    }
}