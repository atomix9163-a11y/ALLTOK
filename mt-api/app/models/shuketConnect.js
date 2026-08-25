const logger = require("../../config/logger");
const pool = require("../../config/database");
const uniqid = require("uniqid");

module.exports = class shuketConnectModel {
    // 바코드에서 s3 cdn 경로 얻기

    static async getImageUriByBarcode(barcode) {
        let log_base = `models/shuketConnect.getImageUri: BARCODE(${barcode})`;
        try {
            let query = `SELECT 
                    IF(IS_IMDIGITAL_SYNC_S3='Y',IM_URI_DIGITAL,IM_URI) AS IM_URI
                FROM 
                    TBL_MOA_IMAGE_PRD
                WHERE 
                    IM_TYPE = 1 AND
                    IM_BARCODE = ?
                ORDER BY SEQ DESC LIMIT 1
            ;`;
            const [rows, fields] = await pool.mysqlPool_shuket.query(query, [barcode]);
            if (rows.length > 0) {
                // console.log("rows.length", rows.length);
                return rows[0].IM_URI;
            } else {
                // logger.writeLog("warning", `${log_base} - No data found`);
                return null;
            }
        } catch (error) {
            logger.writeLog("error", `${log_base} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async getImageUriByName(name) {
        let log_base = `models/shuketConnect.getImageUriByName: name(${name})`;
        try {
            let query = `SELECT 
                    IF(IS_IMDIGITAL_SYNC_S3='Y',IM_URI_DIGITAL,IM_URI) AS IM_URI
                FROM 
                    TBL_MOA_IMAGE_PRD
                WHERE 
                    IM_TYPE = 1 AND
                    IM_NAME = ? OR IM_TAGS LIKE '%${name}%'
                ORDER BY SEQ DESC LIMIT 1
            ;`;
            const [rows, fields] = await pool.mysqlPool_shuket.query(query, [name]);
            if (rows.length > 0) {
                // console.log("rows.length", rows.length);
                return rows[0].IM_URI;
            } else {
                // logger.writeLog("warning", `${log_base} - No data found`);
                return null;
            }
        } catch (error) {
            logger.writeLog("error", `${log_base} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async findPhotoShuketByName(existBarCode, keyword, page, rowCount) {
        const log_base = `models/shuketConnect.findPhotoShuketByName: existBarCode(${existBarCode}), keyword(${keyword}), page(${page}), rowCount(${rowCount})`;
        try {
            // 키워드를 공백으로 분리한다
            let keywords = keyword.split(' ');
            // 총 카운트 얻기
            let countQuery = `SELECT 
                COUNT(SEQ) AS PHOTO_COUNT `;

            let query = `SELECT 
                SEQ, IM_CODE, IM_NAME, IM_PROVIDER, IM_UNIT, IM_TYPE, IF(IS_IMDIGITAL_SYNC_S3='Y',IM_URI_DIGITAL,IM_URI) AS IM_URI `;

            let fromWhereQuery = ` FROM 
                TBL_MOA_IMAGE_PRD 
            WHERE 
                IM_TYPE = 1 AND
                IM_STATUS = 'A' AND `;
            if (existBarCode) {
                fromWhereQuery += `((IM_BARCODE != '' OR not IM_BARCODE is null) AND (SUBSTR(IM_BARCODE, 1, 2) = '88')) AND  `;
            }
            if (keywords.length == 1)
                fromWhereQuery += `(IM_TAGS LIKE '%${keyword}%') `;
            else {
                fromWhereQuery += `(IM_TAGS LIKE '%` + keywords.join(`%' AND IM_TAGS LIKE '%`) + `%') `
            }
                // AND TB2.IM_BARCODE  IS NOT NULL`;

            countQuery += fromWhereQuery;
            query = query + fromWhereQuery + 
                `GROUP BY 
                    SEQ                
                ORDER BY 
                    IM_NAME
                LIMIT ${rowCount} OFFSET ${(page - 1) * rowCount}`;
            // console.log(query);
            const [rowsCount, fieldsCount] = await pool.mysqlPool_shuket.query(countQuery, []);
            const [rows, fields] = await pool.mysqlPool_shuket.query(query, []);
            if (rows.length > 0) {
                // console.log("rows.length", rows.length);
                return {
                    count: rowsCount[0].PHOTO_COUNT,
                    rows: rows
                }
            } else {
                // logger.writeLog("info", `${log_base} - No data found`);
                return {
                    count: 0,
                    rows: null
                }
            }
        } catch (error) {
            logger.writeLog("error", `${log_base} \nStacktrace: ${error.stack}`);
            return {
                count: 0,
                rows: null
            }
        }
    }

    static async findPhotosShuketByName(findPhotoJSONArray) {
        const log_base = `models/shuketConnect.findPhotosShuketByName`;
        try {
            let queryArray = [];
            for (let findPhotoJSON of findPhotoJSONArray) {
                queryArray.push(`(SELECT '${findPhotoJSON.name}' AS name, IF(IS_IMDIGITAL_SYNC_S3='Y', IM_URI_DIGITAL, IM_URI) AS IM_URI FROM TBL_MOA_IMAGE_PRD WHERE IM_TYPE = 1 AND IM_STATUS = 'A' AND  IM_TAGS LIKE '%${findPhotoJSON.plainName}%' ORDER BY SEQ DESC LIMIT 1)`);
            }
            let query = queryArray.join(" UNION ");

            // console.log(query)

            const [rows] = await pool.mysqlPool_shuket.query(query, []);
            if (rows.length > 0) {
                return rows
            } else {
                return null;
            }
        } catch (error) {
            logger.writeLog("error", `${log_base} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async getPhotoShuket(barCodes) {
        const log_base = `models/shuketConnect.getPhotoShuket: barCodes(${barCodes})`;
        try {
            let query = `SELECT 
                SEQ, IM_CODE, IM_BARCODE, IM_NAME, IM_PROVIDER, IM_UNIT, IM_TYPE, IF(IS_IMDIGITAL_SYNC_S3='Y',IM_URI_DIGITAL,IM_URI) AS IM_URI  
            FROM 
                TBL_MOA_IMAGE_PRD 
            WHERE 
                IM_TYPE = 1 AND
                IM_STATUS = 'A' AND 
                IM_BARCODE IN (${barCodes})
            ORDER BY 
                IM_BARCODE`;            
            const [rows] = await pool.mysqlPool_shuket.query(query, []);
            logger.writeLog("info", `${log_base} 슈켓 바코드 상품 사진을 검색하여 리턴합니다.`);
            return rows;
        } catch (error) {
            logger.writeLog("error", `${log_base} 슈켓 바코드 상품 사진을 찾을 때 오류가 발생했습니다. \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async getNotiFCMTopic(M_MOA_CODE) {
        let log_base = `models/shuketConnect.getNotiFCMTopic: M_MOA_CODE(${M_MOA_CODE})`;
        try {
            let query = `SELECT 
                    NT_TPC_CODE,
                    NT_TPC_GRP,
                    NT_TPC_NAME
                FROM 
                    TBL_MOA_NOTI_FCM_TOPIC
                WHERE 
                    M_MOA_CODE = ? AND NT_TPC_STATUS = 'A'
                ORDER BY SEQ
            ;`;
            const [rows, fields] = await pool.mysqlPool_shuket.query(query, [M_MOA_CODE]);
            if (rows.length > 0) {
                // console.log("rows.length", rows.length);
                return rows;
            } else {
                // logger.writeLog("info", `${log_base} - No data found`);
                return null;
            }
        } catch (error) {
            logger.writeLog("error", `${log_base} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async getNotiMembers(M_MOA_CODE) {
        let log_base = `models/shuketConnect.getNotiMembers: M_MOA_CODE(${M_MOA_CODE})`;
        try {
            let query = `SELECT 
                    U_ID AS PHONE
                FROM TBL_MOA_APP_USERS
                where 
                    U_STATUS = 'A' AND M_MOA_CODE = ? 
                    AND M_TIME >= STR_TO_DATE(DATE_FORMAT(DATE_ADD(NOW(), INTERVAL -30 DAY), '%Y-%m-%d 00:00:00'), '%Y-%m-%d %T')
                ORDER BY
                    U_ID;`;
            const [rows, fields] = await pool.mysqlPool_shuket.query(query, [M_MOA_CODE]);
            if (rows.length > 0) {
                // console.log("rows.length", rows.length);
                return rows;
            } else {
                // logger.writeLog("info", `${log_base} - No data found`);
                return null;
            }
        } catch (error) {
            logger.writeLog("error", `${log_base} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async sendPush(M_MOA_CODE, NT_MSG_TITLE, NT_MSG_CONTENT, NT_TPC_CODE, NT_MSG_DELI_OPT, NT_MSG_SCHE_DTIME, NT_MSG_LOGO_URL, NT_MSG_IMG_URL) {
        let logBase = `models/shuketConnect.sendPush: M_MOA_CODE(${M_MOA_CODE}), NT_MSG_TITLE(${NT_MSG_TITLE})`;
        // const connection = await pool.mysqlPool_shuket.getConnection(async (conn) => conn);
        const connection = await pool.mysqlPool_rcs.getConnection(async (conn) => conn);
        try {
            await connection.beginTransaction();

            let NT_MSG_CODE = "PU8037163db0b1265050";

            let NT_MSG_UID = "";
            let NT_MSG_ID = "";
            let NT_MSG_DELI_TYPE = "PS";
            let NT_MSG_TMPL_TYPE = "CU";
            let NT_MSG_STATUS = "B";
            let NT_MSG_POS = 'N';
            let NT_CP_OPTION_SEND = 'N';
            let C_ID = 'complex';

            let query = `INSERT INTO TBL_MOA_NOTI_MSG (
                NT_MSG_CODE, M_MOA_CODE, NT_MSG_UID, NT_MSG_ID, NT_MSG_TITLE, NT_MSG_CONTENT, NT_MSG_DELI_TYPE, NT_TPC_CODE, 
                NT_MSG_DELI_OPT, NT_MSG_SCHE_DTIME, NT_MSG_TMPL_TYPE, NT_MSG_LOGO_URL, NT_MSG_IMG_URL, NT_MSG_STATUS,
                NT_MSG_POS, NT_CP_OPTION_SEND, C_ID, C_TIME
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, NOW()
            )`;
            await connection.query(query, [
                NT_MSG_CODE, 
                M_MOA_CODE, 
                NT_MSG_UID, 
                NT_MSG_ID, 
                NT_MSG_TITLE, 
                NT_MSG_CONTENT, 
                NT_MSG_DELI_TYPE, 
                NT_TPC_CODE, 
                NT_MSG_DELI_OPT, 
                NT_MSG_SCHE_DTIME, 
                NT_MSG_TMPL_TYPE,
                NT_MSG_LOGO_URL,
                NT_MSG_IMG_URL,
                NT_MSG_STATUS,
                NT_MSG_POS,
                NT_CP_OPTION_SEND,
                C_ID]);

            query = `INSERT INTO TBL_MOA_NOTI_MSG_HISTORY (
                NT_MSG_CODE, M_MOA_CODE, NT_MSG_UID, NT_MSG_ID, NT_MSG_TITLE, NT_MSG_CONTENT, NT_MSG_DELI_TYPE, NT_TPC_CODE, 
                NT_MSG_DELI_OPT, NT_MSG_SCHE_DTIME, NT_MSG_TMPL_TYPE, NT_MSG_LOGO_URL, NT_MSG_IMG_URL, NT_MSG_STATUS,
                NT_MSG_POS, NT_CP_OPTION_SEND, C_ID, C_TIME, HIS_STATUS
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, NOW(), 'I'
            )`;
            await connection.query(query, [
                NT_MSG_CODE, 
                M_MOA_CODE, 
                NT_MSG_UID, 
                NT_MSG_ID, 
                NT_MSG_TITLE, 
                NT_MSG_CONTENT, 
                NT_MSG_DELI_TYPE, 
                NT_TPC_CODE, 
                NT_MSG_DELI_OPT, 
                NT_MSG_SCHE_DTIME, 
                NT_MSG_TMPL_TYPE,
                NT_MSG_LOGO_URL,
                NT_MSG_IMG_URL,
                NT_MSG_STATUS,
                NT_MSG_POS,
                NT_CP_OPTION_SEND,
                C_ID]);
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return false;
        } finally {
            connection.release();
        }
    }


};
