const logger = require("../../config/logger");
const pool = require("../../config/database");

module.exports = class bannerModel {

    static async list(storeCode, searchType, searchValue, category, status, page, rowCount) {
        let logBase = `models/bannerModel.list: storeCode(${storeCode}), page(${page}) rowCount(${rowCount})`        
        try {
            let countQuery = `SELECT COUNT(seq) AS TOTAL_COUNT FROM tbl_moa_bnr_main WHERE STORE_CODE = '${storeCode}' `;

            let query = `
            SELECT
                seq,
                STORE_CODE,
                M_MOA_CODE,
                T_BNR_CODE,
                T_BNR_THEME,
                T_BNR_NAME,
                T_BNR_IMAGE,
                T_BNR_IMAGE_WD,
                T_BNR_IMAGE_HT,
                T_BNR_PLATFM,
                T_BNR_STATUS,  
                C_ID,
                C_TIME,
                M_ID,
                M_TIME
            FROM
                tbl_moa_bnr_main
            WHERE 
                STORE_CODE = '${storeCode}' `;

            let whereQuery = ""    ;
            if (searchValue.length != 0) {
                whereQuery = ` AND T_BNR_NAME LIKE '%${searchValue}%' `;
            }
            if (category.length != 0) {
                whereQuery += ` AND T_BNR_THEME = ${category} `
            }
            if (status.length != 0) {
                whereQuery += ` AND T_BNR_STATUS = '${status}' `
            } else {
                whereQuery += ` AND (T_BNR_STATUS = 'A' OR T_BNR_STATUS = 'C')`
            }

            countQuery += whereQuery;
            query += whereQuery + `
            ORDER BY 
                C_TIME DESC
            LIMIT 
                ${rowCount} OFFSET ${(page - 1) * rowCount}`;

            // console.log(query)
            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, []);
            const [rows, fields] = await pool.mysqlPool.query(query, []);
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

    static async create(storeCode, category, name, image, status, C_ID) {
        let logBase = `models/bannerModel.create: storeCode(${storeCode}) category(${category}), status(${status}), name(${name})`;
        try {
            let codeQuery = 'SELECT IFNULL(MAX(seq), 0) AS codeCount FROM tbl_moa_bnr_main';
            const [rowsCode, fieldsCode] = await pool.mysqlPool.query(codeQuery, []);

            let bannerCode = 'BN' + String(rowsCode[0].codeCount + 1).padStart(6, "0");

            let query = `
            INSERT INTO tbl_moa_bnr_main (
                STORE_CODE,
                M_MOA_CODE,
                T_BNR_CODE,
                T_BNR_THEME,
                T_BNR_NAME,
                T_BNR_IMAGE,
                T_BNR_IMAGE_WD,
                T_BNR_IMAGE_HT,
                T_BNR_PLATFM,
                T_BNR_STATUS,                
                C_ID,
                C_TIME,
                M_ID,
                M_TIME
            ) VALUES (
                ?,
                "",
                ?,
                ?,
                ?,
                ?,
                0,
                0,
                'A',
                ?,
                ?,
                NOW(),
                ?,
                NOW()
            )`;

            const [rows, fields] = await pool.mysqlPool.query(query, [
                storeCode,
                bannerCode,
                category,
                name,
                image,
                status,
                C_ID,
                C_ID
            ]);
            // logger.writeLog("info", `${logBase} - created`);
            return rows.insertId;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }            
    }

    static async changeStatus(bannerCode, status, M_ID) {            
        let logBase = `models/bannerModel.changeStatus: bannerCode(${bannerCode}), status(${status})`;
        try {
            let query = 'UPDATE tbl_moa_bnr_main SET T_BNR_STATUS = ?, M_ID = ?, M_TIME = NOW() WHERE T_BNR_CODE = ?';

            const [rows, fields] = await pool.mysqlPool.query(query, [status, M_ID, bannerCode]);
            // logger.writeLog("info", `${logBase} - updated`);
            return true;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }            
    }

    static async listNotUse(storeCode, page, rowCount) {
        let logBase = `models/bannerModel.listNotUse: storeCode(${storeCode}), page(${page}) rowCount(${rowCount})`
        try {
            let countQuery = `SELECT 
                COUNT(seq) AS TOTAL_COUNT 
            FROM 
                tbl_moa_bnr_main                
            WHERE 
                STORE_CODE = '${storeCode}' AND T_BNR_STATUS = 'A'
                AND T_BNR_CODE NOT IN (SELECT T_BNR_CODE FROM tbl_moa_bnr_url_builder WHERE STORE_CODE = '${storeCode}')`;

            let query = `
            SELECT
                seq,
                STORE_CODE,
                M_MOA_CODE,
                T_BNR_CODE,
                T_BNR_THEME,
                T_BNR_NAME,
                T_BNR_IMAGE,
                T_BNR_IMAGE_WD,
                T_BNR_IMAGE_HT,
                T_BNR_PLATFM,
                T_BNR_STATUS,
                C_ID,
                C_TIME,
                M_ID,
                M_TIME
            FROM
                tbl_moa_bnr_main
            WHERE 
                STORE_CODE = '${storeCode}' 
                AND T_BNR_STATUS = 'A' 
                AND T_BNR_CODE NOT IN (SELECT T_BNR_CODE FROM tbl_moa_bnr_url_builder WHERE STORE_CODE = '${storeCode}')
            ORDER BY 
                C_TIME DESC
            LIMIT 
                ${rowCount} OFFSET ${(page - 1) * rowCount}`;


            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, []);
            const [rows, fields] = await pool.mysqlPool.query(query, []);
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

    static async listUse(storeCode) {
        let logBase = `models/bannerModel.listUse: storeCode(${storeCode})`
        try {
            let query = `
            SELECT
                mbn.seq,
                mbn.STORE_CODE,
                mbn.M_MOA_CODE,
                mbn.T_BNR_CODE,
                mbn.T_BNR_THEME,
                mbn.T_BNR_NAME,
                mbn.T_BNR_IMAGE,
                mbn.T_BNR_IMAGE_WD,
                mbn.T_BNR_IMAGE_HT,
                mbn.T_BNR_PLATFM,
                mbn.T_BNR_STATUS,
                mbn.C_ID,
                mbn.C_TIME,
                mbn.M_ID,
                mbn.M_TIME,
                mbb.T_BUB_SDATE,
                mbb.T_BUB_EDATE,
                mbb.STT
            FROM
                tbl_moa_bnr_main mbn
                INNER JOIN tbl_moa_bnr_url_builder mbb ON mbb.T_BNR_CODE = mbn.T_BNR_CODE
            WHERE 
                mbn.STORE_CODE = '${storeCode}' 
                AND mbn.T_BNR_STATUS = 'A' 
            ORDER BY 
                STT`;

            const [rows, fields] = await pool.mysqlPool.query(query, []);
            if (rows.length > 0) {
                // logger.writeLog("info", `${logBase} - ${rows.length} rows return`);
                return {
                    rows: rows,
                };
            } else {
                // logger.writeLog("info", `${logBase} - No data found`);
                return {
                    rows: rows,
                };
            }

        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async listUseShop(storeCode) {
        const logBase = `models/mart.getBanners_Builder: storeCode(${storeCode})`;
        try 
        {
            let query = `
            SELECT 
                T_BNR_IMAGE, T_BNR_IMAGE_WD, T_BNR_IMAGE_HT, T_BUB_SCH_STATUS, T_BUB_SDATE, T_BUB_EDATE
            FROM
                tbl_moa_bnr_main
                INNER JOIN tbl_moa_bnr_url_builder ON tbl_moa_bnr_url_builder.T_BNR_CODE = tbl_moa_bnr_main.T_BNR_CODE
            WHERE
            tbl_moa_bnr_url_builder.STORE_CODE = ? AND T_BNR_STATUS = 'A'
                AND ((T_BUB_SCH_STATUS = 'N') 
                OR (T_BUB_SCH_STATUS = 'U' OR T_BUB_SCH_STATUS = 'C') AND (date_format(T_BUB_SDATE, '%Y%m%d') <= date_format(now(), '%Y%m%d') AND date_format(T_BUB_EDATE, '%Y%m%d') >= date_format(now(), '%Y%m%d')))
            ORDER BY
            tbl_moa_bnr_url_builder.STT;
            `;            
            const [rows, fields] = await pool.mysqlPool.query(query, [storeCode]);
            // console.log(rows)
            if (rows.length > 0) 
                return rows;
            else {
                // logger.writeLog("info", `${logBase} - No data found`);
                return null;
            }                
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async setUse(storeCode, bannerCode, C_ID) {            
        let logBase = `models/bannerModel.setUse: bannerCode(${bannerCode}), storeCode(${storeCode})`;
        try {
            let STTquery = `SELECT IFNULL(MAX(STT), 0) AS STT FROM tbl_moa_bnr_url_builder WHERE STORE_CODE = ?`;
            const [rowsSTT, fieldsSTT] = await pool.mysqlPool.query(STTquery, [storeCode]);
            let STT = rowsSTT[0].STT + 1;

            let query = `
                INSERT INTO tbl_moa_bnr_url_builder (
                    STORE_CODE,
                    M_MOA_CODE,
                    T_BNR_CODE,
                    T_BUB_SCH_STATUS,
                    T_BUB_SDATE,
                    T_BUB_EDATE,
                    STT,
                    C_TIME,
                    C_ID
                ) VALUES (
                    ?,
                    '',
                    ?,
                    'C',
                    NOW(),
                    NOW(),
                    ?,
                    NOW(),
                    ?                    
                )
            `;

            const [rows, fields] = await pool.mysqlPool.query(query, [storeCode, bannerCode, STT, C_ID]);
            // logger.writeLog("info", `${logBase} - updated`);
            return true;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }            
    }

    static async setNotUse(storeCode, bannerCode, C_ID) {            
        let logBase = `models/bannerModel.setNotUse: bannerCode(${bannerCode}), storeCode(${storeCode})`;
        try {
            // 삭제
            let query = `DELETE FROM tbl_moa_bnr_url_builder WHERE STORE_CODE = ? AND T_BNR_CODE = ?`;
            const [rows, fields] = await pool.mysqlPool.query(query, [storeCode, bannerCode]);

            // 순서 재정리
            query = `
            UPDATE
                tbl_moa_bnr_url_builder
            SET
                STT = (@sortnum:=@sortnum+1)
            WHERE
                STORE_CODE = ? AND
                (@sortnum:=0)>=0 
            ORDER BY
                STT ASC`
            await pool.mysqlPool.query(query, [storeCode]);

            // logger.writeLog("info", `${logBase} - updated`);
            return true;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return false;
        }            
    }

    static async setAllUseDate(storeCode, sdate, edate, C_ID) {            
        let logBase = `models/bannerModel.setAllUseDate: storeCode(${storeCode}), sdate(${sdate}), edate(${edate}), C_ID(${C_ID})`;
        try {
            let query = `
            UPDATE
                tbl_moa_bnr_url_builder
            SET
                T_BUB_SDATE = ?, T_BUB_EDATE = ?, M_ID = ?, M_TIME = NOW()
            WHERE
                STORE_CODE = ?`
            await pool.mysqlPool.query(query, [sdate, edate, C_ID, storeCode]);

            // logger.writeLog("info", `${logBase} - updated`);
            return true;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return false;
        }            
    }

    static async changeDate(bannerCode, type, value) {            
        let logBase = `models/bannerModel.changeDate: bannerCode(${bannerCode}), type(${type}), value(${value})`;
        try {
            let query = `
            UPDATE
                tbl_moa_bnr_url_builder
            SET
                ${type == 'SDATE' ? 'T_BUB_SDATE = ?' : ' T_BUB_EDATE = ? '}
            WHERE
                T_BNR_CODE = ?`
            await pool.mysqlPool.query(query, [value, bannerCode]);

            // logger.writeLog("info", `${logBase} - updated`);
            return true;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return false;
        }            
    }
    
    static async moveUp(storeCode, bannerCode, stt) {            
        let logBase = `models/bannerModel.moveUp: storeCode(${storeCode}), bannerCode(${bannerCode}), stt(${stt})`;
        const connection = await pool.mysqlPool.getConnection(async conn => conn);           
        try {

            let prv_T_BNR_CODE;
            // 현재 배너보다 1개 순서가 작은 배너의 code를 얻는다
            let query = `SELECT T_BNR_CODE FROM tbl_moa_bnr_url_builder WHERE STORE_CODE = ? AND STT = ?`;
            const [rowsPrv, fieldsPrv] = await pool.mysqlPool.query(query, [storeCode, parseInt(stt) - 1]); 
            if (rowsPrv.length == 1) {
                prv_T_BNR_CODE = rowsPrv[0].T_BNR_CODE;
            } else {
                return false;
            }

            //트랜젝션 시작
            await connection.beginTransaction();

            // 현재 배너의 순번을 하나 올린다
            query = `UPDATE tbl_moa_bnr_url_builder SET STT = STT - 1 WHERE T_BNR_CODE = ?`;
            await pool.mysqlPool.query(query, [bannerCode]);

            // 이전 배너의 순번을 하나 올린다
            query = `UPDATE tbl_moa_bnr_url_builder SET STT = STT + 1 WHERE T_BNR_CODE = ?`;
            await pool.mysqlPool.query(query, [prv_T_BNR_CODE]);

            // logger.writeLog("info", `${logBase} - updated`);
            connection.commit();
            return true;
        } catch (error) {
            connection.rollback();
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return false;
        } finally {
            connection.release();
        }
    }

    static async moveDown(storeCode, bannerCode, stt) {            
        let logBase = `models/bannerModel.moveUp: storeCode(${storeCode}), bannerCode(${bannerCode}), stt(${stt})`;
        const connection = await pool.mysqlPool.getConnection(async conn => conn);           
        try {

            let next_T_BNR_CODE;
            // 현재 배너보다 1개 순서가 큰 배너의 code를 얻는다
            let query = `SELECT T_BNR_CODE FROM tbl_moa_bnr_url_builder WHERE STORE_CODE = ? AND STT = ?`;
            const [rowsNxt, fieldsNxt] = await pool.mysqlPool.query(query, [storeCode, parseInt(stt) + 1]); 
            // console.log(rowsNxt.length)
            if (rowsNxt.length == 1) {
                next_T_BNR_CODE = rowsNxt[0].T_BNR_CODE;
            } else {
                return false;
            }

            //트랜젝션 시작
            await connection.beginTransaction();

            // 현재 배너의 순번을 하나 증가
            query = `UPDATE tbl_moa_bnr_url_builder SET STT = STT + 1 WHERE T_BNR_CODE = ?`;
            await pool.mysqlPool.query(query, [bannerCode]);

            // 이전 배너의 순번을 하나 감소
            query = `UPDATE tbl_moa_bnr_url_builder SET STT = STT - 1 WHERE T_BNR_CODE = ?`;
            await pool.mysqlPool.query(query, [next_T_BNR_CODE]);

            // logger.writeLog("info", `${logBase} - updated`);
            connection.commit();
            return true;
        } catch (error) {
            connection.rollback();
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return false;
        } finally {
            connection.release();
        }
    }
}