const logger = require("../../config/logger");
const pool = require("../../config/database");
const numeral = require("numeral");

module.exports = class virtualBankModel {
    static async get(storeCode) {
        let logBase = `models/virtualBankModel.get: storeCode(${storeCode})`;
        try {
            // 아이디가 중복되는지 확인
            let query = `SELECT 
                tbl_bank_virtual_account.seq,
                tbl_bank_virtual_account.store_code,
                tbl_affiliated_store_main.name,
                bank_name,
                bank_account
             FROM 
                tbl_bank_virtual_account 
                INNER JOIN tbl_affiliated_store_main ON tbl_affiliated_store_main.store_code = tbl_bank_virtual_account.store_code 
            WHERE 
                tbl_bank_virtual_account.store_code = ?`;

            const [rows] = await pool.mysqlPool.query(query, [storeCode]);
            return rows[0];
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return -1;
        }
    }

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
    static async createProcess(storeCode, TID, Moid, sendDataJSON) {
        let logBase = `models/virtualBankModel.createProcess:`;
        try {
            // 아이디가 중복되는지 확인
            let query = `INSERT INTO tbl_bank_virtual_account_pay_main (store_code, TID, MOID, verify_call_data, verify_call_time, procee_step)
            VALUES
                (?, ?, ?, ?, ?, ?)`;

            const [rows] = await pool.mysqlPool.query(query, [storeCode, TID, Moid, JSON.stringify(sendDataJSON), new Date(), 0]);

            logger.writeLog("info", `${logBase} 가상계좌 프로세스를 시작합니다. ${TID}, ${Moid}, ${storeCode} ${sendDataJSON.VbankAccountName}/${numeral(sendDataJSON.Amt).format("0,0")}원`);
            return rows.insertId;
        } catch (error) {
            logger.writeLog("error", `${logBase} 가상계좌 프로세스 데이터 기록에 실패했습니다. \nStacktrace: ${error.stack}`);
            return -1;
        }
    }

    static async updateProcessVerify(storeCode, TID, responseData) {
        const responseDataJSON = JSON.parse(responseData)
        console.log(responseDataJSON)

        let logBase = `models/virtualBankModel.updateProcessVerify:`;
        try {
            // 아이디가 중복되는지 확인
            let query = `UPDATE tbl_bank_virtual_account_pay_main SET
                verify_result_code = ?,
                verify_result_msg = ?,
                verify_result_data = ?,
                verify_result_time = ?,
                procee_step = ?
            WHERE
                store_code = ? AND TID = ?`;

            const [rows] = await pool.mysqlPool.query(query, [responseDataJSON.ResultCode, responseDataJSON.ResultMsg, responseData, new Date(), 1, storeCode, TID]);

            logger.writeLog("info", `${logBase} 가상계좌 과오납체크API 결과를 기록합니다. ${storeCode}, ${TID}`);
            return rows.insertId;
        } catch (error) {
            logger.writeLog("error", `${logBase} 가상계좌 과오납체크API 결과 데이터 기록에 실패했습니다. \nStacktrace: ${error.stack}`);
            return -1;
        }
    }

    // 활성 중인 가상계좌입금상태를 가져온다
    static async getLiveVirtualBank(storeCode) {
        let logBase = `models/virtualBankModel.getVirtualBank:`;
        try {
            let query = `SELECT 
                seq,
                store_code,
                TID,
                MOID,
                procee_step,
                verify_call_data,
                verify_call_time,
                verify_result_code,
                verify_result_msg,
                verify_result_data,
                verify_result_time,
                callback_result_code,
                callback_result_msg,
                callback_data,
                callback_time,
                cash_amount,
                cash_time
            FROM 
                tbl_bank_virtual_account_pay_main
            WHERE 
                store_code = ?
                AND procee_step = 1 
                AND verify_result_code = '4120' 
                AND verify_call_time >= DATE_SUB(NOW(), INTERVAL 1 DAY)
            ORDER BY SEQ DESC
            LIMIT 1`;

            const [rows] = await pool.mysqlPool.query(query, [storeCode]);
            
            return (rows.length > 0) ? rows[0] : null;
        } catch (error) {
            logger.writeLog("error", `${logBase} 가상계좌입금대기 데이터를 가져올 때 오류가 발생했습니다. \nStacktrace: ${error.stack}`);
            return -1;
        }
    }
    
    // 마트에 연결된 가상계좌정보를 리턴
    static async getAccount(storeCode) {
        let logBase = `models/virtualBankModel.getAccount:`;
        try {
            let query = `SELECT 
                seq,
                store_code,
                bank_name,
                bank_code,
                bank_account,
                active,
                C_ID,
                C_TIME,
                M_ID,
                M_TIME
            FROM 
                tbl_bank_virtual_account
            WHERE 
                store_code = ?
                AND active = 'Y'
            `;

            const [rows] = await pool.mysqlPool.query(query, [storeCode]);
            
            return (rows.length > 0) ? rows[0] : null;
        } catch (error) {
            logger.writeLog("error", `${logBase} 가상계좌 데이터를 가져올 때 오류가 발생했습니다. \nStacktrace: ${error.stack}`);
            return -1;
        }
    }

    // 가상계좌목록을 리턴
    static async listVirtualBankAccount(notAssigned, accountType, searchKey, page, rowCount) {
        let logBase = `models/virtualBankModel.listVirtualBankAccount: notAssigned(${notAssigned}) accountType(${accountType}) page(${page}) rowCount(${rowCount})`
        
        try {
            let countQuery = `SELECT COUNT(A.seq) AS ACCOUNT_COUNT FROM tbl_bank_virtual_account A LEFT JOIN tbl_affiliated_store_main B ON B.store_code = A.store_code `;

            let query = `
            SELECT
                A.seq,
                A.store_code,
                B.name,
                A.bank_name,
                A.bank_code,
                A.bank_account,
                A.active,
                A.C_ID,
                A.C_TIME,
                A.M_ID,
                A.M_TIME
            FROM 
                tbl_bank_virtual_account A
				LEFT JOIN tbl_affiliated_store_main B ON B.store_code = A.store_code `;

            let whereQuery = ` WHERE A.active = 'Y' `;
            if (notAssigned == 'Y') {
                whereQuery += ` AND (A.store_code is null OR A.store_code = '') `
            }
            if (searchKey != "") {
                whereQuery += ` AND (B.name LIKE '%${searchKey.replaceAll(' ', '%')}%' OR A.bank_account LIKE '%${searchKey}%') `
            }
            if (accountType != "") {
                whereQuery += ` AND A.bank_account LIKE '${accountType}%' `
            }
            countQuery += whereQuery;
            query += whereQuery;
            query += ` ORDER BY A.bank_account
                LIMIT ${rowCount} OFFSET ${(page - 1) * rowCount}`

            console.log(query)
            console.log(countQuery)
            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, []);
            const [rows, fields] = await pool.mysqlPool.query(query, []);
            if (rows.length > 0) {
                // logger.writeLog("info", `${logBase} - ${rows.length} rows return`);
                return {
                    count: rowsCount[0].ACCOUNT_COUNT,
                    rows: rows,
                };
            } else {
                // logger.writeLog("info", `${logBase} - No data found`);
                return {
                    count: 0,
                    rows: rows,
                };
            }

        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async checkUsedAccount(accountCode) {
        let logBase = `models/virtualBankModel.checkUsedAccount: accountCode(${accountCode})`;
        try {
            let query = `SELECT 
                COUNT(seq) AS FOUND_COUNT
            FROM 
                tbl_bank_virtual_account
            WHERE 
                seq = ?
                AND (NOT store_code IS null OR store_code != '')
            `;

            const [rows] = await pool.mysqlPool.query(query, [accountCode]);
            
            return rows[0].FOUND_COUNT;
        } catch (error) {
            logger.writeLog("error", `${logBase} 가상계좌 데이터를 가져올 때 오류가 발생했습니다. \nStacktrace: ${error.stack}`);
            return -1;
        }
    }

    static async checkUsedStore(storeCode) {
        let logBase = `models/virtualBankModel.checkUsedStore: storeCode(${storeCode})`;
        try {
            let query = `SELECT 
                COUNT(seq) AS FOUND_COUNT
            FROM 
                tbl_bank_virtual_account
            WHERE 
                store_code = ?
            `;

            const [rows] = await pool.mysqlPool.query(query, [storeCode]);
            
            return rows[0].FOUND_COUNT;
        } catch (error) {
            logger.writeLog("error", `${logBase} 가상계좌 데이터를 가져올 때 오류가 발생했습니다. \nStacktrace: ${error.stack}`);
            return -1;
        }
    }

    static async linkAccountStore(accountCode, storeCode) {
        let logBase = `models/virtualBankModel.linkAccountStore: accountCode(${accountCode}) storeCode(${storeCode})`;
        try {
            let query = `UPDATE tbl_bank_virtual_account SET store_code = ? WHERE seq = ?`;

            const [rows] = await pool.mysqlPool.query(query, [storeCode, accountCode]);
            
            return accountCode;
        } catch (error) {
            logger.writeLog("error", `${logBase} 가상계좌 연결할 때 오류가 발생했습니다. \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async unlinkAccountStore(accountCode, storeCode) {
        let logBase = `models/virtualBankModel.unlinkAccountStore: accountCode(${accountCode}) storeCode(${storeCode})`;
        try {
            let query = `UPDATE tbl_bank_virtual_account SET store_code = null WHERE seq = ? AND store_code = ?`;

            const [rows] = await pool.mysqlPool.query(query, [accountCode, storeCode]);
            
            return accountCode;
        } catch (error) {
            logger.writeLog("error", `${logBase} 가상계좌 해제할 때 오류가 발생했습니다. \nStacktrace: ${error.stack}`);
            return null;
        }
    }
    
    static async listVirtualBankAccountHistory(storeCode, page, rowCount) {
        let logBase = `models/virtualBankModel.listVirtualBankAccountHistory: page(${page}) rowCount(${rowCount})`
        try {
            let countQuery = `SELECT COUNT(seq) AS HISTORY_COUNT FROM tbl_bank_virtual_account_pay_main `;

            let query = `
            SELECT
                seq,
                store_code,
                TID,
                MOID,
                procee_step,
                verify_call_data,
                verify_call_time,
                verify_result_code,
                verify_result_msg,
                verify_result_data,
                verify_result_time,
                callback_result_code,
                callback_result_msg,
                callback_data,
                callback_time,
                cash_amount,
                cash_time
            FROM 
                tbl_bank_virtual_account_pay_main `;

            let whereQuery = ` WHERE store_code = '${storeCode}' `;
            countQuery += whereQuery;
            query += whereQuery;
            query += ` ORDER BY seq DESC
                LIMIT ${rowCount} OFFSET ${(page - 1) * rowCount}`

            // console.log(query)
            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, []);
            const [rows, fields] = await pool.mysqlPool.query(query, []);
            if (rows.length > 0) {
                // logger.writeLog("info", `${logBase} - ${rows.length} rows return`);
                return {
                    count: rowsCount[0].HISTORY_COUNT,
                    rows: rows,
                };
            } else {
                // logger.writeLog("info", `${logBase} - No data found`);
                return {
                    count: 0,
                    rows: rows,
                };
            }

        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async listVirtualBankAccountHistoryMonth(year, month, page = 0, rowCount = 20) {
        let logBase = `models/virtualBankModel.listVirtualBankAccountHistoryMonth: page(${page}) rowCount(${rowCount})`
        try {
            let countQuery = `SELECT COUNT(seq) AS HISTORY_COUNT FROM tbl_bank_virtual_account_pay_main `;

            let query = `
            SELECT
                tbl_bank_virtual_account_pay_main.seq,
                tbl_bank_virtual_account_pay_main.store_code,
                name,
                name_reg,
                regno,
                TID,
                MOID,
                procee_step,
                verify_call_data,
                verify_call_time,
                verify_result_code,
                verify_result_msg,
                verify_result_data,
                verify_result_time,
                callback_result_code,
                callback_result_msg,
                callback_data,
                callback_time,
                cash_amount,
                cash_time
            FROM 
                tbl_bank_virtual_account_pay_main 
                INNER JOIN tbl_affiliated_store_main ON tbl_affiliated_store_main.store_code = tbl_bank_virtual_account_pay_main.store_code `;

            let whereQuery = ` WHERE procee_step >= 2 AND DATE_FORMAT(cash_time, '%Y-%c') = '${year}-${month}' `;
            countQuery += whereQuery;
            query += whereQuery;
            query += ` ORDER BY cash_time ASC`;
            if (page != 0) {
                query += ` LIMIT ${rowCount} OFFSET ${(page - 1) * rowCount}`
            }

            console.log(query)
            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, []);
            const [rows, fields] = await pool.mysqlPool.query(query, []);
            if (rows.length > 0) {
                // logger.writeLog("info", `${logBase} - ${rows.length} rows return`);
                return {
                    count: rowsCount[0].HISTORY_COUNT,
                    rows: rows,
                };
            } else {
                // logger.writeLog("info", `${logBase} - No data found`);
                return {
                    count: 0,
                    rows: rows,
                };
            }

        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async listVirtualBankAccountHistoryMonthERP(year, month) {
        let logBase = `models/virtualBankModel.listVirtualBankAccountHistoryMonthERP: year(${year}) month(${month})`
        try {
            let query = `
            SELECT
                tbl_bank_virtual_account_pay_main.seq,
                tbl_bank_virtual_account_pay_main.store_code,
                name,
                name_reg,
                regno,
                TID,
                MOID,
                procee_step,
                verify_call_data,
                verify_call_time,
                verify_result_code,
                verify_result_msg,
                verify_result_data,
                verify_result_time,
                callback_result_code,
                callback_result_msg,
                callback_data,
                callback_time,
                cash_amount,
                cash_time
            FROM 
                tbl_bank_virtual_account_pay_main 
                INNER JOIN tbl_affiliated_store_main ON tbl_affiliated_store_main.store_code = tbl_bank_virtual_account_pay_main.store_code 
            WHERE 
                procee_step >= 2 AND DATE_FORMAT(cash_time, '%Y-%c') = '${year}-${month}' 
            ORDER BY 
                cash_time ASC`;

            // console.log(query)
            // const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, []);
            const [rows, fields] = await pool.mysqlPool.query(query, []);
            if (rows.length > 0) {
                // logger.writeLog("info", `${logBase} - ${rows.length} rows return`);
                return {
                    count: rows.length,
                    rows: rows,
                };
            } else {
                // logger.writeLog("info", `${logBase} - No data found`);
                return {
                    count: 0,
                    rows: rows,
                };
            }

        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }
}