const logger = require("../../config/logger");
const pool = require("../../config/database");
const moment = require("moment");

module.exports = class scheduleModel {

    // msg_log로부터 미처리 데이터 얻기
    // static async getUnfinished(limit) {
    //     let logBase = `models/scheduleModel.getUnfinished`;
    //     try {
    //         // 처리가 끝난 로그 (status=3) 발송이 실패(RSLT != 0)인 경우
    //         // 모두 실패했으나 더 이상 후속 발송이 없는 경우 is_finish='Y'로 세팅해야 한다
    //         // TYPE = 1 or 2 는 대상에서 제외
    //         let query = `SELECT 
    //             MSGKEY,
    //             ETC1 AS store_code,
    //             ass.data as service,
    //             ETC2 as isFinish,
    //             ETC3 AS reserve_code,
    //             ETC4 AS unit_price,
    //             PHONE AS phone,
    //             tmsg_log.TYPE,
    //             tmsg_log.STATUS,
    //             tmsg_log.RSLT, 
    //             tmsg_log.RSLT2,
    //             tmsg_log.MSG2,
    //             REQDATE,
    //             MESSAGE_TYPE,
    //             message_JSON,
    //             mp_policy
    //         FROM 
    //             tmsg_log
    //             INNER JOIN tbl_message_history_main mhd ON mhd.reserve_code = tmsg_log.ETC3
    //             INNER JOIN tbl_message_policy ON tbl_message_policy.mp_code = mhd.mp_code
    //             LEFT JOIN tbl_affiliated_store_service ass ON ass.store_code = mhd.store_code
    //         WHERE
    //             ((TYPE = 5 AND CAST(rslt as unsigned) != 0) 
    //                 OR (TYPE = 3 AND CAST(rslt as unsigned) = 0 AND CAST(rslt2 as unsigned) != 0))
    //             AND ETC2 = 'N'
    //         LIMIT ${limit};`;

    //         const [rows, fields] = await pool.mysqlPool.query(query, []);            
    //         return rows;
    //     } catch (error) {
    //         logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
    //         return null;
    //     }
    // }

    // tmsg_que(재발송 큐)에서 데이터를 가져온다
    // tmsg_que 는 tmsg_log에 새로운 레코드값이 추가될 때 작동하는 트리거로부터 데이터를 받는 테이블
    //      ((NEW.TYPE = 5 AND CAST(NEW.rslt as unsigned) != 0) OR (NEW.TYPE = 3 AND CAST(NEW.rslt as unsigned) = 0 AND CAST(NEW.rslt2 as unsigned) != 0))
    //      조건 일 때 새로운 레코드가 추가된다
    //      따라서 MSGKEY (새로 부여) 순서로 limit만큼 가져오면 된다. 조건 X
    //  ** tmsg_log에서 가져오는 코드는 작동은 잘 하는데 데이터가 너무 커서 쿼리 인덱스에 문제가 간혹 생기며, 이 경우 쿼리 처리가 늦어져서 중복 발송되는 오류가 발생
    static async getUnfinished(limit) {
        let logBase = `models/scheduleModel.getUnfinished`;
        try {
            let query = `SELECT 
                MSGKEY,
                ETC1 AS store_code,
                ass.data as service,
                ETC2 as isFinish,
                ETC3 AS reserve_code,
                ETC4 AS unit_price,
                PHONE AS phone,
                tq.TYPE,
                tq.STATUS,
                tq.RSLT, 
                tq.RSLT2,
                tq.MSG2,
                REQDATE,
                MESSAGE_TYPE,
                message_JSON,
                mp_policy
            FROM 
                tmsg_que tq
                INNER JOIN tbl_message_history_main mhd ON mhd.reserve_code = tq.ETC3
                INNER JOIN tbl_message_policy ON tbl_message_policy.mp_code = mhd.mp_code
                LEFT JOIN tbl_affiliated_store_service ass ON ass.store_code = mhd.store_code
            ORDER BY
                MSGKEY ASC
            LIMIT ${limit};`;
            const [rows, fields] = await pool.mysqlPool.query(query, []);            
            return rows;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    // history detail로부터 미처리 데이터 얻기
    // static async getHistoryDetails(limit) {
    //     let logBase = `models/scheduleModel.getHistoryDetails`;
    //     try {
    //         // 상세 항목 중 발송 후 결과가 리턴(STATUS = 3)되었으나 발송이 실패(RSLT != 0)인 경우, 그리고 종료가 안된 경우(is_finish='N')의 리스트를 얻는다
    //         // 모두 실패했으나 더 이상 후속 발송이 없는 경우 is_finish='Y'로 세팅해야 한다
    //         let query = `SELECT 
    //             mhd.store_code,
    //             ass.data as service,
    //             mhd.reserve_code,
    //             phone,
    //             original_TYPE,
    //             original_TYPE_sub,
    //             request_time,
    //             reserve_time,
    //             message_JSON,
    //             mp_policy
    //         FROM 
    //             tbl_message_history_details mhd
    //             INNER JOIN tbl_message_history_main mhm ON mhm.reserve_code = mhd.reserve_code
    //             INNER JOIN tbl_message_policy mp ON mp.mp_code = mhm.mp_code
    //             LEFT JOIN tbl_affiliated_store_service ass ON ass.store_code = mhd.store_code
    //         WHERE 
    //             mhd.STATUS = 3 AND 
    //             mhd.is_finish='N' AND
    //             ((original_TYPE IN (1, 2, 5) AND CAST(mhd.RSLT as unsigned) != 0) OR 
    //             (original_TYPE = 3) AND CAST(mhd.RSLT2 as unsigned) != 0)                
    //         LIMIT ${limit};`;
    //         const [rows, fields] = await pool.mysqlPool.query(query, []);            
    //         return rows;
    //     } catch (error) {
    //         logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
    //         return null;
    //     }
    // }

    // static async setFinish(reserve_code, phone) {
    //     let logBase = `models/scheduleModel.setFinish: reserve_code(${reserve_code}), phone(${phone})`
    //     try {
    //         let query = `UPDATE tmsg_log SET ETC2 = 'Y' WHERE ETC3 = ? AND PHONE = ?`;

    //         await pool.mysqlPool.query(query, [reserve_code, phone]);
    //         return true;
    //     } catch (error) {
    //         logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
    //         return false;
    //     }
    // }

    // tmsg_que를 이용하는 방식으로 쿼리 변경
    // tmsg_que에서 완료된 내역을 삭제함으로써 tmsg_que가 커지는 것을 방지.
    // 발송 기록은 tmsg_log에 남아있으므로 삭제해도 무방
    static async setFinishArray(MSGKEYS) {
        let logBase = `models/scheduleModel.setFinishArray: MSGKEYS(${MSGKEYS.length})`
        try {
            // let query = `UPDATE tmsg_log SET ETC2 = 'Y' WHERE MSGKEY IN (${MSGKEYS})`;
            let query = `DELETE FROM tmsg_que WHERE MSGKEY IN (${MSGKEYS})`;

            await pool.mysqlPool.query(query, []);
            return true;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return false;
        }
    }

    // static async updateHistoryDetails(reserve_code, phone, original_TYPE, original_TYPE_sub) {
    //     let logBase = `models/scheduleModel.setFinish: reserve_code(${reserve_code}), phone(${phone})`
    //     try {
    //         let query = `UPDATE tbl_message_history_details SET 
    //             original_TYPE = ?,  original_TYPE_sub = ?
    //         WHERE 
    //             reserve_code = ? AND phone = ?`;

    //         await pool.mysqlPool.query(query, [reserve_code, phone, original_TYPE, original_TYPE_sub]);
    //         return true;
    //     } catch (error) {
    //         logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
    //         return false;
    //     }
    // }

    // AT 발송
    // toPhones = []
    static async sendAT(MSGKEY, senderKey, client_ID, toPhone, callBack, button, templateCode, sendType, requestDate, message, smsContent, storeCode, msgType, unit_price, reserveCode) {
        let logBase = `models/twagentModel.sendAT_big: callPhone(${callBack}), requestDate(${requestDate}), storeCode(${storeCode}), msgType(${msgType}), reserveCode(${reserveCode})`;
        const connection = await pool.mysqlPool_rcs.getConnection(async (conn) => conn);
        try {
            await connection.beginTransaction();
            
            let query = `INSERT INTO tmsg_msg (
                MESSAGE_TYPE, SENDER_KEY, CLIENT_ID, PHONE, MSG, MSG2, CALLBACK, BUTTON, TMPLCD, STATUS, TYPE, REGDATE, REQDATE, etc1, etc2, etc3, etc4
            ) VALUES (
                'AT', ?, ?, ?, ?, ?, ?, ?, ?, 0, '5', NOW(), ?, ?, ?, ?, ?
            )`;

            // 즉시 발송이면 현재 시간으로 변경
            if (sendType == "I") requestDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

            const [rows, fields] = await connection.query(query, [senderKey, client_ID, toPhone, smsContent, message, callBack, button, templateCode, requestDate, storeCode, 'N', reserveCode, unit_price]);
            
            // 히스토리 상세 업데이트
            // query = `UPDATE tmsg_log SET ETC2 = 'Y' WHERE MSGKEY = ?`;

            // tmsg_que 재발송큐 사용으로 쿼리 변경.
            // 발송 처리를 했으므로 대상은 발송 큐에서 삭제
            query = `DELETE FROM tmsg_que WHERE MSGKEY = ?`;
            await connection.query(query, [MSGKEY]);
            
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

    // FT 발송
    // toPhones = []
    static async sendFT(MSGKEY, senderKey, client_ID, toPhone, callBack, button, image, sendType, requestDate, kkomessage, message, storeCode, msgType, unit_price, reserveCode = "") {
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
                5,
                'Y',
                NOW(),
                ?, 
                ?, 
                ?, 
                ?, 
                ?
            );`;

            const registDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            // 즉시 발송이면 현재 시간으로 변경
            if (sendType == "I") requestDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

            const [rows, fields] = await connection.query(query, [senderKey, client_ID, toPhone, message, kkomessage, callBack, button, image, requestDate, storeCode, 'N', reserveCode, unit_price]);
            
            // 히스토리 상세 업데이트
            // query = `UPDATE tmsg_log SET ETC2 = 'Y' WHERE MSGKEY = ?`;

            // tmsg_que 재발송큐 사용으로 쿼리 변경.
            // 발송 처리를 했으므로 대상은 발송 큐에서 삭제
            query = `DELETE FROM tmsg_que WHERE MSGKEY = ?`;
            await connection.query(query, [MSGKEY]);
            
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
    
    // RCS LMS/SMS 발송
    // toPhones = []
    static async sendRCS(MSGKEY, toPhone, callPhone, subject, sendType, requestDate, message, message_instead, storeCode, msgType, unit_price, reserveCode) {
        let logBase = `models/twagentModel.sendRCS: callPhone(${callPhone}), sendType(${sendType}), requestDate(${requestDate}), storeCode(${storeCode}), msgType(${msgType}), reserveCode(${reserveCode})`;
        const connection = await pool.mysqlPool.getConnection(async (conn) => conn);
        try {
            await connection.beginTransaction();
            // logger.writeLog("info", `${logBase}`);
            let sendMethod = (msgType == "RCSSMS" || msgType == "RCSLMS") ? "3" : (msgType == "SMS" || msgType == "LMS") ? "1" : "2";
            // 즉시 발송이면 현재 시간으로 변경
            if (sendType == "I") requestDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            
            // 메시지에 추가
            let query = `INSERT INTO tmsg_msg (
                subject, phone, callback, status, reqdate, msg, type, msg2, etc1, etc2, etc3, etc4
            ) VALUES (
                ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?
            )`;
            const [rows, fields] = await connection.query(query, [subject, toPhone, callPhone, requestDate, message_instead, sendMethod, message, storeCode, 'N', reserveCode, unit_price]);

            // 히스토리 상세 업데이트
            // query = `UPDATE tmsg_log SET ETC2 = 'Y' WHERE MSGKEY = ?`;
            // tmsg_que 재발송큐 사용으로 쿼리 변경.
            // 발송 처리를 했으므로 대상은 발송 큐에서 삭제
            query = `DELETE FROM tmsg_que WHERE MSGKEY = ?`;
            await connection.query(query, [MSGKEY]);
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

    // SMS/LMS 발송
    // toPhones = []
    static async sendSMS(MSGKEY, toPhone, callPhone, sendType, requestDate, message, storeCode, msgType, unit_price, reserveCode) {
        let logBase = `models/scheduleModel.sendSMS: callPhone(${callPhone}), sendType(${sendType}), requestDate(${requestDate}), storeCode(${storeCode}), msgType(${msgType}), reserveCode(${reserveCode})`;
        const connection = await pool.mysqlPool.getConnection(async (conn) => conn);
        try {
            await connection.beginTransaction();
            // logger.writeLog("info", `${logBase}`);
            let sendMethod = (msgType == "SMS") ? "1" : "2";
            // 즉시 발송이면 현재 시간으로 변경
            if (sendType == "I") requestDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            // console.log(sendType, requestDate)
            
            // 메시지에 추가
            let query = `INSERT INTO tmsg_msg (
                phone, callback, status, reqdate, msg, type, etc1, etc2, etc3, etc4
            ) VALUES (
                ?, ?, 0, ?, ?, ?, ?, ?, ?, ?                
            )`;
            
            const [rows, fields] = await connection.query(query, [toPhone, callPhone, requestDate, message, sendMethod, storeCode, 'N', reserveCode, unit_price]);

            // 히스토리 상세 업데이트
            // query = `UPDATE tmsg_log SET ETC2 = 'Y' WHERE MSGKEY = ?`;

            // tmsg_que 재발송큐 사용으로 쿼리 변경.
            // 발송 처리를 했으므로 대상은 발송 큐에서 삭제
            query = `DELETE FROM tmsg_que WHERE MSGKEY = ?`;
            await connection.query(query, [MSGKEY]);
            await connection.commit(); // commit

            return true;
        } catch (error) {
            connection.rollback; // rollback
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return false;
        } finally {
            connection.release();
        }
    }
}