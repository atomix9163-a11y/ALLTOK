const logger = require("../../config/logger");
const pool = require("../../config/database");
const moment = require("moment");

module.exports = class scheduleMTSModel {
    // mts_msg_que(재발송 큐)에서 데이터를 가져온다
    // mts_msg_que 는 mts_atalk_msg_log 새로운 레코드값이 추가될 때 작동하는 트리거로부터 데이터를 받는 테이블
    //      TRAN_RSLT != 1000 (완료)
    //      조건 일 때 새로운 레코드가 추가된다
    //      따라서 TRAN_PR (새로 부여) 순서로 limit만큼 가져오면 된다. 조건 X
    //  ** mts_atalk_msg_log 가져오는 코드는 작동은 잘 하는데 데이터가 너무 커서 쿼리 인덱스에 문제가 간혹 생기며, 이 경우 쿼리 처리가 늦어져서 중복 발송되는 오류가 발생
    static async getUnfinished(limit) {
        let logBase = `models/scheduleMTSModel.getUnfinished`;
        try {
            let query = `SELECT 
                TRAN_PR,
                TRAN_ETC1 AS store_code,
                ass.data as service,
                TRAN_ETC2 as isFinish,
                TRAN_ETC3 AS reserve_code,
                TRAN_ETC4 AS unit_price,
                TRAN_PHONE AS phone,
                mmq.TRAN_TYPE,
                mmq.TRAN_STATUS,
                mmq.TRAN_RSLT,                 
                mmq.TRAN_MSG,
                TRAN_SENDDATE,
                message_JSON,
                mp_policy
            FROM 
                alltok.MTS_MSG_QUE mmq
                INNER JOIN tbl_message_history_main mhd ON mhd.reserve_code = mmq.TRAN_ETC3
                INNER JOIN tbl_message_policy ON tbl_message_policy.mp_code = mhd.mp_code
                LEFT JOIN tbl_affiliated_store_service ass ON ass.store_code = mhd.store_code
            ORDER BY
                TRAN_PR ASC
            LIMIT ${limit};`;
            const [rows, fields] = await pool.mysqlPool.query(query, []);            
            return rows;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    // alltok.mts_msg_que를 이용하는 방식으로 쿼리 변경
    // alltok.mts_msg_que에서 완료된 내역을 삭제함으로써 alltok.mts_msg_que가 커지는 것을 방지.
    // 발송 기록은 mts_atalk_msg_log에 남아있으므로 삭제해도 무방
    static async setFinishArray(TRAN_PR) {
        let logBase = `models/scheduleMTSModel.setFinishArray: TRAN_PR(${TRAN_PR.length})`
        try {
            // let query = `UPDATE tmsg_log SET ETC2 = 'Y' WHERE MSGKEY IN (${MSGKEYS})`;
            let query = `DELETE FROM alltok.MTS_MSG_QUE WHERE TRAN_PR IN (${TRAN_PR})`;

            await pool.mysqlPool.query(query, []);
            return true;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return false;
        }
    }

    // AT 발송
    // toPhones = []
    static async sendAT(senderKey, toPhone, callBack, button, templateCode, sendType, requestDate, message, storeCode, msgType, unit_price, reserveCode) {
        let logBase = `models/scheduleMTSModel.sendAT: callPhone(${callBack}), requestDate(${requestDate}), storeCode(${storeCode}), msgType(${msgType}), reserveCode(${reserveCode})`;
        const connection = await pool.mysqlPool_rcs.getConnection(async (conn) => conn);
        try {
            await connection.beginTransaction();
            
            let query = `INSERT INTO alltok.MTS_ATALK_MSG (
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
            ) VALUES (
                ?,
                ?,
                ?,
                ?,
                ?,
                '',
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?   
            )`;

            // 즉시 발송이면 현재 시간으로 변경
            if (sendType == "I") requestDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

            const [rows, fields] = await connection.query(query, [senderKey, templateCode, button, callBack, toPhone, message, new Date(), msgType, '1', 'N', '', storeCode, 'N', reserveCode, unit_price]);
            
            // 히스토리 상세 업데이트
            // query = `UPDATE tmsg_log SET ETC2 = 'Y' WHERE MSGKEY = ?`;

            // tmsg_que 재발송큐 사용으로 쿼리 변경.
            // 발송 처리를 했으므로 대상은 발송 큐에서 삭제
            // query = `DELETE FROM tmsg_que WHERE MSGKEY = ?`;
            // await connection.query(query, [MSGKEY]);
            
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

    // SMS/LMS 발송
    // toPhones = []
    static async sendSMS(toPhone, callPhone, sendType, requestDate, message, storeCode, msgType, unit_price, reserveCode) {
        let logBase = `models/scheduleMTSModel.sendSMS: callPhone(${callPhone}), sendType(${sendType}), requestDate(${requestDate}), storeCode(${storeCode}), msgType(${msgType}), reserveCode(${reserveCode})`;
        const connection = await pool.mysqlPool.getConnection(async (conn) => conn);
        try {
            await connection.beginTransaction();

            const tableName = (msgType == "SMS") ? "MTS_SMS_MSG" : "MTS_MMS_MSG"

            // 즉시 발송이면 현재 시간으로 변경
            if (sendType == "I") requestDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            // console.log(sendType, requestDate)
            
            // 메시지에 추가
            let query = `INSERT INTO alltok.${tableName} (
                TRAN_PHONE, TRAN_CALLBACK, TRAN_DATE, TRAN_MSG, TRAN_TYPE, TRAN_ETC1, TRAN_ETC2, TRAN_ETC3, TRAN_ETC4 
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ? 
            )`;
            
            const [rows, fields] = await connection.query(query, [toPhone, callPhone, requestDate, message, (msgType == "SMS" ? "0": "4"), storeCode, 'N', reserveCode, unit_price]);

            // 히스토리 상세 업데이트
            // query = `UPDATE tmsg_log SET ETC2 = 'Y' WHERE MSGKEY = ?`;

            // tmsg_que 재발송큐 사용으로 쿼리 변경.
            // 발송 처리를 했으므로 대상은 발송 큐에서 삭제
            // query = `DELETE FROM tmsg_que WHERE MSGKEY = ?`;
            // await connection.query(query, [MSGKEY]);
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