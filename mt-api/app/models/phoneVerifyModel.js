const logger = require("../../config/logger");
const pool = require("../../config/database");

module.exports = class phoneVerifyModel {

    static async list(phone, page, rowCount) {
        let logBase = `models/phoneVerifyModel.list: page(${page}), rowCount(${rowCount}), phone(${phone})`
        try {
            let countQuery = `SELECT 
                COUNT(seq) AS TOTAL_COUNT 
            FROM 
                tbl_registerd_phone`;

            let query = `
            SELECT
                seq,
                phone,
                comment,
                C_ID,
                C_TIME
            FROM
                tbl_registerd_phone`;

            let whereQuery = `  
                ${phone.length != 0 ? ` WHERE phone LIKE '%${phone}%' ` : ''}
            `;

            countQuery += whereQuery;
            query = query + whereQuery + ` 
            ORDER BY
                phone ASC
            LIMIT 
                ${rowCount} OFFSET ${(page - 1) * rowCount}
            `;

            // console.log(query)
            // logger.writeLog("error", `${logBase}`);
            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, []);
            const [rows, fields] = await pool.mysqlPool.query(query, []);
            return {
                count: rowsCount[0].TOTAL_COUNT,
                rows: rows,
            };
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return {
                count: 0,
                rows: null
            };
        }
    }

    static async create(phone, comment) {
        let logBase = `models/phoneVerifyModel.create: phone(${phone}) comment(${comment})`
        try {
            let query = `INSERT INTO tbl_registerd_phone (phone, comment, C_ID, C_TIME)
            VALUES (?, ?, 'system', NOW())`;

            logger.writeLog("info", `${logBase} 추가됨`);
            const [rows, fields] = await pool.mysqlPool.query(query, [phone, comment]);
            return rows.insertId;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async remove(seq) {
        let logBase = `models/phoneVerifyModel.delete: seq(${seq})`;
        try {
            let query = 'DELETE FROM tbl_registerd_phone WHERE seq = ?';
            await pool.mysqlPool.query(query, [seq]);

            return seq;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }            
    }   
    
}