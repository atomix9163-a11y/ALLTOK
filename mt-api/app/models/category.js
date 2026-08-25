const logger = require("../../config/logger");
const pool = require("../../config/database");

module.exports = class categoryModel {

    static async list(store_code, depth, CTGRY_LARGE_NO, CTGRY_MEDIUM_NO) {
        let logBase = `models/categoryModel.categoryList: store_code(${store_code}), depth(${depth}), CTGRY_LARGE_NO(${CTGRY_LARGE_NO}). CTGRY_MEDIUM_NO(${CTGRY_MEDIUM_NO})`
        try {
            let query = `
            SELECT 
                SEQ,
                STORE_CODE,
                CTGRY_SEQNO,
                CTGRY_LARGE_NO,
                CTGRY_MEDIUM_NO,
                CTGRY_SMALL_NO,
                CTGRY_NAME,
                RGST_DTM,
                UPDT_DTM,
                CTGRY_DIV_CODE,
                CTGRY_ORDER,
                CTGRY_STATE
            FROM 
                tbl_mart_ctgry
            WHERE
                CTGRY_STATE = 1
                AND STORE_CODE = ?`
            if (depth == 0) {
                query += `
                    AND CTGRY_MEDIUM_NO = 0
                    AND CTGRY_SMALL_NO = 0`;
            } else if (depth == 1) {
                query += `
                    AND CTGRY_LARGE_NO = ${CTGRY_LARGE_NO}
                    AND CTGRY_MEDIUM_NO != 0
                    AND CTGRY_SMALL_NO = 0`;
            } else {
                query += `
                    AND CTGRY_LARGE_NO = ${CTGRY_LARGE_NO}
                    AND CTGRY_MEDIUM_NO = ${CTGRY_MEDIUM_NO}
                    AND CTGRY_SMALL_NO != 0`;
            }
            query += ` ORDER BY 
                CTGRY_ORDER ASC`;

            // console.log(query, logBase)
            const [rows, fields] = await pool.mysqlPool.query(query, [store_code]);
            // logger.writeLog("info", `${logBase} - ${rows.length} rows return`);
            return rows
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }
 
    static async add1st(store_code, categoryTitle) {
        let logBase = `models/categoryModel.add1st: store_code(${store_code}), categoryTitle(${categoryTitle})`
        try {
            // 코드를 얻는다
            let query_seq = 'SELECT (IFNULL(MAX(CTGRY_SEQNO), 0) + 1) AS MAXSEQ FROM tbl_mart_ctgry';
            const [rowsSeq, fieldsSeq] = await pool.mysqlPool.query(query_seq, []);
            let CTGRY_SEQ = rowsSeq[0].MAXSEQ;

            // 카테고리 번호를 얻는다
            let queryNo = `SELECT IFNULL(MAX(CTGRY_LARGE_NO), 0) + 1 AS CTGRY_NO FROM tbl_mart_ctgry WHERE store_code = '${store_code}' AND CTGRY_LARGE_NO != 0 AND CTGRY_MEDIUM_NO = 0 AND CTGRY_SMALL_NO = 0`
            const [rowsNo, fieldsNo] = await pool.mysqlPool.query(queryNo, []);
            let CTGRY_NO = rowsNo[0].CTGRY_NO;

            // 순번을 얻는다
            let queryOrder = `SELECT IFNULL(MAX(CTGRY_ORDER), 0) + 1 AS MAXORDER FROM tbl_mart_ctgry WHERE store_code = '${store_code}' AND CTGRY_LARGE_NO != 0 AND CTGRY_MEDIUM_NO = 0 AND CTGRY_SMALL_NO = 0 AND CTGRY_STATE = 1`
            const [rowsOrder, fieldsOrder] = await pool.mysqlPool.query(queryOrder, []);
            let MAXORDER = rowsOrder[0].MAXORDER;
            
            let query = `INSERT INTO tbl_mart_ctgry 
                (
                    STORE_CODE,
                    CTGRY_SEQNO,
                    CTGRY_LARGE_NO,
                    CTGRY_MEDIUM_NO,
                    CTGRY_SMALL_NO,
                    CTGRY_NAME,
                    RGST_DTM,
                    UPDT_DTM,
                    CTGRY_DIV_CODE,
                    CTGRY_ORDER,
                    CTGRY_STATE
                ) values (
                    ?,
                    ?,
                    ?,
                    0,
                    0,
                    ?,
                    NOW(),
                    NOW(),
                    1,
                    ?,
                    1
                )`;
            const [rows, fields] = await pool.mysqlPool.query(query, [store_code, CTGRY_SEQ, CTGRY_NO, categoryTitle, MAXORDER]);

            return rows.insertId;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return "";
        }
    }

    static async add2nd(store_code, CTGRY_LARGE_NO, categoryTitle) {
        let logBase = `models/categoryModel.add1st: store_code(${store_code}), CTGRY_LARGE_NO(${CTGRY_LARGE_NO}), categoryTitle(${categoryTitle})`
        try {
            // 코드를 얻는다
            let query_seq = 'SELECT (IFNULL(MAX(CTGRY_SEQNO), 0) + 1) AS MAXSEQ FROM tbl_mart_ctgry';
            const [rowsSeq, fieldsSeq] = await pool.mysqlPool.query(query_seq, []);
            let CTGRY_SEQ = rowsSeq[0].MAXSEQ;

            // 카테고리 번호를 얻는다
            let queryNo = `SELECT IFNULL(MAX(CTGRY_MEDIUM_NO), 0) + 1 AS CTGRY_NO FROM tbl_mart_ctgry WHERE store_code = '${store_code}' AND CTGRY_LARGE_NO = ${CTGRY_LARGE_NO} AND CTGRY_MEDIUM_NO !=0 AND CTGRY_SMALL_NO = 0`
            const [rowsNo, fieldsNo] = await pool.mysqlPool.query(queryNo, []);
            let CTGRY_NO = rowsNo[0].CTGRY_NO;

            // 순번을 얻는다
            let queryOrder = `SELECT IFNULL(MAX(CTGRY_ORDER), 0) + 1 AS MAXORDER FROM tbl_mart_ctgry WHERE store_code = '${store_code}' AND CTGRY_LARGE_NO = ${CTGRY_LARGE_NO} AND CTGRY_MEDIUM_NO !=0 AND CTGRY_SMALL_NO = 0 AND CTGRY_STATE = 1`
            const [rowsOrder, fieldsOrder] = await pool.mysqlPool.query(queryOrder, []);
            let MAXORDER = rowsOrder[0].MAXORDER;
            
            let query = `INSERT INTO tbl_mart_ctgry 
                (
                    STORE_CODE,
                    CTGRY_SEQNO,
                    CTGRY_LARGE_NO,
                    CTGRY_MEDIUM_NO,
                    CTGRY_SMALL_NO,
                    CTGRY_NAME,
                    RGST_DTM,
                    UPDT_DTM,
                    CTGRY_DIV_CODE,
                    CTGRY_ORDER,
                    CTGRY_STATE
                ) values (
                    ?,
                    ?,
                    ?,
                    ?,
                    0,
                    ?,
                    NOW(),
                    NOW(),
                    1,
                    ?,
                    1
                )`;
            const [rows, fields] = await pool.mysqlPool.query(query, [store_code, CTGRY_SEQ, CTGRY_LARGE_NO, CTGRY_NO, categoryTitle, MAXORDER]);

            return rows.insertId;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return "";
        }
    }

    static async add3rd(store_code, CTGRY_LARGE_NO, CTGRY_MEDIUM_NO, categoryTitle) {
        let logBase = `models/categoryModel.add1st: store_code(${store_code}), CTGRY_LARGE_NO(${CTGRY_LARGE_NO}), CTGRY_MEDIUM_NO(${CTGRY_MEDIUM_NO}), categoryTitle(${categoryTitle})`
        try {
            // 코드를 얻는다
            let query_seq = 'SELECT (IFNULL(MAX(CTGRY_SEQNO), 0) + 1) AS MAXSEQ FROM tbl_mart_ctgry';
            const [rowsSeq, fieldsSeq] = await pool.mysqlPool.query(query_seq, []);
            let CTGRY_SEQ = rowsSeq[0].MAXSEQ;

            // 카테고리 번호를 얻는다
            let queryNo = `SELECT IFNULL(MAX(CTGRY_SMALL_NO), 0) + 1 AS CTGRY_NO FROM tbl_mart_ctgry WHERE store_code = '${store_code}' AND CTGRY_LARGE_NO = ${CTGRY_LARGE_NO} AND CTGRY_MEDIUM_NO = ${CTGRY_MEDIUM_NO} AND CTGRY_SMALL_NO != 0`
            const [rowsNo, fieldsNo] = await pool.mysqlPool.query(queryNo, []);
            let CTGRY_NO = rowsNo[0].CTGRY_NO;

            // 순번을 얻는다
            let queryOrder = `SELECT IFNULL(MAX(CTGRY_ORDER), 0) + 1 AS MAXORDER FROM tbl_mart_ctgry WHERE store_code = '${store_code}' AND CTGRY_LARGE_NO = ${CTGRY_LARGE_NO} AND CTGRY_MEDIUM_NO = ${CTGRY_MEDIUM_NO} AND CTGRY_SMALL_NO != 0 AND CTGRY_STATE = 1`
            const [rowsOrder, fieldsOrder] = await pool.mysqlPool.query(queryOrder, []);
            let MAXORDER = rowsOrder[0].MAXORDER;
            
            let query = `INSERT INTO tbl_mart_ctgry 
                (
                    STORE_CODE,
                    CTGRY_SEQNO,
                    CTGRY_LARGE_NO,
                    CTGRY_MEDIUM_NO,
                    CTGRY_SMALL_NO,
                    CTGRY_NAME,
                    RGST_DTM,
                    UPDT_DTM,
                    CTGRY_DIV_CODE,
                    CTGRY_ORDER,
                    CTGRY_STATE
                ) values (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    NOW(),
                    NOW(),
                    1,
                    ?,
                    1
                )`;
            const [rows, fields] = await pool.mysqlPool.query(query, [store_code, CTGRY_SEQ, CTGRY_LARGE_NO, CTGRY_MEDIUM_NO, CTGRY_NO, categoryTitle, MAXORDER]);

            return rows.insertId;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return "";
        }
    }

    static async update(CTGRY_SEQNO, categoryTitle) {
        let logBase = `models/categoryModel.update: CTGRY_SEQNO(${CTGRY_SEQNO}), categoryTitle(${categoryTitle})`
        try {
            let query = `UPDATE tbl_mart_ctgry SET CTGRY_NAME = ? WHERE CTGRY_SEQNO = ?`;
            const [rows, fields] = await pool.mysqlPool.query(query, [categoryTitle, CTGRY_SEQNO]);

            // logger.writeLog("error", `${logBase}`);
            return 0;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async remove(CTGRY_SEQNO) {
        let logBase = `models/categoryModel.remove: CTGRY_SEQNO(${CTGRY_SEQNO})`
        try {
            let query = `UPDATE tbl_mart_ctgry SET CTGRY_STATE = 0 WHERE CTGRY_SEQNO = ?`;
            const [rows, fields] = await pool.mysqlPool.query(query, [CTGRY_SEQNO]);

            // logger.writeLog("error", `${logBase}`);
            return 0;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async find(store_code, searchName, depth, CTGRY_LARGE_NO = 0, CTGRY_MEDIUM_NO = 0) {
        let logBase = `models/categoryModel.find: store_code(${store_code}), depth(${depth}), searchName(${searchName})`
        try {            
            if (depth == 0) {
                let query = `SELECT CTGRY_SEQNO, CTGRY_LARGE_NO AS CTGRY_CODE FROM tbl_mart_ctgry 
                    WHERE STORE_CODE = ? AND CTGRY_MEDIUM_NO = 0 AND CTGRY_SMALL_NO = 0 AND CTGRY_NAME = ?`;
                const [rows, fields] = await pool.mysqlPool.query(query, [store_code, searchName]);
                if (rows.length > 0) {
                    return {
                        CTGRY_SEQNO: rows[0].CTGRY_SEQNO,
                        CTGRY_CODE : rows[0].CTGRY_CODE
                    }
                }
            } else if (depth == 1) {
                let query = `SELECT CTGRY_SEQNO, CTGRY_MEDIUM_NO AS CTGRY_CODE FROM tbl_mart_ctgry 
                    WHERE STORE_CODE = ? AND CTGRY_LARGE_NO = ? AND CTGRY_SMALL_NO = 0 AND CTGRY_NAME = ?`;
                const [rows, fields] = await pool.mysqlPool.query(query, [store_code, CTGRY_LARGE_NO, searchName]);
                if (rows.length > 0) {
                    return {
                        CTGRY_SEQNO: rows[0].CTGRY_SEQNO,
                        CTGRY_CODE : rows[0].CTGRY_CODE
                    }
                }
            } else if (depth == 1) {
                let query = `SELECT CTGRY_SEQNO, CTGRY_SMALL_NO AS CTGRY_CODE FROM tbl_mart_ctgry 
                    WHERE STORE_CODE = ? AND CTGRY_LARGE_NO = ? AND CTGRY_MEDIUM_NO = ? AND CTGRY_SMALL_NO !=0 AND CTGRY_NAME = ?`;
                const [rows, fields] = await pool.mysqlPool.query(query, [store_code, CTGRY_LARGE_NO, CTGRY_MEDIUM_NO, searchName]);
                if (rows.length > 0) {
                    return {
                        CTGRY_SEQNO: rows[0].CTGRY_SEQNO,
                        CTGRY_CODE : rows[0].CTGRY_CODE
                    }
                }
            }
            return {
                CTGRY_SEQNO: 0,
                CTGRY_CODE : 0
            }
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return {
                CTGRY_SEQNO: 0,
                CTGRY_CODE : 0
            }

        }
    }

    static async moveUp(storeCode, categoryCode, order, depth) {
        let logBase = `models/categoryModel.moveUp: categoryCode(${categoryCode}), storeCode(${storeCode}), order(${order}), depth(${depth})`
        const connection = await pool.mysqlPool.getConnection(async conn => conn);
        try {
            logger.writeLog("info", `${logBase} 카테코리 순서 변경 UP`);

            let query = "";

            // 현재 카테고리 바로 위의 카테고리 코드를 얻는다
            query = `SELECT CTGRY_SEQNO FROM tbl_mart_ctgry WHERE STORE_CODE = ? AND CTGRY_ORDER = ? AND CTGRY_MEDIUM_NO = 0 AND CTGRY_SMALL_NO = 0 AND CTGRY_STATE = 1`;
            const [rows] =  await pool.mysqlPool.query(query, [storeCode, order - 1]);
            // console.log(rows[0].CTGRY_SEQNO)

            connection.beginTransaction();
            // 바로 위 전단지 순서를 현재 전단지 순서로 바꾸고, 현재 전단지를 -1로 업데이트한다
            query = `UPDATE tbl_mart_ctgry SET CTGRY_ORDER = ? WHERE CTGRY_SEQNO = ?`;
            await connection.query(query, [order - 1, categoryCode]);
            await connection.query(query, [order, rows[0].CTGRY_SEQNO]);

            await connection.commit();
            return categoryCode;
        } catch (error) {
            await connection.rollback();
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        } finally {
            connection.release();
        }
    }

    static async moveDown(storeCode, categoryCode, order, depth) {
        let logBase = `models/categoryModel.moveDown: categoryCode(${categoryCode}), storeCode(${storeCode}), order(${order}), depth(${depth})`
        const connection = await pool.mysqlPool.getConnection(async conn => conn);
        try {
            logger.writeLog("info", `${logBase} 카테코리 순서 변경 moveDown`);

            let query = "";

            // 현재 카테고리 바로 아래의 카테고리 코드를 얻는다
            query = `SELECT CTGRY_SEQNO FROM tbl_mart_ctgry WHERE STORE_CODE = ? AND CTGRY_ORDER = ? AND CTGRY_MEDIUM_NO = 0 AND CTGRY_SMALL_NO = 0 AND CTGRY_STATE = 1`;
            const [rows] =  await pool.mysqlPool.query(query, [storeCode, order + 1]);
            // console.log(query, rows[0].CTGRY_SEQNO)

            connection.beginTransaction();
            // 바로 위 전단지 순서를 현재 전단지 순서로 바꾸고, 현재 전단지를 -1로 업데이트한다
            query = `UPDATE tbl_mart_ctgry SET CTGRY_ORDER = ? WHERE CTGRY_SEQNO = ?`;
            await connection.query(query, [order + 1, categoryCode]);
            await connection.query(query, [order, rows[0].CTGRY_SEQNO]);

            await connection.commit();
            return categoryCode;
        } catch (error) {
            await connection.rollback();
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        } finally {
            connection.release();
        }
    }
}