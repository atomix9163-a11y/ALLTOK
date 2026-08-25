const logger = require("../../config/logger");
const pool = require("../../config/database");
const moment = require('moment');

module.exports = class twagentModel {
    // toPhopne 받는번호, callPhone 보내는번호, subject 제목, templateCode 템플릿코드, rejectPhone 080수신거부, message 메시지, url 버튼연결url, displayText 표시문자
    // RCSSMS는 1개의 버튼만 가능
    static async sendRCS(toPhone, callPhone, subject, requestDate, message, message_instead, storeCode, msgType, unit_price, reserveCode = "") {
        let logBase = `models/twagentModel.sendRCS: toPhopne(${toPhopne}), callPhone(${callPhone}), requestDate(${requestDate}), storeCode(${storeCode}), msgType(${msgType}), reserveCode(${reserveCode})`;
        const connection = await pool.mysqlPool_rcs.getConnection(async (conn) => conn);
        try {
            await connection.beginTransaction();
            // logger.writeLog("info", `${logBase}`);
            let sendType = (msgType == "RCSSMS" || msgType == "RCSLMS") ? "3" : (msgType == "SMS" || msgType == "LMS") ? "1" : "2";
            
            // 메시지에 추가
            let query = `INSERT INTO tmsg_msg (
                subject, phone, callback, status, reqdate, msg, type, msg2, etc1, etc2, etc3, etc4
            ) VALUES ( 			   		
               ?, 
               ?, 
               ?, 
               '0', 
               ?, 
               ?, 
               ?, 
               ?,
               ?,
               ?,
               ?,
               ?
            );`;
            const [rows, fields] = await connection.query(query, [subject, toPhone, callPhone, requestDate, message_instead, sendType, message, storeCode, msgType, reserveCode, unit_price]);

            await connection.commit(); // commit

            return rows.insertId;
        } catch (error) {
            await connection.rollback; // rollback
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return 0;
        } finally {
            connection.release();
        }
    }

    // toPhones = []
    static async sendRCS_big(toPhones, callPhone, subject, sendType, requestDate, message, message_instead, storeCode, msgType, unit_price, reserveCode = "") {
        let logBase = `models/twagentModel.sendRCS_big: callPhone(${callPhone}), sendType(${sendType}), requestDate(${requestDate}), storeCode(${storeCode}), msgType(${msgType}), reserveCode(${reserveCode})`;
        const connection = await pool.mysqlPool_rcs.getConnection(async (conn) => conn);
        try {
            await connection.beginTransaction();
            // logger.writeLog("info", `${logBase}`);
            let sendMethod = (msgType == "RCSSMS" || msgType == "RCSLMS") ? "3" : (msgType == "SMS" || msgType == "LMS") ? "1" : "2";
            // 즉시 발송이면 현재 시간으로 변경
            if (sendType == "I") requestDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            
            // 메시지에 추가
            let query = `INSERT INTO tmsg_msg (
                subject, phone, callback, status, reqdate, msg, type, msg2, etc1, etc2, etc3, etc4
            ) VALUES ?`;
            let tmsg_msg_list = []
            for (let toPhone of toPhones) {
                // let tmsg_msg_data = [subject, toPhone, callPhone, 0, requestDate, message_instead, sendMethod, message, storeCode, msgType, reserveCode, unit_price];
                let tmsg_msg_data = [subject, toPhone, callPhone, 0, requestDate, message_instead, sendMethod, message, storeCode, 'N', reserveCode, unit_price];
                tmsg_msg_list.push(tmsg_msg_data);
            }
            // console.log(tmsg_msg_list)
            const [rows, fields] = await connection.query(query, [tmsg_msg_list]);

            await connection.commit(); // commit

            return true;
        } catch (error) {
            await connection.rollback; // rollback
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return false;
        } finally {
            connection.release();
        }
    }
    // senderKey, client_ID, toPhopne, callBack, button, templateCode, requestDate, message, storeCode, msgType, unit_price, reserveCode
    static async sendAT(senderKey, client_ID, toPhopne, callBack, button, templateCode, requestDate, message, storeCode, msgType, unit_price, reserveCode = "") {
        let logBase = `models/twagentModel.sendAT: toPhopne(${toPhopne}), callPhone(${callBack}), requestDate(${requestDate}), storeCode(${storeCode}), msgType(${msgType}), reserveCode(${reserveCode})`;
        const connection = await pool.mysqlPool_rcs.getConnection(async (conn) => conn);
        try {
            await connection.beginTransaction();
            
            let query = `INSERT INTO tmsg_msg (
                MESSAGE_TYPE, SENDER_KEY, CLIENT_ID, PHONE, MSG2, CALLBACK, BUTTON, TMPLCD, STATUS, TYPE, REGDATE, REQDATE, etc1, etc2, etc3, etc4
            ) VALUES ( 			   		
                'AT', ?, ?, ?, ?, ?, ?, ?, '0', '5', NOW(), ?, ?, ?, ?, ?
            );`;

            const [rows, fields] = await connection.query(query, [senderKey, client_ID, toPhopne, message, callBack, button, templateCode, requestDate, storeCode, msgType, reserveCode, unit_price]);           
            
            await connection.commit();
            return rows.insertId;
        } catch (error) {
            await connection.rollback();
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return 0;
        } finally {
            connection.release();
        }
    }

    // toPhones = []
    static async sendAT_big(senderKey, client_ID, toPhones, callBack, button, templateCode, sendType, requestDate, message, smsContent, storeCode, msgType, unit_price, reserveCode = "") {
        let logBase = `models/twagentModel.sendAT_big: senderKey(${senderKey}), client_ID(${client_ID}), callPhone(${callBack}), requestDate(${requestDate}), storeCode(${storeCode}), msgType(${msgType}), reserveCode(${reserveCode})`;
        const connection = await pool.mysqlPool_rcs.getConnection(async (conn) => conn);
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
                // let tmsg_msg_data = ['AT', senderKey, client_ID, toPhone, smsContent, message, callBack, button, templateCode, '0', '5', registDate, requestDate, storeCode, msgType, reserveCode, unit_price];
                let tmsg_msg_data = [msgType, senderKey, client_ID, toPhone, smsContent, message, callBack, button, templateCode, '0', '5', registDate, requestDate, storeCode, 'N', reserveCode, unit_price];
                tmsg_msg_list.push(tmsg_msg_data);
            }

            const [rows, fields] = await connection.query(query, [tmsg_msg_list]);
            
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return false;
        } finally {
            connection.release();
        }
    }

    // 친구(채널톡)
    static async sendFT(senderKey, client_ID, toPhone, callBack, button, image, requestDate, kkomessage, message, storeCode, msgType, unit_price, reserveCode = "") {
        let logBase = `models/twagentModel.sendAT: toPhone(${toPhone}), callPhone(${callBack}), requestDate(${requestDate}), storeCode(${storeCode}), msgType(${msgType}), reserveCode(${reserveCode})`;
        const connection = await pool.mysqlPool_rcs.getConnection(async (conn) => conn);
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
            ) VALUES ( 			   		
                'FT', 
                ?, 
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                0,
                '5',
                'Y', 
                NOW(), ?, ?, ?, ?, ?
            );`;

            const [rows, fields] = await connection.query(query, [senderKey, client_ID, toPhone, message, kkomessage, callBack, button, image, requestDate, storeCode, msgType, reserveCode, unit_price]);
            
            await connection.commit();
            return rows.insertId;
        } catch (error) {
            await connection.rollback();
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return 0;
        } finally {
            connection.release();
        }
    }

    // toPhones = []
    static async sendFT_big(senderKey, client_ID, toPhones, callBack, button, image, sendType, requestDate, kkomessage, message, storeCode, msgType, unit_price, reserveCode = "") {
        let logBase = `models/twagentModel.sendFT_big: callPhone(${callBack}), requestDate(${requestDate}), storeCode(${storeCode}), msgType(${msgType}), reserveCode(${reserveCode})`;
        const connection = await pool.mysqlPool_rcs.getConnection(async (conn) => conn);
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
                // let tmsg_msg_data = ['FT', senderKey, client_ID, toPhone, message, kkomessage, callBack, button, image, 0, '5', 'Y', registDate, requestDate, storeCode, msgType, reserveCode, unit_price];
                let tmsg_msg_data = ['FT', senderKey, client_ID, toPhone, message, kkomessage, callBack, button, image, 0, '5', 'Y', registDate, requestDate, storeCode, 'N', reserveCode, unit_price];
                tmsg_msg_list.push(tmsg_msg_data);
            }
            const [rows, fields] = await connection.query(query, [tmsg_msg_list]);
            
            // 히스토리 상세에 추가
            // query = `INSERT INTO tbl_message_history_details (
            //     store_code,
            //     reserve_code,
            //     phone,
            //     STATUS,
            //     RSLT,
            //     original_TYPE,
            //     original_TYPE_sub,                
            //     REQDATE,
            //     is_finish
            // ) VALUES ?`;

            // let tbl_message_history_details_list = []
            // for (let toPhone of toPhones) {
            //     let tbl_message_history_details_data = [storeCode, reserveCode, toPhone, '0', '00', '5', 'FT', requestDate, 'N'];
            //     tbl_message_history_details_list.push(tbl_message_history_details_data);
            // }
            // await connection.query(query, [tbl_message_history_details_list]);
            
            await connection.commit();
            return rows.insertId;
        } catch (error) {
            await connection.rollback();
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return 0;
        } finally {
            connection.release();
        }
    }

    // toPhones = []
    static async sendSMS_big(toPhones, callPhone, sendType, requestDate, message, storeCode, msgType, unit_price, reserveCode = "") {
        let logBase = `models/twagentModel.sendSMS_big: callPhone(${callPhone}), sendType(${sendType}), requestDate(${requestDate}), storeCode(${storeCode}), msgType(${msgType}), reserveCode(${reserveCode})`;
        const connection = await pool.mysqlPool_rcs.getConnection(async (conn) => conn);
        try {
            await connection.beginTransaction();
            // logger.writeLog("info", `${logBase}`);
            let sendMethod = (msgType == "SMS") ? "1" : "2";
            // 즉시 발송이면 현재 시간으로 변경
            if (sendType == "I") requestDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            
            // 메시지에 추가
            let query = `INSERT INTO tmsg_msg (
                phone, callback, status, reqdate, msg, type, etc1, etc2, etc3, etc4
            ) VALUES ?`;
            let tmsg_msg_list = []
            for (let toPhone of toPhones) {
                // let tmsg_msg_data = [toPhone, callPhone, 0, requestDate, message, sendMethod, storeCode, msgType, reserveCode, unit_price];
                let tmsg_msg_data = [toPhone, callPhone, 0, requestDate, message, sendMethod, storeCode, 'N', reserveCode, unit_price];
                tmsg_msg_list.push(tmsg_msg_data);
            }
            // console.log(tmsg_msg_list)
            const [rows, fields] = await connection.query(query, [tmsg_msg_list]);

            // 히스토리 상세에 추가
            // query = `INSERT INTO tbl_message_history_details (
            //     store_code,
            //     reserve_code,
            //     phone,
            //     STATUS,
            //     RSLT,
            //     original_TYPE,
            //     original_TYPE_sub,                
            //     REQDATE,
            //     is_finish
            // ) VALUES ?`;

            // let tbl_message_history_details_list = []
            // for (let toPhone of toPhones) {
            //     let tbl_message_history_details_data = [storeCode, reserveCode, toPhone, '0', '00', sendMethod, msgType, requestDate, 'N'];
            //     tbl_message_history_details_list.push(tbl_message_history_details_data);
            // }

            // await connection.query(query, [tbl_message_history_details_list]);
            await connection.commit(); // commit

            return true;
        } catch (error) {
            await connection.rollback; // rollback
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return false;
        } finally {
            connection.release();
        }
    }
}
