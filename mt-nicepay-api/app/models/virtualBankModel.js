const logger = require("../../config/logger");
const pool = require("../../config/database");
const numeral = require("numeral");

module.exports = class virtualBankModel {
    static async addHistory(storeCode, TID, action, resultCode, resultMsg, dataJSON) {
        let logBase = `models/virtualBankModel.addHistory:`;
        try {
            // 아이디가 중복되는지 확인
            let query = `INSERT INTO tbl_bank_virtual_account_history (store_code, TID, action, result_code, result_msg, data, c_time)
            VALUES
                (?, ?, ?, ?, ?, ?, ?)`;

            const [rows] = await pool.mysqlPool.query(query, [storeCode, TID, action, resultCode, resultMsg, JSON.stringify(dataJSON), new Date()]);

            logger.writeLog("info", `${logBase} 가상계좌기록을 추가합니다. ${storeCode}, ${TID}, ${action}`);
            return rows.insertId;
        } catch (error) {
            logger.writeLog("error", `${logBase} 가상계좌기록 추가에 실패했습니다. \nStacktrace: ${error.stack}`);
            return -1;
        }
    }

    // 0: 등록
    // 1: 과오납체크API완료 (입금대기)
    // 2: 입금완료
    // 3: 충전완료
    // 고객 입금 시 callback 호출은 
    static async updateCallback(storeCode, TID, resultParams) {
        let logBase = `models/virtualBankModel.updateCallback:`;
        try {
            // 아이디가 중복되는지 확인
            let query = `UPDATE tbl_bank_virtual_account_pay_main SET
                callback_result_code = ?,
                callback_result_msg = ?,
                callback_data = ?,
                callback_time = ?,
                procee_step = ?
            WHERE
                store_code = ? AND TID = ?`;

            const [rows] = await pool.mysqlPool.query(query, [resultParams.ResultCode, resultParams.ResultMsg, JSON.stringify(resultParams), new Date(), 2, storeCode, TID]);

            logger.writeLog("info", `${logBase} 가상계좌 입금 처리 결과를 기록합니다. ${storeCode}, ${TID}`);
            return rows.insertId;
        } catch (error) {
            logger.writeLog("error", `${logBase} 가상계좌 입금 처리 결과 데이터 기록에 실패했습니다. \nStacktrace: ${error.stack}`);
            return -1;
        }
    }

    static async updateCash(storeCode, TID, amount) {
        let logBase = `models/virtualBankModel.updateCash:`;
        try {
            // 아이디가 중복되는지 확인
            let query = `UPDATE tbl_bank_virtual_account_pay_main SET
                cash_amount = ?,
                cash_time = ?,
                procee_step = ?
            WHERE
                store_code = ? AND TID = ?`;

            const [rows] = await pool.mysqlPool.query(query, [amount, new Date(), 3, storeCode, TID]);

            logger.writeLog("info", `${logBase} 가상계좌 입금 결과를 기록합니다. ${storeCode}, ${TID}`);
            return rows.insertId;
        } catch (error) {
            logger.writeLog("error", `${logBase} 가상계좌 입금 결과 데이터 기록에 실패했습니다. \nStacktrace: ${error.stack}`);
            return -1;
        }
    }
}