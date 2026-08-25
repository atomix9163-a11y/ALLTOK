const logger = require("../../config/logger");
const pool = require("../../config/database");

module.exports = class systemModel {

    static async get(keyword) {
        let logBase = `models/systemModel.get`
        try {
            let query = `
            SELECT
                data
            FROM
                tbl_system_config
            WHERE
                keyword = ?`;

            const [rows, fields] = await pool.mysqlPool.query(query, [keyword]);
            if (rows.length > 0) {
                return rows[0]
            } else {
                return null;
            }
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async list() {
        let logBase = `models/systemModel.get`
        try {
            let query = `
            SELECT
                keyword,
                data,
                C_ID,
                C_TIME
            FROM
                tbl_system_config
            ORDER BY
                keyword`;

            const [rows, fields] = await pool.mysqlPool.query(query, []);
            return rows;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async save(keyword, data, C_ID) {
        let logBase = `models/systemModel.save: keyword(${keyword})`;
        try {
            let removeQuery = 'DELETE FROM tbl_system_config WHERE keyword = ?';
            await pool.mysqlPool.query(removeQuery, [keyword]);

            let query = `
            INSERT INTO tbl_system_config (
                keyword,                
                data,
                C_ID,
                C_TIME
            ) VALUES (
                ?,           
                ?,
                ?,
                NOW()                
            )`;

            const [rows, fields] = await pool.mysqlPool.query(query, [keyword, data, C_ID]);
            // logger.writeLog("info", `${logBase} - saved`);
            return rows.insertId;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }            
    }


}