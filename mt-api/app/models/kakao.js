const logger = require("../../config/logger");
const pool = require("../../config/database");

module.exports = class kakaoModel {
    // toPhopne 받는번호, callPhone 보내는번호, subject 제목, templateCode 템플릿코드, rejectPhone 080수신거부, message 메시지, url 버튼연결url, displayText 표시문자
    // RCSSMS는 1개의 버튼만 가능
    static async sendKakao(toPhopne, callPhone, subject, requestDate, message, message_instead, storeCode, msgType, unit_price, reserveCode = "") {
        let logBase = `models/rcsModel.sendRCS: toPhopne(${toPhopne}), callPhone(${callPhone}), requestDate(${requestDate}), storeCode(${storeCode}), msgType(${msgType}), reserveCode(${reserveCode})`;
        try {
            
            let query = `INSERT INTO tmsg_msg (
                MESSAGE_TYPE, SENDER_KEY, CLIENT_ID, PHONE, MSG2, CALLBACK, BUTTON, TMPLCD, STATUS, TYPE, REGDATE, REQDATE
            ) VALUES ( 			   		
               ?, 
               ?, 
               ?, 
               '0', 
               ?, 
               ?, 
               '3', 
               ?,
               ?,
               ?,
               ?,
               ?
            );`;

            const [rows, fields] = await pool.mysqlPool_rcs.query(query, [subject, toPhopne, callPhone, requestDate, message_instead, message, storeCode, msgType, reserveCode, unit_price]);
            return rows.insertId;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return 0;
        }
    }

    static async listProfile(status, page, rowCount) {
        let logBase = `models/rcsModel.sendRCS: toPhopne(${toPhopne}), callPhone(${callPhone}), requestDate(${requestDate}), storeCode(${storeCode}), msgType(${msgType}), reserveCode(${reserveCode})`;
        try {
            let countQuery = `SELECT COUNT(seq) AS TOTAL_COUNT FROM tbl_kko_profile WHERE status = ? `;

            let query = `SELECT
                A.seq,
                A.store_code,
                B.name,
                profile_key,
                status,
                A.C_ID,
                A.C_TIME,
                A.M_ID,
                A.M_TIME
            FROM
                tbl_kko_profile A
                INNER JOIN tbl_affiliated_store_main B ON B.store_code = A.store_code
            WHERE
                status = ? 
            ORDER BY
                B.Name ASC
            LIMIT 
                ${rowCount} OFFSET ${(page - 1) * rowCount}`;

            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, [status]);
            const [rows, fields] = await pool.mysqlPool.query(query, [status]);
            return {
                count: rowsCount[0].TOTAL_COUNT,
                rows: rows,
            };
        } catch (error) {
            logger.writeLog("error", `${logBase} == listProfile failure ==\nStacktrace: ${error.stack}`);
            return {
                count: 0,
                rows: null
            };
        }
    }
}
