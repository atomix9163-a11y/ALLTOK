const logger = require("../../config/logger");
const pool = require("../../config/database");

module.exports = class refuseModel {

    static async list(storeCode, phone, page, rowCount) {
        let logBase = `models/refuseModel.list: storeCode(${storeCode == '' ? 'ALL' : storeCode}), phone(${phone}), page(${page}), rowCount(${rowCount})`
        logger.writeLog("info", `${logBase} 수신거부 목록 얻기`);
        try {
            let countQuery = `SELECT 
                COUNT(seq) AS TOTAL_COUNT 
            FROM 
                tbl_refuse_phone`;

            let query = `
            SELECT
                SEQ,
                store_code,
                phone,
                comment,
                C_ID,
                C_TIME
            FROM
                tbl_refuse_phone`;

            let whereQuery = `
            WHERE                
                ${(storeCode != '') ? ` (store_code is null OR store_code = '${storeCode}') ` : ` 1 = 1 `}
                ${(phone) ? ` AND phone like '%${phone}%'` : ''}`;

            countQuery += whereQuery;
            query = query + whereQuery + ` 
            ORDER BY
                C_TIME desc, phone ASC
            LIMIT 
                ${rowCount} OFFSET ${(page - 1) * rowCount}
            `;

            console.log(query)
            // logger.writeLog("error", `${logBase}`);
            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, [storeCode]);
            const [rows, fields] = await pool.mysqlPool.query(query, [storeCode]);
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

    static async add(storeCode, phone, comment) {
        let logBase = `models/refuseModel.add: storeCode(${storeCode}), phone(${phone}), comment(${comment})`
        try {
            let query = `INSERT INTO tbl_refuse_phone (store_code, phone, comment, C_ID, C_TIME)
            VALUES (?, ?, ?, 'system', NOW())`;

            logger.writeLog("info", `${logBase} 추가됨`);
            const [rows, fields] = await pool.mysqlPool.query(query, [storeCode, phone, comment]);
            return rows.insertId;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async remove(seq) {
        let logBase = `models/refuseModel.delete: seq(${seq})`;
        try {
            let query = 'DELETE FROM tbl_refuse_phone WHERE seq = ?';
            await pool.mysqlPool.query(query, [seq]);

            return seq;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }            
    }

    static async addCustomersFromFile(storeCode, phoneList, C_ID) {
        let logBase = `models/refuseModel.addCustomersFromFile: storeCode(${storeCode}), phoneList(${phoneList.length}), C_ID{${C_ID}}`
        try {
            let query = `INSERT INTO tbl_refuse_phone (store_code, phone, comment, C_ID, C_TIME) VALUES ?`;

            let phoneDataList = []
            for (let phone of phoneList) {
                let phoneData = [storeCode, phone, '수동 엑셀', 'system', new Date()];
                phoneDataList.push(phoneData);
            }
            await pool.mysqlPool.query(query, [phoneDataList]);
            logger.writeLog("info", `${logBase} 엑셀 다중 수신 거부자 둥록 완료`);
            return true;
        } catch (error) {
            logger.writeLog("error", `${logBase} 엑셀 다중 수신 거부자 둥록 실패 \nStacktrace: ${error.stack}`);
            // 에러면 0 리턴
            return false;
        }
    }
    
}