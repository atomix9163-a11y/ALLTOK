const logger = require("../../config/logger");
const pool = require("../../config/database");
const moment = require("moment");

module.exports = class scheduleMTSModel {

    //////////////////////////////////////
    // 정산
    //////////////////////////////////////  

    // 발송 요청일 기준 3일 이내의 미정산 목록을 통계 내어 얻는다. 성공인 경우만 합계
    // sendType = ATALK / MMS / SMS
    // TRAN_RSLT = ATALK 1000 / MMS 1000 / SMS 0
    static async getNotAdjust(sendType, limit) {
        let logBase = `models/scheduleMTSModel.getNotAdjust`;
        try {
            // 처리가 끝난 로그 (status=3) 발송이 성공(RSLT = 0, RSLT2 = 0)인 경우 단가(ETC4)를 합산해서 리턴
            let query = `SELECT
                    TRAN_ETC1 AS store_code,
                    group_concat(TRAN_PR) AS TRAN_PRS,
                    SUM(CAST(TRAN_ETC4 AS DECIMAL(5, 2))) AS use_amount
                FROM (
                    SELECT
                        TRAN_ETC1,
                        TRAN_PR,
                        IFNULL(CAST(TRAN_ETC4 AS DECIMAL(5, 2)), 0) AS TRAN_ETC4
                    FROM alltok.MTS_${sendType}_MSG_LOG
                    WHERE                                        
                        CAST(TRAN_RSLT AS UNSIGNED) = ${sendType == 'ATALK' || sendType == 'MMS' ? 1000 : 0 } 
                        AND TRAN_DATE >= DATE_ADD(NOW(), INTERVAL -3 DAY)
                        AND TRAN_ETC2 = 'N'
                    ORDER BY TRAN_DATE
                    LIMIT ${limit}
                ) a
                GROUP BY TRAN_ETC1
            `;
            const [rows, fields] = await pool.mysqlPool.query(query, []);
            return rows;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    // 잔액 처리 및 완료 처리
    static async updateBalance(sendType, storeCode, amount, TRAN_PRS) {
        let logBase = `models/scheduleMTSModel.updateBalance`;
        const connection = await pool.mysqlPool.getConnection();
        try {
            await connection.beginTransaction();
            // 처리가 끝난 로그 (status=3) 발송이 실패(RSLT != 0)인 경우
            // 모두 실패했으나 더 이상 후속 발송이 없는 경우 is_finish='Y'로 세팅해야 한다
            let query = `UPDATE complexm.tbl_affiliated_store_main SET balance = balance - ? WHERE store_code = ?`;
            await connection.query(query, [parseFloat(amount), storeCode]);

            // logger.writeLog("info", `잔액 조정: ${storeCode}, ${query}, ${amount}`);

            // 대상을 처리완료로 설정한다
            query = `UPDATE alltok.MTS_${sendType}_MSG_LOG SET TRAN_ETC2 = 'Y' WHERE TRAN_PR IN (${TRAN_PRS})`;
            await connection.query(query, []);

            // logger.writeLog("info", `완료처리: ${storeCode}, ${query}`);

            await connection.commit(); // commit
            return true;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);

            await connection.rollback(); // rollback
            return false;
        } finally {
            connection.release();
        }
     }

}