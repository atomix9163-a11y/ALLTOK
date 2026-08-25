const logger = require("../../config/logger");
const pool = require("../../config/database");

module.exports = class historyModel {

    // 트랜젝션을 걸면 발송을 한 후에 기록이 남지 않을 수 있으므로 트랜젝션을 걸지 않는다
    static async createMartroHistory(store_code, contents, send_no, send_method, send_type, reserve_time, send_time, members) {
        let logBase = `models/historyModel.createMartoPhoneHistory: store_code(${store_code}), send_no(${send_no}), count(${members.length})`
        try {
            let codeQuery = 'SELECT IFNULL(MAX(seq), 0) AS codeCount FROM tbl_martro_send_main';
            const [rowsCode, fieldsCode] = await pool.mysqlPool.query(codeQuery, []);
            let send_code = 'MS' + String(rowsCode[0].codeCount + 1).padStart(8, "0");

            // console.log(send_time)
            let query = `INSERT INTO tbl_martro_send_main 
                (send_code, store_code, send_no, contents, send_method, send_type, reserve_time, send_time, response, send_count, success_count, fail_count, C_ID, C_TIME, M_TIME) 
            values 
                (?, ?, ?, ?, ?, ?, ?, ?, 'W', ?, 0, 0, '', NOW(), NOW())`;

            const [rows, fields] = await pool.mysqlPool.query(query, [send_code, store_code, send_no, contents, send_method, send_type, reserve_time, send_time, members.length]);            
            return send_code;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return "";
        }
    }

    static async createMartroHistoryDetails(send_code, store_code, send_no, send_method, members) {
        let logBase = `models/historyModel.createMartroHistoryDetails: send_code(${send_code}), store_code(${store_code}), send_no(${send_no}), count(${members.length})`
        try {
            let sendArray = [];
            for (let member of members) {
                sendArray.push(
                    [send_code, store_code, send_method, send_no, member, 'W', new Date(), new Date()]
                )
            }
            
            let query = `INSERT INTO tbl_martro_send_details 
                (send_code, store_code, send_method, send_no, phone, response, C_TIME, M_TIME) 
            values 
                ?`;

            const [rows, fields] = await pool.mysqlPool.query(query, [sendArray]);
            return rows.insertId;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return 0;
        }
    }

    static async getMartroHistory(send_code) {
        let logBase = `models/historyModel.getMartroHistory: send_code(${send_code})`
        try {
            let query = `
            SELECT 
                seq,
                send_code,
                store_code,
                send_no,
                contents,
                send_method,
                send_type,
                reserve_time,
                send_time,
                response,
                send_count,
                success_count,
                Fail_count,
                C_ID,
                C_TIME,
                M_TIME
            FROM 
                tbl_martro_send_main
            WHERE
                send_code = ?`;

            const [rows, fields] = await pool.mysqlPool.query(query, [send_code]);
            if (rows.length > 0) {
                return rows[0];
            } else {
                return null;
            }

        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async updateMartroHistory(send_code, response, send_time, success_count, fail_count) {
        let logBase = `models/historyModel.getMartroHistory: send_code(${send_code})`
        try {
            let query = `
            UPDATE tbl_martro_send_main SET
                response = ?,                
                ${send_time ? 'send_time = NOW(), ' : ""}
                success_count = ?,
                fail_count = ?,
                M_TIME = NOW()
            WHERE
                send_code = ?`;

            // console.log(query, response, success_count, fail_count, send_code)
            const [rows, fields] = await pool.mysqlPool.query(query, [response, success_count, fail_count, send_code]);
            if (rows.length > 0) {
                return send_code;
            } else {
                return null;
            }

        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async cancelMartroHistory(send_code) {
        let logBase = `models/historyModel.getMartroHistory: send_code(${send_code})`
        try {
            let query = `
            UPDATE tbl_martro_send_main SET
                response = 'C',                                
                M_TIME = NOW()
            WHERE
                send_code = ?`;

            const [rows, fields] = await pool.mysqlPool.query(query, [send_code]);
            if (rows.length > 0) {
                return send_code;
            } else {
                return null;
            }

        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async MartroHistoryList(store_code, start_date, end_date, page, rowCount, response = "") {
        let logBase = `models/historyModel.MartroHistoryList: store_code(${store_code}), page(${page}), rowCount(${rowCount})`
        try {
            let countQuery = `SELECT 
                COUNT(seq) AS TOTAL_COUNT 
            FROM 
                tbl_martro_send_main 
            WHERE 
                store_code = ? 
                ${(start_date != "") ? ` AND (C_TIME BETWEEN '${start_date} 00:00:00)' AND '${end_date} 23:59:59') ` : "" } 
                ${(response != "") ? ` AND response = '${response}' ` : ""}`;

            let query = `
            SELECT 
                seq,
                send_code,
                store_code,
                send_no,
                contents,
                send_method,
                send_type,
                reserve_time,
                send_time,
                response,
                send_count,
                success_count,
                fail_count,
                C_ID,
                C_TIME,
                M_TIME
            FROM 
                tbl_martro_send_main
            WHERE
                store_code = ? 
                ${(start_date != "") ? ` AND (C_TIME BETWEEN '${start_date} 00:00:00)' AND '${end_date} 23:59:59') ` : "" } 
                ${(response != "") ? ` AND response = '${response}' ` : ""}
            ORDER BY
                C_TIME DESC
            LIMIT 
                ${rowCount} OFFSET ${(page - 1) * rowCount}`;
            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, [store_code]);

            const [rows, fields] = await pool.mysqlPool.query(query, [store_code]);
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
            return {
                count: 0,
                rows: rows,
            };
        }
    }

    static async MartroHistoryDetailList(send_code, page, rowCount) {
        let logBase = `models/historyModel.MartroHistoryList: send_code(${send_code}), page(${page}), rowCount(${rowCount})`
        try {
            let countQuery = `SELECT COUNT(seq) AS TOTAL_COUNT FROM tbl_martro_send_details WHERE send_code = ?`;

            let query = `
            SELECT 
                seq,
                send_code,
                store_code,
                send_method,
                send_no,
                phone,
                response,
                C_TIME,
                M_TIME
            FROM 
                tbl_martro_send_details
            WHERE
                send_code = ?
            ORDER BY
                phone
            LIMIT 
                ${rowCount} OFFSET ${(page - 1) * rowCount}`;
            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, [send_code]);

            const [rows, fields] = await pool.mysqlPool.query(query, [send_code]);
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

    static async updateMartroHistoryDetail(send_code, response) {
        let logBase = `models/historyModel.cancelMartroHistoryDetail: send_code(${send_code})`
        try {
            let query = `
            UPDATE tbl_martro_send_details SET
                response = ?,                                
                M_TIME = NOW()
            WHERE
                send_code = ?`;

            const [rows, fields] = await pool.mysqlPool.query(query, [response, send_code]);
            if (rows.length > 0) {
                return send_code;
            } else {
                return null;
            }

        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    
}