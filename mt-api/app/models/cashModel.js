const logger = require("../../config/logger");
const pool = require("../../config/database");

module.exports = class cashModel {

    static async chargeHistoryList(storeCode, startDate, endDate, page, rowCount, cashType = "") {
        let logBase = `models/cashModel.chargeHistoryList: storeCode(${storeCode}), page(${page}), rowCount(${rowCount})`
        try {
            let countQuery = `SELECT 
                COUNT(seq) AS TOTAL_COUNT 
            FROM 
                tbl_affiliated_store_cash_history 
            WHERE 
                store_code = ? 
                ${(startDate != "") ? ` AND (C_TIME BETWEEN '${startDate} 00:00:00)' AND '${endDate} 23:59:59')` : ''}
                ${(cashType != "") ? ` AND cash_type = '${cashType}' ` : ""}
            `;

            let query = `
            SELECT 
                seq,
                store_code,
                cash_type,
                amount,
                old_balance,
                balance,
                total_charge,
                c_id,
                c_time
            FROM 
                tbl_affiliated_store_cash_history
            WHERE
                store_code = ? 
                ${(startDate != "") ? ` AND (C_TIME BETWEEN '${startDate} 00:00:00)' AND '${endDate} 23:59:59')` : ''}
                ${(cashType != "") ? ` AND cash_type = '${cashType}' ` : ""}
            ORDER BY
                c_time DESC
            LIMIT 
                ${rowCount} OFFSET ${(page - 1) * rowCount}`;
            // console.log(query)
            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, [storeCode]);

            const [rows, fields] = await pool.mysqlPool.query(query, [storeCode]);
            if (rows.length > 0) {
                // logger.writeLog("info", `${logBase} - ${rows.length} rows return`);
                return {
                    count: rowsCount[0].TOTAL_COUNT,
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
 
    static async add(storeCode, amount, cashType, C_ID) {
        let logBase = `models/cashModel.add: storeCode(${storeCode}), amount(${amount}), cashType(${cashType}), C_ID(${C_ID})`
        const connection = await pool.mysqlPool.getConnection(async conn => conn);
        try {
            // 마트의 현재 잔액을 얻는다
            let queryBalanace = 'SELECT IFNULL(balance, 0) AS balance FROM tbl_affiliated_store_main WHERE store_code = ?';
            const [rowsBalance] = await pool.mysqlPool.query(queryBalanace, [storeCode]);
            console.log(rowsBalance[0].balance)
            let old_balance = parseFloat(rowsBalance[0].balance);

            let balance = old_balance;
            // console.log("balance", balance, amount)

            // 변경된 잔액을 계산한다
            switch (cashType) {
                case "A":   // 추가
                    balance += amount;
                    break;
                case "R":   // 차감
                    balance -= amount;
                    break;
                case "C":   // 잔액 정정
                    balance = amount;
                    break;
            }
            
            // 마트의 현재 누적 잔액을 얻는다
            let totalCharge = 0;
            let queryTotalCharge = 'SELECT IFNULL(total_charge, 0) AS chargeTotal FROM tbl_affiliated_store_cash_history WHERE store_code = ? ORDER BY seq DESC LIMIT 1';
            const [rowsTotalCharge, fieldsTotalCharge] = await pool.mysqlPool.query(queryTotalCharge, [storeCode]);
            if (rowsTotalCharge.length > 0) {
                totalCharge = parseFloat(rowsTotalCharge[0].chargeTotal);
            }
            switch (cashType) {
                case "A":   // 추가
                    totalCharge += amount;
                    break;
                case "R":   // 차감
                    totalCharge -= amount;
                    break;
                case "C":   // 잔액 정정
                    totalCharge = totalCharge;
                    break;
            }
            // console.log("totalCharge", cashType, totalCharge, amount)

            await connection.beginTransaction();
            
            let query = `INSERT INTO tbl_affiliated_store_cash_history 
                (store_code, cash_type, amount, old_balance, balance, total_charge, c_id, c_time) 
            values 
                (?, ?, ?, ?, ?, ?, ?, NOW())`;
            const [rows, fields] = await connection.query(query, [storeCode, cashType, amount, old_balance, balance, totalCharge, C_ID]);

            query = `UPDATE tbl_affiliated_store_main SET balance = ?, M_ID=?, M_TIME = NOW() WHERE store_code = ?`;
            await connection.query(query, [balance, C_ID, storeCode]);

            await connection.commit();
            logger.writeLog("info", `${logBase}`);

            return rows.insertId;
        } catch (error) {
            await connection.rollback();
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return "";
        } finally {
            connection.release();
        }
    }


}