const logger = require("../../config/logger");
const pool = require("../../config/database");

module.exports = class productModel {

    // static async list(store_code, searchType, searchValue, status, CTGRY_LARGE_NO, CTGRY_MEDIUM_NO, CTGRY_SMALL_NO, startDate, endDate, page, rowCount) {
    //     let logBase = `models/productsModel.list: store_code(${store_code}), page(${page}), rowCount(${rowCount})`
    //     try {
    //         let queryCount = `SELECT COUNT(SEQ) AS TOTAL_COUNT FROM tbl_moa_prd_main`;

    //         let query = `SELECT 
    //             SEQ,
    //             STORE_CODE,
    //             P_CODE,
    //             P_NAME,
    //             P_CAT_CODE,
    //             P_CAT,
    //             P_MCAT_CODE,
    //             P_MCAT,
    //             P_CAT_SEQNO,
    //             P_CAT_SUB,
    //             P_UNIT,
    //             P_BARCODE,
    //             P_LIST_PRICE,
    //             P_PROVIDER,
    //             P_SALE_PRICE,
    //             P_IMG,
    //             P_TAGS,
    //             P_MIN_STOCK,
    //             P_STOCK,
    //             P_STATUS,
    //             C_TIME,
    //             C_ID,
    //             M_TIME,
    //             M_ID                
    //         FROM 
    //             tbl_moa_prd_main`;
            
    //         let queryWhere = `
    //         WHERE
    //             STORE_CODE = ? AND P_STATUS IN (${"'" + status.split(",").join("','") + "'"}) `

    //         if (startDate != "") {
    //             queryWhere += ` AND (C_TIME BETWEEN '${startDate} 00:00:00)' AND '${endDate} 23:59:59') `
    //         }
    //         if (CTGRY_LARGE_NO != '0') {
    //             queryWhere += ` AND P_CAT_CODE = ${CTGRY_LARGE_NO} `
    //         }
    //         if (CTGRY_MEDIUM_NO != '0') {
    //             queryWhere += ` AND P_MCAT_CODE = ${CTGRY_MEDIUM_NO} `
    //         }
    //         if (CTGRY_SMALL_NO != "0") {
    //             queryWhere += ` AND P_CAT_SUB = '${CTGRY_SMALL_NO}' `
    //         }
    //         if (searchValue != "") {
    //             if (searchType == "name") {
    //                 queryWhere += ` AND P_NAME LIKE '%${searchValue}%' `
    //             } else if (searchType == "pcode") {
    //                 queryWhere += ` AND P_CODE = '${searchValue}' `
    //             } else {
    //                 queryWhere += ` AND P_BARCODE = '${searchValue}' `
    //             }
    //         }

    //         let limitQuery = `
    //         ORDER BY 
    //             P_NAME`;
    //         if (page > 0) {
    //             limitQuery += ` LIMIT ${rowCount} OFFSET ${(page - 1) * rowCount}`;
    //         }

    //         queryCount += queryWhere;
    //         query += (queryWhere + limitQuery);

    //         console.log(query)
            
    //         const [rowsCount, fieldsCount] = await pool.mysqlPool.query(queryCount, [store_code]);
    //         const [rows, fields] = await pool.mysqlPool.query(query, [store_code]);

    //         console.log(rowsCount[0].TOTAL_COUNT)
    //         if (rows.length > 0) {
    //             // logger.writeLog("info", `${logBase} - ${rows.length} rows return`);
    //             return {
    //                 count: rowsCount[0].TOTAL_COUNT,
    //                 rows: rows,
    //             };
    //         } else {
    //             // logger.writeLog("info", `${logBase} - No data found`);
    //             return {
    //                 count: 0,
    //                 rows: rows,
    //             };
    //         }

    //     } catch (error) {
    //         logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
    //         return {
    //             count: 0,
    //             rows: null,
    //         };
    //     }
    // }
    
    // static async listSelected(SEQs) {
    //     let logBase = `models/productsModel.listSelected: SEQs(${SEQs})`
    //     try {
    //         let query = `SELECT 
    //             SEQ,
    //             STORE_CODE,
    //             P_CODE,
    //             P_NAME,
    //             P_CAT_CODE,
    //             P_CAT,
    //             P_MCAT_CODE,
    //             P_MCAT,
    //             P_CAT_SEQNO,
    //             P_CAT_SUB,
    //             P_UNIT,
    //             P_BARCODE,
    //             P_LIST_PRICE,
    //             P_PROVIDER,
    //             P_SALE_PRICE,
    //             P_IMG,
    //             P_TAGS,
    //             P_MIN_STOCK,
    //             P_STOCK,
    //             P_STATUS,
    //             C_TIME,
    //             C_ID,
    //             M_TIME,
    //             M_ID                
    //         FROM 
    //             tbl_moa_prd_main
    //         WHERE
    //             SEQ IN (${SEQs})
    //         ORDER BY
    //             P_NAME`;

    //         const [rows, fields] = await pool.mysqlPool.query(query, []);
    //         if (rows.length > 0) {
    //             // logger.writeLog("info", `${logBase} - ${rows.length} rows return`);
    //             return {
    //                 count: rows.length,
    //                 rows: rows,
    //             };
    //         } else {
    //             // logger.writeLog("info", `${logBase} - No data found`);
    //             return {
    //                 count: 0,
    //                 rows: rows,
    //             };
    //         }

    //     } catch (error) {
    //         logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
    //         return {
    //             count: 0,
    //             rows: null,
    //         };
    //     }
    // }

    // static async listForMobile(store_code, searchValue, CTGRY_LARGE_NO, CTGRY_MEDIUM_NO, CTGRY_SMALL_NO, order, page, rowCount) {
    //     // console.log(store_code, searchValue, CTGRY_LARGE_NO, CTGRY_MEDIUM_NO, CTGRY_SMALL_NO, page, rowCount)
    //     let logBase = `models/productsModel.listForMobile: store_code(${store_code}), searchValue(${searchValue}) page(${page}), rowCount(${rowCount})`
    //     try {
    //         let query = `SELECT 
    //             SEQ,
    //             STORE_CODE,
    //             P_CODE,
    //             P_NAME,
    //             P_CAT_CODE,
    //             P_CAT,
    //             P_MCAT_CODE,
    //             P_MCAT,
    //             P_CAT_SEQNO,
    //             P_CAT_SUB,
    //             P_UNIT,
    //             P_BARCODE,
    //             P_LIST_PRICE,
    //             P_PROVIDER,
    //             P_SALE_PRICE,
    //             IF(P_SALE_PRICE = 0, P_LIST_PRICE, P_SALE_PRICE) AS SALE_PRICE,
    //             P_IMG,
    //             P_TAGS,
    //             P_MIN_STOCK,
    //             P_STOCK,
    //             P_STATUS,
    //             C_TIME,
    //             C_ID,
    //             M_TIME,
    //             M_ID                
    //         FROM 
    //             tbl_moa_prd_main
    //         WHERE
    //             STORE_CODE = ? AND
    //             P_STATUS = 'A'
    //         `
    //         if (CTGRY_LARGE_NO != '0' && CTGRY_LARGE_NO != '') {
    //             query += ` AND P_CAT_CODE = ${CTGRY_LARGE_NO} `
    //         }
    //         if (CTGRY_MEDIUM_NO != '0' && CTGRY_MEDIUM_NO != '') {
    //             query += ` AND P_MCAT_CODE = ${CTGRY_MEDIUM_NO} `
    //         }
    //         if (CTGRY_SMALL_NO != "0" && CTGRY_SMALL_NO != '') {
    //             query += ` AND P_CAT_SEQNO = '${CTGRY_SMALL_NO}' `
    //         }
    //         if (searchValue != "") {
    //             query += ` AND P_NAME LIKE '%${searchValue}%' `
    //         }

    //         query += `
    //         ORDER BY 
    //             ${(order == "new") ? " C_TIME DESC " : (order == "expensive") ? " SALE_PRICE DESC " : (order == "chip") ? " SALE_PRICE ASC " : " P_NAME ASC " }
    //             ${(order != "name") ? " , P_NAME ASC " : "" }
    //         LIMIT 
    //             ${rowCount} OFFSET ${(page - 1) * rowCount}`;

    //         const [rows, fields] = await pool.mysqlPool.query(query, [store_code]);
    //         if (rows.length > 0) {
    //             // logger.writeLog("info", `${logBase} - ${rows.length} rows return`);
    //             return rows
    //         } else {
    //             // logger.writeLog("info", `${logBase} - No data found`);
    //             return rows
    //         }

    //     } catch (error) {
    //         logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
    //         return null;
    //     }
    // }

    // static async setStatus(SEQ, P_STATUS) {
    //     let logBase = `models/setStatus.setStatus: SEQ(${SEQ}), P_STATUS(${P_STATUS})`;
    //     try {
    //         let query = `UPDATE tbl_moa_prd_main SET P_STATUS = ? WHERE SEQ = ?`;
    //         const [rows, fields] = await pool.mysqlPool.query(query, [P_STATUS, SEQ]);
    //         return true;
    //     } catch (error) {
    //         logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
    //         return false;
    //     }
    // }

    // static async setStatusMulti(SEQs, P_STATUS) {
    //     let logBase = `models/setStatus.setStatusMulti: SEQs(${SEQs}), P_STATUS(${P_STATUS})`;
    //     try {
    //         let query = `UPDATE tbl_moa_prd_main SET P_STATUS = ? WHERE SEQ IN (${SEQs})`;
    //         const [rows, fields] = await pool.mysqlPool.query(query, [P_STATUS]);
    //         return true;
    //     } catch (error) {
    //         logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
    //         return false;
    //     }
    // }

    // static async create(store_code, productJSON, C_ID) {
    //     let logBase = `models/productsModel.create: store_code(${store_code}), product(${productJSON.P_NAME})`
    //     try {
    //         // PCODE가 없으면 최대값으로 생성
    //         // console.log("productJSON.P_CODE", productJSON.P_CODE)
    //         if (productJSON.P_CODE == "" || !productJSON.P_CODE) {
    //             let query = 'SELECT (IFNULL(MAX(SEQ), 0) + 1) AS P_CODE FROM tbl_moa_prd_main WHERE STORE_CODE = ?';
    //             const [rows, fields] = await pool.mysqlPool.query(query, [productJSON.STORE_CODE]);
    //             productJSON.P_CODE = rows[0].P_CODE.toString();
    //         }
    //         if (productJSON.P_STOCK == "") { productJSON.P_STOCK = "100"; }
    //         if (productJSON.P_MIN_STOCK == "") { productJSON.P_MIN_STOCK = "100"; }
    //         if (productJSON.P_SALE_PRICE == "") { productJSON.P_SALE_PRICE = productJSON.P_LIST_PRICE; }

    //         let query = `INSERT INTO tbl_moa_prd_main 
    //             (
    //                 STORE_CODE,
    //                 P_CODE,
    //                 P_NAME,
    //                 P_CAT_CODE,
    //                 P_CAT,
    //                 P_MCAT_CODE,
    //                 P_MCAT,
    //                 P_CAT_SEQNO,
    //                 P_CAT_SUB,
    //                 P_UNIT,
    //                 P_BARCODE,
    //                 P_LIST_PRICE,
    //                 P_PROVIDER,
    //                 P_SALE_PRICE,
    //                 P_IMG,
    //                 P_TAGS,
    //                 P_MIN_STOCK,
    //                 P_STOCK,
    //                 C_TIME,
    //                 C_ID,
    //                 M_TIME,
    //                 M_ID,
    //                 P_STATUS
    //             ) values (
    //                 ?,
    //                 ?,
    //                 ?,
    //                 ?,
    //                 ?,
    //                 ?,
    //                 ?,
    //                 ?,
    //                 ?,
    //                 ?,
    //                 ?,
    //                 ?,
    //                 ?,
    //                 ?,
    //                 ?,
    //                 ?,
    //                 ?,
    //                 ?,
    //                 NOW(),
    //                 ?,
    //                 NOW(),
    //                 ?,
    //                 'A'
    //             )`;
    //         const [rows, fields] = await pool.mysqlPool.query(query, [
    //             store_code, 
    //             productJSON.P_CODE,
    //             productJSON.P_NAME,
    //             productJSON.P_CAT_CODE,
    //             productJSON.P_CAT,
    //             productJSON.P_MCAT_CODE,
    //             productJSON.P_MCAT,
    //             productJSON.P_CAT_SEQNO,
    //             productJSON.P_CAT_SUB,
    //             productJSON.P_UNIT,
    //             productJSON.P_BARCODE,
    //             productJSON.P_LIST_PRICE,
    //             productJSON.P_PROVIDER,
    //             productJSON.P_SALE_PRICE,
    //             productJSON.P_IMG,
    //             productJSON.P_TAGS,
    //             productJSON.P_MIN_STOCK,
    //             productJSON.P_STOCK,
    //             C_ID,
    //             C_ID
    //         ]);

    //         return {
    //             STORE_CODE: store_code,
    //             P_CODE: productJSON.P_CODE,
    //             P_NAME: productJSON.P_NAME,
    //             P_CAT_CODE: productJSON.P_CAT_CODE,
    //             P_CAT: productJSON.P_CAT,
    //             P_MCAT_CODE: productJSON.P_MCAT_CODE,
    //             P_MCAT: productJSON.P_MCAT,
    //             P_CAT_SEQNO: productJSON.P_CAT_SEQNO,
    //             P_CAT_SUB: productJSON.P_CAT_SUB,
    //             P_UNIT: productJSON.P_UNIT,
    //             P_BARCODE: productJSON.P_BARCODE,
    //             P_LIST_PRICE: productJSON.P_LIST_PRICE,
    //             P_PROVIDER: productJSON.P_PROVIDER,
    //             P_SALE_PRICE: productJSON.P_SALE_PRICE,
    //             P_TAGS: productJSON.P_TAGS,
    //             P_MIN_STOCK: productJSON.P_MIN_STOCK,
    //             P_STOCK: productJSON.P_STOCK,
    //             P_STATUS: productJSON.P_STATUS,
    //             P_IMG: productJSON.P_IMG,
    //             C_ID: C_ID,
    //             C_TIME: new Date()
    //         }
    //         // return rows.insertId;
    //     } catch (error) {
    //         logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
    //         return "";
    //     }
    // }

    // static async get(SEQ) {
    //     let logBase = `models/productsModel.get: SEQ(${SEQ})`
    //     try {
    //         let query = `SELECT
    //             SEQ,
    //             STORE_CODE,
    //             P_CODE,
    //             P_NAME,
    //             P_CAT_CODE,
    //             P_CAT,
    //             P_MCAT_CODE,
    //             P_MCAT,
    //             P_CAT_SEQNO,
    //             P_CAT_SUB,
    //             P_UNIT,
    //             P_BARCODE,
    //             P_LIST_PRICE,
    //             P_PROVIDER,
    //             P_SALE_PRICE,
    //             P_IMG,
    //             P_TAGS,
    //             P_MIN_STOCK,
    //             P_STOCK,
    //             C_TIME,
    //             C_ID,
    //             M_TIME,
    //             M_ID,
    //             P_STATUS
    //         FROM tbl_moa_prd_main 
    //         WHERE SEQ = ?`;
    //         const [rows, fields] = await pool.mysqlPool.query(query, [SEQ]);
    //         if (rows.length > 0) {
    //             return rows[0]
    //         }

    //         return null;
    //     } catch (error) {
    //         logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
    //         return null;
    //     }
    // }

    // static async getByCode(P_CODE, P_STATUS) {
    //     let logBase = `models/productsModel.getByCode: P_CODE(${P_CODE}) P_STATUS(${P_STATUS})`
    //     try {
    //         let query = `SELECT
    //             SEQ,
    //             STORE_CODE,
    //             P_CODE,
    //             P_NAME,
    //             P_CAT_CODE,
    //             P_CAT,
    //             P_MCAT_CODE,
    //             P_MCAT,
    //             P_CAT_SEQNO,
    //             P_CAT_SUB,
    //             P_UNIT,
    //             P_BARCODE,
    //             P_LIST_PRICE,
    //             P_PROVIDER,
    //             P_SALE_PRICE,
    //             P_IMG,
    //             P_TAGS,
    //             P_MIN_STOCK,
    //             P_STOCK,
    //             C_TIME,
    //             C_ID,
    //             M_TIME,
    //             M_ID,
    //             P_STATUS
    //         FROM tbl_moa_prd_main 
    //         WHERE P_CODE = ? AND P_STATUS = ?`;
    //         const [rows, fields] = await pool.mysqlPool.query(query, [P_CODE, P_STATUS]);
    //         if (rows.length > 0) {
    //             return rows[0]
    //         }

    //         return null;
    //     } catch (error) {
    //         logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
    //         return null;
    //     }
    // }
    
    // static async getByCodes(P_CODES, P_STATUS) {
    //     let logBase = `models/productsModel.getByCode: P_CODES(${P_CODES}) P_STATUS(${P_STATUS})`
    //     logger.writeLog("info", `${logBase} 목록을 가져온다`);
    //     try {
    //         let query = `SELECT
    //             SEQ,
    //             STORE_CODE,
    //             P_CODE,
    //             P_NAME,
    //             P_CAT_CODE,
    //             P_CAT,
    //             P_MCAT_CODE,
    //             P_MCAT,
    //             P_CAT_SEQNO,
    //             P_CAT_SUB,
    //             P_UNIT,
    //             P_BARCODE,
    //             P_LIST_PRICE,
    //             P_PROVIDER,
    //             P_SALE_PRICE,
    //             P_IMG,
    //             P_TAGS,
    //             P_MIN_STOCK,
    //             P_STOCK,
    //             C_TIME,
    //             C_ID,
    //             M_TIME,
    //             M_ID,
    //             P_STATUS
    //         FROM tbl_moa_prd_main 
    //         WHERE P_CODE IN (${P_CODES}) AND P_STATUS = ?`;
    //         const [rows, fields] = await pool.mysqlPool.query(query, [P_STATUS]);
    //         if (rows.length > 0) {
    //             return rows
    //         }

    //         return null;
    //     } catch (error) {
    //         logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
    //         return null;
    //     }
    // }
    // // 동일한 바코드의 상품이 있는지 검색
    // static async find(P_BARCODE) {
    //     let logBase = `models/productsModel.find: P_BARCODE(${P_BARCODE})`
    //     try {
    //         let query = `SELECT
    //             SEQ,
    //             STORE_CODE,
    //             P_CODE,
    //             P_NAME,
    //             P_CAT_CODE,
    //             P_CAT,
    //             P_MCAT_CODE,
    //             P_MCAT,
    //             P_CAT_SEQNO,
    //             P_CAT_SUB,
    //             P_UNIT,
    //             P_BARCODE,
    //             P_LIST_PRICE,
    //             P_PROVIDER,
    //             P_SALE_PRICE,
    //             P_IMG,
    //             P_TAGS,
    //             P_MIN_STOCK,
    //             P_STOCK,
    //             C_TIME,
    //             C_ID,
    //             M_TIME,
    //             M_ID,
    //             P_STATUS
    //         FROM tbl_moa_prd_main 
    //         WHERE 
    //             P_STATUS = 'A' AND P_BARCODE = ?`;
    //         const [rows, fields] = await pool.mysqlPool.query(query, [P_BARCODE]);
    //         if (rows.length > 0) {
    //             return rows[0]
    //         }

    //         return null;
    //     } catch (error) {
    //         logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
    //         return null;
    //     }
    // }

    // static async getForMobile(storeCode, P_CODE, P_BARCODE, productId, count) {
    //     const logBase = `models/productsModel.getForMobile: storeCode(${storeCode}), P_CODE(${P_CODE}), P_BARCODE(${P_BARCODE}), count(${count})`;
    //     try {
    //         let query = `SELECT 
    //             ${(productId) ? `'${productId}' AS PRODUCT_ID, ` : ''}
    //             ${(count) ? `${count} AS CART_COUNT, ` : ''}
    //             SEQ,
    //             STORE_CODE,
    //             M_MOA_CODE,
    //             M_POS_REGCODE,
    //             P_CODE,
    //             P_NAME,
    //             P_CAT_CODE,
    //             P_CAT,
    //             P_MCAT_CODE,
    //             P_MCAT,
    //             P_CAT_SEQNO,
    //             P_CAT_SUB,
    //             P_UNIT,
    //             P_BARCODE,
    //             P_LIST_PRICE,
    //             P_PROVIDER,
    //             P_SALE_PRICE,
    //             P_SALE_TITLE,
    //             P_MTIME,
    //             P_TAX_TYPE,
    //             P_INV_TYPE,
    //             P_REG_COUNT,
    //             P_IMG,
    //             P_TAGS,
    //             P_STATUS,
    //             P_MIN_STOCK,
    //             P_MIN_STOCK_DEFAULT,
    //             P_USE_MAXQTY_BRGN,
    //             P_MAXQTY_BRGN,
    //             P_MAXQTY_BRGN_DEFAULT,
    //             C_TIME,
    //             C_ID,
    //             M_TIME,
    //             M_ID,
    //             P_USE_MAXQTY_PD,
    //             P_VALUE_MAXQTY_PD,
    //             P_USE_MINQTY_PD,
    //             P_VALUE_MINQTY_PD,
    //             P_STOCK
    //         FROM 
    //             tbl_moa_prd_main
    //         WHERE
    //             P_STATUS = 'A' AND STORE_CODE = ? AND P_CODE = ? AND P_BARCODE = ?
    //         `
    //         const [rows, fields] = await pool.mysqlPool.query(query, [storeCode, P_CODE, P_BARCODE]);
    //         if (rows.length > 0) {
    //             return rows[0];
    //         } else {
    //             logger.writeLog('error', `${logBase} - No data found`);           
    //             return null;
    //         }
    //     } catch (error) {
    //         logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
    //         return null;
    //     }
    // }

    static async updatePhoto(productCode, P_IMG) {
        let logBase = `models/productsModel.updatePhoto: productCode(${productCode}), P_IMG(${P_IMG})`;
        try {
            let query = `UPDATE tbl_moa_prd_main SET P_IMG = ? WHERE P_CODE = ?`;
            const [rows, fields] = await pool.mysqlPool.query(query, [P_IMG, productCode]);
            return true;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return false;
        }
    }

    // static async createSingle(product, C_ID) {
    //     let logBase = `models/productsModel.createSingle: P_CODE(${product.P_CODE})`
    //     try {
    //         // PCODE가 없으면 최대값으로 생성
    //         if (product.P_CODE == "") {
    //             let query = 'SELECT (IFNULL(MAX(SEQ), 0) + 1) AS P_CODE FROM tbl_moa_prd_main WHERE STORE_CODE = ?';
    //             const [rows, fields] = await pool.mysqlPool.query(query, [product.STORE_CODE]);
    //             product.P_CODE = rows[0].P_CODE.toString();
    //         }
    //         if (product.P_STOCK == "") { product.P_STOCK = "100"; }
    //         if (product.P_SALE_PRICE == "") { product.P_SALE_PRICE = product.P_LIST_PRICE; }

    //         // console.log(product)
    //         let query = `INSERT INTO tbl_moa_prd_main (
    //             STORE_CODE,
    //             P_CODE,
    //             P_NAME,
    //             P_CAT_CODE,
    //             P_CAT,
    //             P_MCAT_CODE,
    //             P_MCAT,
    //             P_CAT_SEQNO,
    //             P_CAT_SUB,
    //             P_UNIT,
    //             P_BARCODE,
    //             P_LIST_PRICE,
    //             P_PROVIDER,
    //             P_SALE_PRICE,
    //             P_TAGS,
    //             P_MIN_STOCK,
    //             P_STOCK,
    //             P_STATUS,
    //             P_IMG,
    //             C_TIME,
    //             C_ID,
    //             M_TIME,
    //             M_ID
    //         ) VALUES (
    //             ?,
    //             ?,
    //             ?,
    //             ?,
    //             ?,
    //             ?,
    //             ?,
    //             ?,
    //             ?,
    //             ?,
    //             ?,
    //             ?,
    //             ?,
    //             ?,
    //             ?,
    //             ?,
    //             ?,
    //             ?,
    //             ?,
    //             NOW(),
    //             ?,
    //             NOW(),
    //             ?
    //         )`;
    //         // console.log(query)
    //         const [rows, fields] = await pool.mysqlPool.query(query, [
    //             product.STORE_CODE,
    //             product.P_CODE,
    //             product.P_NAME,
    //             product.P_CAT_CODE,
    //             product.P_CAT,
    //             product.P_MCAT_CODE,
    //             product.P_MCAT,
    //             product.P_CAT_SEQNO,
    //             product.P_CAT_SUB,
    //             product.P_UNIT,
    //             product.P_BARCODE,
    //             product.P_LIST_PRICE,
    //             product.P_PROVIDER,
    //             product.P_SALE_PRICE,
    //             product.P_TAGS,
    //             product.P_MIN_STOCK,
    //             product.P_STOCK,
    //             product.P_STATUS,
    //             product.P_IMG,
    //             C_ID,
    //             C_ID
    //         ]);            
    //         return {
    //             STORE_CODE: product.STORE_CODE,
    //             P_CODE: product.P_CODE,
    //             P_NAME: product.P_NAME,
    //             P_CAT_CODE: product.P_CAT_CODE,
    //             P_CAT: product.P_CAT,
    //             P_MCAT_CODE: product.P_MCAT_CODE,
    //             P_MCAT: product.P_MCAT,
    //             P_CAT_SEQNO: product.P_CAT_SEQNO,
    //             P_CAT_SUB: product.P_CAT_SUB,
    //             P_UNIT: product.P_UNIT,
    //             P_BARCODE: product.P_BARCODE,
    //             P_LIST_PRICE: product.P_LIST_PRICE,
    //             P_PROVIDER: product.P_PROVIDER,
    //             P_SALE_PRICE: product.P_SALE_PRICE,
    //             P_TAGS: product.P_TAGS,
    //             P_MIN_STOCK: product.P_MIN_STOCK,
    //             P_STOCK: product.P_STOCK,
    //             C_ID: C_ID,
    //             P_STATUS: product.P_STATUS,
    //             P_IMG: product.P_IMG
    //         }
    //     } catch (error) {
    //         logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
    //         return null;
    //     }
    // }

    // static async update(product, M_ID) {
    //     let logBase = `models/productsModel.update: product.P_CODE(${product.P_CODE})`
    //     try {
    //         // console.log(product)
    //         let query = `UPDATE tbl_moa_prd_main SET                
    //             P_NAME = ?,
    //             P_CAT_CODE = ?,
    //             P_CAT = ?,
    //             P_MCAT_CODE = ?,
    //             P_MCAT = ?,
    //             P_CAT_SEQNO = ?,
    //             P_CAT_SUB = ?,
    //             P_UNIT = ?,
    //             P_BARCODE = ?,
    //             P_LIST_PRICE = ?,
    //             P_PROVIDER = ?,
    //             P_SALE_PRICE = ?,
    //             P_TAGS = ?,
    //             P_MIN_STOCK = ?,
    //             P_STOCK = ?,
    //             P_STATUS = ?,
    //             P_IMG = ?,
    //             M_TIME = NOW(),
    //             M_ID = ?            
    //         WHERE 
    //             P_CODE = ?`;
    //         // console.log(query)
    //         const [rows, fields] = await pool.mysqlPool.query(query, [
    //             product.P_NAME,
    //             product.P_CAT_CODE,
    //             product.P_CAT,
    //             product.P_MCAT_CODE,
    //             product.P_MCAT,
    //             product.P_CAT_SEQNO,
    //             product.P_CAT_SUB,
    //             product.P_UNIT,
    //             product.P_BARCODE,
    //             product.P_LIST_PRICE,
    //             product.P_PROVIDER,
    //             product.P_SALE_PRICE,
    //             product.P_TAGS,
    //             product.P_MIN_STOCK,
    //             product.P_STOCK,
    //             product.P_STATUS,
    //             product.P_IMG,
    //             M_ID,
    //             product.P_CODE
    //         ]);            
    //         return {
    //             STORE_CODE: product.STORE_CODE,
    //             P_CODE: product.P_CODE,
    //             P_NAME: product.P_NAME,
    //             P_CAT_CODE: product.P_CAT_CODE,
    //             P_CAT: product.P_CAT,
    //             P_MCAT_CODE: product.P_MCAT_CODE,
    //             P_MCAT: product.P_MCAT,
    //             P_CAT_SEQNO: product.P_CAT_SEQNO,
    //             P_CAT_SUB: product.P_CAT_SUB,
    //             P_UNIT: product.P_UNIT,
    //             P_BARCODE: product.P_BARCODE,
    //             P_LIST_PRICE: product.P_LIST_PRICE,
    //             P_PROVIDER: product.P_PROVIDER,
    //             P_SALE_PRICE: product.P_SALE_PRICE,
    //             P_TAGS: product.P_TAGS,
    //             P_MIN_STOCK: product.P_MIN_STOCK,
    //             P_STOCK: product.P_STOCK,
    //             P_STATUS: product.P_STATUS,
    //             P_IMG: product.P_IMG
    //         }
    //     } catch (error) {
    //         logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
    //         return null;
    //     }
    // }

}