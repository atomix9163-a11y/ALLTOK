const logger = require("../../config/logger");
const pool = require("../../config/database");

module.exports = class templateModel {

    static async get(templateCode) {
        let logBase = `models/templateModel.get`
        try {
            let query = `
            SELECT
                SEQ,
                TEMPLATE_CODE,
                THUMBNAIL_URI,
                USE_SECTION,
                HTML,
                ORD,
                ACTIVE,
                C_ID,
                C_TIME,
                M_ID,
                M_TIME
            FROM
                tbl_leaflet_template
            WHERE
                TEMPLATE_CODE = ?`;

            const [rows, fields] = await pool.mysqlPool.query(query, [templateCode]);
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

    static async list(page, rowCount) {
        let logBase = `models/systemModel.get`
        try {
            let query = `
            SELECT
                SEQ,
                TEMPLATE_CODE,
                THUMBNAIL_URI,
                USE_SECTION,
                HTML,
                ORD,
                ACTIVE,
                C_ID,
                C_TIME,
                M_ID,
                M_TIME
            FROM
                tbl_leaflet_template
            ORDER BY
                ORD, TEMPLATE_CODE
            LIMIT 
                ${rowCount} OFFSET ${(page - 1) * rowCount}`;

            const [rows, fields] = await pool.mysqlPool.query(query, []);
            return rows;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }
}