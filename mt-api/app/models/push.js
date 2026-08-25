const logger = require("../../config/logger");
const pool = require("../../config/database");

module.exports = class complexPushModel {

    static async get(pushCode) {
        let logBase = `models/complexPushModel.get: pushCode(${pushCode})`
        try {
            let query = `SELECT 
                seq,
                push_code,
                store_code,
                M_MOA_CODE,
                NT_MSG_TITLE,
                NT_MSG_CONTENT,
                NT_MSG_DELI_TYPE,
                NT_MSG_DELI_OPT,
                NT_MSG_SCHE_DTIME,
                NT_MSG_SEND_DTIME,
                NT_MSG_LOGO_URL,
                NT_MSG_IMG_URL,
                NT_MSG_STATUS,
                use_push,
                use_kakao,
                use_rcs,
                use_sms,
                kakao_template,
                rcs_text,
                sms_text,
                use_web_link,
                web_link,
                leaflet1,
                leaflet2,
                leaflet3,
                leaflet4,
                leaflet5,
                use_smart_leaflet,
                C_ID,
                C_TIME,
                M_ID,
                M_TIME
            FROM tbl_push_msg
            WHERE
                push_code = ?`;

            const [rows, fields] = await pool.mysqlPool.query(query, [pushCode]);
            if (rows.length > 0)
                return rows[0];
            else
                return null;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async getLast(store_code) {
        let logBase = `models/complexPushModel.getLast: store_code(${store_code})`
        try {
            let query = `SELECT 
                seq,
                push_code,
                store_code,
                M_MOA_CODE,
                NT_MSG_TITLE,
                NT_MSG_CONTENT,
                NT_MSG_DELI_TYPE,
                NT_MSG_DELI_OPT,
                NT_MSG_SCHE_DTIME,
                NT_MSG_SEND_DTIME,
                NT_MSG_LOGO_URL,
                NT_MSG_IMG_URL,
                NT_MSG_STATUS,
                use_push,
                use_kakao,
                use_rcs,
                use_sms,
                kakao_template,
                rcs_text,
                sms_text,
                web_link,
                leaflet1,
                leaflet2,
                leaflet3,
                leaflet4,
                leaflet5,
                use_smart_leaflet,
                C_ID,
                C_TIME,
                M_ID,
                M_TIME
            FROM tbl_push_msg
            WHERE
                store_code = ?
                AND C_TIME <= STR_TO_DATE(DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 DAY), '%Y-%m-%d 12:00:00'), '%Y-%m-%d %T')                
            ORDER BY
                C_TIME DESC
            LIMIT 1`;

            const [rows, fields] = await pool.mysqlPool.query(query, [store_code]);
            if (rows.length > 0)
                return rows[0];
            else
                return null;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async list(storeCode, page, rowCount) {
        let logBase = `models/complexPushModel.list: storeCode(${storeCode}), page(${page}), rowCount(${rowCount})`
        try {
            let countQuery = `SELECT COUNT(seq) AS PUSH_COUNT FROM tbl_push_msg WHERE store_code = ?`;

            let query = `SELECT 
                seq,
                push_code,
                store_code,
                M_MOA_CODE,
                NT_MSG_TITLE,
                NT_MSG_CONTENT,
                NT_MSG_DELI_TYPE,
                NT_MSG_DELI_OPT,
                NT_MSG_SCHE_DTIME,
                NT_MSG_SEND_DTIME,
                NT_MSG_LOGO_URL,
                NT_MSG_IMG_URL,
                NT_MSG_STATUS,
                use_push,
                use_kakao,
                use_rcs,
                use_sms,
                kakao_template,
                rcs_text,
                sms_text,
                web_link,
                leaflet1,
                leaflet2,
                leaflet3,
                leaflet4,
                leaflet5,
                use_smart_leaflet,
                C_ID,
                C_TIME,
                M_ID,
                M_TIME
            FROM 
                tbl_push_msg
            WHERE
                store_code = ?
            ORDER BY 
                C_TIME desc
            LIMIT 
                ${rowCount} OFFSET ${(page - 1) * rowCount}`;

            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, [storeCode]);
            const [rows, fields] = await pool.mysqlPool.query(query, [storeCode]);

            return {
                count: rowsCount[0].PUSH_COUNT,
                rows: rows,
            };
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return {
                count: 0,
                rows: null,
            };
        }
    }

    static async create(
        storeCode, 
        M_MOA_CODE, 
        NT_MSG_TITLE,
        NT_MSG_CONTENT,
        NT_MSG_DELI_TYPE,
        NT_MSG_DELI_OPT,
        NT_MSG_SCHE_DTIME,
        NT_MSG_SEND_DTIME,
        NT_MSG_LOGO_URL,
        NT_MSG_IMG_URL,
        NT_MSG_STATUS,
        use_smart_leaflet,
        C_ID
        ) {
        let logBase = `models/complexPushModel.create: storeCode(${storeCode}), NT_MSG_TITLE(${NT_MSG_TITLE})`
        try {
            // 코드 생성
            let codeQuery = 'SELECT IFNULL(MAX(seq), 0) AS codeCount FROM tbl_push_msg';
            const [rowsCode, fieldsCode] = await pool.mysqlPool.query(codeQuery, []);

            let pushCode = 'PS' + String(rowsCode[0].codeCount + 1).padStart(8, "0");

            let query = `INSERT INTO tbl_push_msg (
                push_code,
                store_code,
                M_MOA_CODE,
                NT_MSG_TITLE,
                NT_MSG_CONTENT,
                NT_MSG_DELI_TYPE,
                NT_MSG_DELI_OPT,
                NT_MSG_SCHE_DTIME,
                NT_MSG_SEND_DTIME,
                NT_MSG_LOGO_URL,
                NT_MSG_IMG_URL,
                NT_MSG_STATUS,
                use_smart_leaflet,
                C_ID,
                C_TIME                
            ) VALUES (
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                NOW()
            )`;

            const [rows, fields] = await pool.mysqlPool.query(query, [
                pushCode,
                storeCode,
                M_MOA_CODE,
                NT_MSG_TITLE,
                NT_MSG_CONTENT,
                NT_MSG_DELI_TYPE,
                NT_MSG_DELI_OPT,
                NT_MSG_SCHE_DTIME,
                NT_MSG_SEND_DTIME,
                NT_MSG_LOGO_URL,
                NT_MSG_IMG_URL,
                NT_MSG_STATUS,
                use_smart_leaflet,
                C_ID]);
            return pushCode;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return "";
        }
    }

    static async updateImage(pushCode, targetField, pathValue) {
        let logBase = `models/updateImage.get: pushCode(${pushCode}), targetField(${targetField}), pathValue(${pathValue})`
        try {
            let query = `UPDATE tbl_push_msg
            SET
                ${targetField} = ?
            WHERE
                push_code = ?`;

            const [rows, fields] = await pool.mysqlPool.query(query, [pathValue, pushCode]);
            return rows.insertId;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return 0;
        }
    }
}