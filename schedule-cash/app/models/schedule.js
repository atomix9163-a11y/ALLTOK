const logger = require("../../config/logger");
const pool = require("../../config/database");
const moment = require("moment");

module.exports = class scheduleModel {

    //////////////////////////////////////
    // 정산
    //////////////////////////////////////  

    // 미정산 목록을 통계 내어 얻는다
    static async getNotAdjust(limit) {
        let logBase = `models/scheduleModel.getNotAdjust`;
        try {
            // 처리가 끝난 로그 (status=3) 발송이 성공(RSLT = 0, RSLT2 = 0)인 경우 단가(ETC4)를 합산해서 리턴
            let query = `SELECT
                    ETC1 AS store_code,
                    group_concat(MSGKEY) AS MSGKEYS,
                    SUM(CAST(ETC4 AS DECIMAL(5, 2))) AS use_amount
                FROM (
                    SELECT
                        ETC1,
                        MSGKEY,
                        IFNULL(CAST(ETC4 AS DECIMAL(5, 2)), 0) AS ETC4
                    FROM tmsg_log
                    WHERE                
                        (((CAST(RSLT AS UNSIGNED) = 0 AND RSLT2 is null) OR          
                        (CAST(RSLT AS UNSIGNED) = 0 AND CAST(RSLT2 AS UNSIGNED) = 0)))
                        AND REQDATE >= DATE_ADD(NOW(), INTERVAL -3 DAY)
                        AND ETC2 = 'N'
                    ORDER BY REQDATE
                    LIMIT ${limit}
                ) a
                GROUP BY ETC1
            `;
            const [rows, fields] = await pool.mysqlPool.query(query, []);            
            return rows;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    // 잔액 처리 및 완료 처리
    static async updateBalance(storeCode, amount, MSGKEYS) {
        let logBase = `models/scheduleModel.updateBalance`;
        const connection = await pool.mysqlPool.getConnection();
        try {
            await connection.beginTransaction();
            // 처리가 끝난 로그 (status=3) 발송이 실패(RSLT != 0)인 경우
            // 모두 실패했으나 더 이상 후속 발송이 없는 경우 is_finish='Y'로 세팅해야 한다
            let query = `UPDATE tbl_affiliated_store_main SET balance = balance-? WHERE store_code = ?`;
            await connection.query(query, [parseFloat(amount), storeCode]);

            // logger.writeLog("info", `잔액 조정: ${storeCode}, ${query}, ${amount}`);

            // 대상을 처리완료로 설정한다
            query = `UPDATE tmsg_log SET ETC2 = 'Y' WHERE MSGKEY IN (${MSGKEYS})`;
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