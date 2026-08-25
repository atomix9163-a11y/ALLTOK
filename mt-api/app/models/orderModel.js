const logger = require("../../config/logger");
const pool = require("../../config/database");
const moment = require("moment");

module.exports = class orderModel {
    //주문 번호를 생성하기 위한 기본 코드를 얻는다. TBL_MOA_ORD_MAIN 레코드 최대 수 + 1이다
    static async get_O_CODE_BaseValue(storeCode) {
        let query = `SELECT 
            COUNT(O_CODE) + 1 AS CNT
        FROM 
            tbl_moa_ord_main
        WHERE 
            DATE_FORMAT(C_TIME, '%Y%m%d') = DATE_FORMAT(NOW(), '%Y%m%d') AND STORE_CODE = ?`;        
        const [rows, fields] = await pool.mysqlPool.query(query, [storeCode]);
        return rows[0].CNT;
    }

    //결제 번호를 생성하기 위한 기본 코드를 얻는다. TBL_MOA_PAYMT_MAIN 레코드 최대 수 + 1이다
    static async get_O_PAY_CODE_BaseValue(storeCode) {
        let query = `SELECT 
            COUNT(O_PAY_CODE) + 1 AS CNT
        FROM 
            tbl_moa_paymt_main
        WHERE 
            C_TIME = NOW() AND STORE_CODE = ?`
        const [rows, fields] = await pool.mysqlPool.query(query, [storeCode]);
        return rows[0].CNT;
    }    
    
    //주문 데이터를 생성한다. 이 주문 데이터는 슈켓 뿐 아니라 투게더스 포스 연동을 위한 TDC 데이터도 함께 생성한다
    static async create(O_CODE, O_PAY_CODE, storeInfo, orderInfo, productList) {
        let logBase = `models/ordersModel.create: O_CODE(${O_CODE}), O_PAY_CODE(${O_PAY_CODE}), mart_code(${storeInfo.store_code})`
        //트랜젝션을 위한 커넥션 생성
        const connection = await pool.mysqlPool.getConnection(async conn => conn);           
        try {
            //트랜젝션 시작
            await connection.beginTransaction();           
                        
            // console.log(0)
            // TBL_MOA_ORD_MAIN 주문 기본 데이터 생성            
            await connection.query(`INSERT INTO tbl_moa_ord_main (
                STORE_CODE,
                M_MOA_CODE, 
                O_CODE, 
                O_STATUS, 
                U_CODE, 
                O_SHIP, 
                O_POINT, 
                O_COUPON, 
                O_SERIAL, 
                U_ADDR_RECI, 
                U_ADDR_PHONE, 
                U_ADDR_PHONE_EX, 
                U_POST_CODE, 
                U_ADDR_STATE,
                U_ADDR_CITY, 
                U_ADDR_RA, 
                U_ADDR_DETAIL, 
                O_REQ, 
                O_ADMREQ, 
                O_PLATFM, 
                O_DEVICE, 
                O_DEVICE_NAME, 
                O_DEVICE_OS, 
                O_DEVICE_BROWSER, 
                O_DEVICE_BROWSER_VS, 
                O_DEVICE_AGENT, 
                C_ID, 
                C_TIME, 
                M_ID, 
                M_TIME, 
                IS_PRINT,
                O_WEBURL
            ) VALUES (
                ?,
                ?,
                ?,
                '70',
                NULL,
                '0',
                '0',
                '0',
                NULL,
                ?,
                ?,
                '',
                ?,
                '',
                '',
                ?,
                ?,
                ?,
                NULL,
                'W',
                '',
                '',
                '',
                NULL,
                NULL,
                NULL,
                'SYSTEM',
                NOW(),
                'SYSTEM',
                NOW(),
                'N',
                '1'
            )`, [
                storeInfo.store_code,
                storeInfo.M_MOA_CODE,
                O_CODE,
                orderInfo.U_ADDR_RECI,
                orderInfo.U_ADDR_PHONE,
                orderInfo.U_POST_CODE,
                orderInfo.U_ADDR_RA,
                orderInfo.U_ADDR_DETAIL,
                orderInfo.O_REQ
            ]);

            console.log("U_ADDR_RECI", orderInfo.U_ADDR_RECI)
            console.log("U_ADDR_PHONE", orderInfo.U_ADDR_PHONE)
            console.log("U_POST_CODE", orderInfo.U_POST_CODE)
            console.log("U_ADDR_RA", orderInfo.U_ADDR_RA)
            console.log("U_ADDR_DETAIL", orderInfo.U_ADDR_DETAIL)
            console.log("O_REQ", orderInfo.O_REQ)

            // console.log(1)
            // TBL_MOA_ORD_MAIN_HISTORY 주문 히스토리 데이터 생성
            await connection.query(`INSERT INTO tbl_moa_ord_main_history (
                STORE_CODE,
                M_MOA_CODE, 
                O_CODE, 
                O_STATUS, 
                U_CODE, 
                O_SHIP, 
                O_POINT, 
                O_COUPON, 
                O_SERIAL, 
                U_ADDR_RECI, 
                U_ADDR_PHONE, 
                U_ADDR_PHONE_EX, 
                U_POST_CODE, 
                U_ADDR_STATE,
                U_ADDR_CITY, 
                U_ADDR_RA, 
                U_ADDR_DETAIL, 
                O_REQ, 
                O_ADMREQ, 
                O_PLATFM, 
                O_DEVICE, 
                O_DEVICE_NAME, 
                O_DEVICE_OS, 
                O_DEVICE_BROWSER, 
                O_DEVICE_BROWSER_VS, 
                O_DEVICE_AGENT, 
                C_ID, 
                C_TIME, 
                IS_PRINT,
                O_WEBURL,
                HIS_STATUS
            ) VALUES (
                ?,
                ?,
                ?,
                '70',
                NULL,
                '0',
                '0',
                '0',
                NULL,
                ?,
                ?,
                '',
                ?,
                '',
                '',
                ?,
                ?,
                ?,
                NULL,
                'W',
                '',
                '',
                '',
                NULL,
                NULL,
                NULL,
                'SYSTEM',
                NOW(),
                'N',
                '1',
                'I'
            )`, [
                storeInfo.store_code,
                storeInfo.M_MOA_CODE,
                O_CODE,
                orderInfo.U_ADDR_RECI,
                orderInfo.U_ADDR_PHONE,
                orderInfo.U_POST_CODE,
                orderInfo.U_ADDR_RA,
                orderInfo.U_ADDR_DETAIL,
                orderInfo.O_REQ        
            ]);
            // console.log(2)
            //TBL_MOA_ORD_DETAIL 주문 목록 데이터 생성
            var O_PAY_AMOUNT = 0;
            
            for (let item of productList) {
            // await order.asyncForEach (productList, item => {
                var originalPrice = item.tmpl_dt_sale_price;
                var salePrice = (item.tmpl_dt_sale_price) ? item.tmpl_dt_sale_price : 0;
                O_PAY_AMOUNT += salePrice * item.count;

                // console.log(3)
                //TBL_MOA_ORD_DETAIL 주문 목록 기본 데이터 생성
                await connection.query(`
                    INSERT INTO tbl_moa_ord_detail (
                        STORE_CODE,
                        M_MOA_CODE, 
                        O_CODE, 
                        P_CODE, 
                        P_NAME, 
                        P_BARCODE, 
                        O_QTY, 
                        O_PRD_PRICE, 
                        P_LIST_PRICE, 
                        P_SALE_PRICE, 
                        P_PRD_TAX_TYPE, 
                        P_PRD_UNIT, 
                        P_PRD_UNIT_STATUS, 
                        O_CANCEL_STATUS, 
                        O_CART_CODE, 
                        C_TIME, 
                        C_ID, 
                        M_TIME, 
                        M_ID,
                        P_PRD_IMG
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
                        '1',
                        'C',
                        NULL,
                        NOW(),
                        'SYSTEM',
                        NULL,
                        NULL,
                        ?
                    )
                    `, 
                    [
                        storeInfo.store_code,
                        storeInfo.M_MOA_CODE,
                        O_CODE,
                        item.tmpl_dt_cd,
                        item.tmpl_dt_tl,
                        "",
                        item.count,
                        salePrice,                       
                        originalPrice,
                        salePrice,
                        0,
                        item.tmpl_dt_unit,
                        item.tmpl_dt_img
                ]);
                // console.log(4)
                //TBL_MOA_ORD_DETAIL 주문 목록 데이터 생성  
                await connection.query(`
                INSERT INTO tbl_moa_ord_detail_history (
                    STORE_CODE,
                    M_MOA_CODE, 
                    O_CODE, 
                    P_CODE, 
                    P_NAME, 
                    P_BARCODE, 
                    O_QTY, 
                    O_PRD_PRICE, 
                    P_LIST_PRICE, 
                    P_SALE_PRICE, 
                    P_PRD_TAX_TYPE, 
                    P_PRD_UNIT, 
                    P_PRD_UNIT_STATUS, 
                    O_CANCEL_STATUS, 
                    O_CART_CODE, 
                    C_TIME, 
                    C_ID, 
                    HIS_STATUS,
                    P_PRD_IMG
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
                    '1',
                    'C',
                    NULL,
                    NOW(),
                    'SYSTEM',
                    'I',
                    ?
                )
                `, 
                [
                    storeInfo.store_code,
                    storeInfo.M_MOA_CODE,
                    O_CODE,
                    item.tmpl_dt_cd,
                    item.tmpl_dt_tl,
                    "",
                    item.count,
                    salePrice,                       
                    originalPrice,
                    salePrice,
                    0,
                    "",
                    item.tmpl_dt_img
                ]);
            }
            // });

            // console.log(5)
            //TBL_MOA_PAYMT_MAIN 결제 데이터 생성
            const O_PAY_TYPE = (orderInfo.O_PAY_METHOD == 'COD') ? 3 : 4;
            await connection.query(`
                INSERT INTO tbl_moa_paymt_main (
                    STORE_CODE,
                    M_MOA_CODE,
                    O_PAY_CODE,
                    O_CODE,
                    O_PAY_AMOUNT,
                    O_PAY_TYPE,
                    O_PAY_STATUS,
                    O_PAY_METHOD,
                    O_PAY_PADATE,
                    C_ID
                    )
                VALUES (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    'CC',
                    ?,
                    NOW(),
                    'SYSTEM'
                )
                `, 
                [
                    storeInfo.store_code,
                    storeInfo.M_MOA_CODE,
                    O_PAY_CODE,
                    O_CODE,
                    O_PAY_AMOUNT,
                    O_PAY_TYPE,
                    orderInfo.O_PAY_METHOD
            ]);      

            // await connection.rollback();
            await connection.commit(); // COMMIT
            logger.writeLog('info', `${logBase}: 주문이 생성되었습니다.`);

            return O_CODE;
        } catch (error) {
            await connection.rollback();

            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        } finally {
            connection.release();
        }
    }

    static async list(storeCode, searchType, searchValue, status, payMethod, platform, startDate, endDate, page, rowCount) {
        let logBase = `models/ordersModel.list: storeCode(${storeCode}), page(${page}), rowCount(${rowCount})`
        try {
            let queryCount = `SELECT COUNT(MOM.SEQ) AS TOTAL_COUNT FROM tbl_moa_ord_main MOM INNER JOIN tbl_moa_paymt_main MPM ON MPM.O_CODE = MOM.O_CODE `;

            let query = `SELECT 
                MOM.SEQ,
                MOM.STORE_CODE,
                MOM.M_MOA_CODE,
                MOM.O_CODE,
                MOM.O_STATUS,
                MOM.U_CODE,
                MOM.O_SHIP,
                MOM.O_POINT,
                MOM.O_COUPON,
                MOM.O_SERIAL,
                MOM.U_ADDR_RECI,
                MOM.U_ADDR_PHONE,
                MOM.U_ADDR_PHONE_EX,
                MOM.U_POST_CODE,
                MOM.U_ADDR_STATE,
                MOM.U_ADDR_CITY,
                MOM.U_ADDR_RA,
                MOM.U_ADDR_DETAIL,
                MOM.O_REQ,
                MOM.O_ADMREQ,
                MOM.O_PLATFM,
                MOM.O_DEVICE,
                MOM.O_DEVICE_NAME,
                MOM.O_DEVICE_OS,
                MOM.O_DEVICE_BROWSER,
                MOM.O_DEVICE_BROWSER_VS,
                MOM.O_DEVICE_AGENT,
                MOM.O_DELIVERY_TYPE,
                MOM.O_PICKUP_TIME,
                MOM.O_PICKUP_DATE,
                MOM.C_ID,
                MOM.C_TIME,
                MOM.M_ID,
                MOM.M_TIME,
                MOM.DELIVERY_INFO,
                MOM.IS_DELIVERY,
                MOM.DELIVERY_DATA,
                MOM.IS_PRINT,
                MOM.BUNDLE_ORDER,
                MOM.IS_CHECK,
                MOM.O_WEBURL,
                MO.O_QTY,
                O_PAY_AMOUNT,
                O_PAY_METHOD
            FROM 
                tbl_moa_ord_main MOM
                INNER JOIN tbl_moa_paymt_main MPM ON MPM.O_CODE = MOM.O_CODE 
                LEFT JOIN (
					SELECT
						O_CODE,
						SUM(O_QTY) AS O_QTY
					FROM
						tbl_moa_ord_detail 
					GROUP BY O_CODE
                 ) MO ON MO.O_CODE = MOM.O_CODE `;
            
            let queryWhere = `
            WHERE
                MOM.STORE_CODE = ? AND
                (MOM.C_TIME BETWEEN '${startDate} 00:00:00)' AND '${endDate} 23:59:59')
                ${(status != "") ? `AND MOM.O_STATUS = '${status}'` : ""}
                ${(payMethod != "") ? `AND MPM.O_PAY_METHOD = '${payMethod}'` : ""}
                ${(platform != "") ? `AND MOM.O_PLATFM = '${platform}'` : ""}
            `

            if (searchValue != "") {
                if (searchType == "o_number") {
                    queryWhere += ` AND MOM.O_CODE LIKE '%${searchValue}' `
                } else if (searchType == "o_customer") {
                    queryWhere += ` AND MOM.U_ADDR_RECI = '${searchValue}' `
                } else {
                    queryWhere += ` AND MOM.U_ADDR_PHONE = '${searchValue}' `
                }
            }

            let limitQuery = `
            ORDER BY 
                O_CODE DESC
            LIMIT 
                ${rowCount} OFFSET ${(page - 1) * rowCount}`;

            queryCount += queryWhere;
            query += (queryWhere + limitQuery);
            // console.log(query)
            
            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(queryCount, [storeCode]);
            const [rows, fields] = await pool.mysqlPool.query(query, [storeCode, status]);
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

    static async get(O_CODE) {
        let logBase = `models/ordersModel.get: O_CODE(${O_CODE})`
        try {
            let query = `SELECT 
                MOM.SEQ,
                MOM.STORE_CODE,
                MOM.M_MOA_CODE,
                MOM.O_CODE,
                MOM.O_STATUS,
                MOM.U_CODE,
                MOM.O_SHIP,
                MOM.O_POINT,
                MOM.O_COUPON,
                MOM.O_SERIAL,
                MOM.U_ADDR_RECI,
                MOM.U_ADDR_PHONE,
                MOM.U_ADDR_PHONE_EX,
                MOM.U_POST_CODE,
                MOM.U_ADDR_STATE,
                MOM.U_ADDR_CITY,
                MOM.U_ADDR_RA,
                MOM.U_ADDR_DETAIL,
                MOM.O_REQ,
                MOM.O_ADMREQ,
                MOM.O_PLATFM,
                MOM.O_DEVICE,
                MOM.O_DEVICE_NAME,
                MOM.O_DEVICE_OS,
                MOM.O_DEVICE_BROWSER,
                MOM.O_DEVICE_BROWSER_VS,
                MOM.O_DEVICE_AGENT,
                MOM.O_DELIVERY_TYPE,
                MOM.O_PICKUP_TIME,
                MOM.O_PICKUP_DATE,
                MOM.C_ID,
                MOM.C_TIME,
                MOM.M_ID,
                MOM.M_TIME,
                MOM.DELIVERY_INFO,
                MOM.IS_DELIVERY,
                MOM.DELIVERY_DATA,
                MOM.IS_PRINT,
                MOM.BUNDLE_ORDER,
                MOM.IS_CHECK,
                MOM.O_WEBURL,
                MPM.O_PAY_CODE,
                MPM.O_PAY_AMOUNT,
                MPM.O_PAY_TYPE,
                MPM.O_PAY_STATUS,
                MPM.O_PAY_METHOD,
                MPM.O_PAY_PADATE,
                O_PAY_AMOUNT,
                O_PAY_METHOD
            FROM 
                tbl_moa_ord_main MOM
                INNER JOIN tbl_moa_paymt_main MPM ON MPM.O_CODE = MOM.O_CODE 
            WHERE
                MOM.O_CODE = ?`;
            const [rows, fields] = await pool.mysqlPool.query(query, [O_CODE]);
            if (rows.length > 0) {
                return rows[0]
            }

            return null;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async getDetails(O_CODE) {
        let logBase = `models/ordersModel.getDetails: O_CODE(${O_CODE})`
        try {
            let query = `SELECT                 
                SEQ,
                STORE_CODE,
                M_MOA_CODE,
                O_CODE,
                P_CODE,
                P_NAME,
                P_BARCODE,
                O_QTY,
                O_QTY AS CART_COUNT,
                O_PRD_PRICE,
                P_LIST_PRICE,
                P_SALE_PRICE,
                P_PRD_UNIT,
                P_PRD_UNIT AS P_UNIT,
                P_PRD_UNIT_STATUS,
                P_PRD_TAX_TYPE,
                O_CANCEL_STATUS,
                O_CART_CODE,
                BRGN_DATA,
                C_TIME,
                C_ID,
                M_TIME,
                M_ID,
                IS_DELIVERY,
                P_PRD_IMG AS P_IMG
            FROM 
                tbl_moa_ord_detail                
            WHERE
                O_CODE = ?`;
            const [rows, fields] = await pool.mysqlPool.query(query, [O_CODE]);
            return rows;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async getHistory(O_CODE) {
        let logBase = `models/ordersModel.history: O_CODE(${O_CODE})`
        try {
            let query = `SELECT 
                O_STATUS,
                C_TIME
            FROM 
                tbl_moa_ord_main_history
            WHERE
                O_CODE = ?
            ORDER BY 
                C_TIME ASC
            `;
            const [rows, fields] = await pool.mysqlPool.query(query, [O_CODE]);
            if (rows.length > 0) {
                // logger.writeLog("info", `${logBase} - ${rows.length} rows return`);
                return rows;
            } else {
                // logger.writeLog("info", `${logBase} - No data found`);
                return null;
            }

        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async setPrint(O_CODE, IS_PRINT) {
        let logBase = `models/ordersModel.setPrint: O_CODE(${O_CODE}), IS_PRINT(${IS_PRINT})`
        try {
            let query = `UPDATE 
                tbl_moa_ord_main 
            SET 
                IS_PRINT = ?
            WHERE 
                O_CODE=?`;
                console.log(query)
            const [rows, fields] = await pool.mysqlPool.query(query, [IS_PRINT, O_CODE]);
            return true;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return false;
        }
    }

    static async setStatus(O_CODE, O_STATUS) {
        let logBase = `models/ordersModel.setStatus: O_CODE(${O_CODE}), O_STATUS(${O_STATUS})`
        const connection = await pool.mysqlPool.getConnection(async conn => conn);
        try {
            let orderData = await orderModel.get(O_CODE);
            // console.log(orderData)
            if (orderData.O_STATUS == O_STATUS) return false;

            await connection.beginTransaction();
            // 주문 상태를 변경
            let query = `UPDATE tbl_moa_ord_main SET O_STATUS=? WHERE O_CODE=?`;
            await connection.query(query, [O_STATUS, O_CODE]);

            // 주문 HISTORY에 데이터를 복사
            query = `INSERT INTO tbl_moa_ord_main_history (
                STORE_CODE,
                M_MOA_CODE,
                O_CODE,
                O_STATUS,
                U_CODE,
                O_SHIP,
                O_POINT,
                O_COUPON,
                O_SERIAL,                
                O_REQ,
                O_ADMREQ,
                O_PLATFM,
                O_DEVICE,
                O_DEVICE_NAME,
                O_DEVICE_OS,
                O_DEVICE_BROWSER,
                O_DEVICE_BROWSER_VS,
                O_DEVICE_AGENT,
                HIS_STATUS,
                U_ADDR_RECI,
                U_ADDR_PHONE,
                U_ADDR_PHONE_EX,
                U_POST_CODE,
                U_ADDR_STATE,
                U_ADDR_CITY,
                U_ADDR_RA,
                U_ADDR_DETAIL,
                IS_PRINT,
                BUNDLE_ORDER,
                IS_CHECK,
                O_WEBURL,
                O_DELIVERY_TYPE,
                O_PICKUP_TIME,
                O_PICKUP_DATE,
                DELIVERY_INFO,
                IS_DELIVERY,
                DELIVERY_DATA,
                C_ID,
                C_TIME,
                M_ID,
                M_TIME
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
                ?,
                ?,
                ?,
                ?,
                'U',
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
                ?,
                ?,
                ?,
                ?,
                'SYSTEM',
                NOW(),
                'SYSTEM',
                NOW()
            )`;
            const [rows, fields] = await connection.query(query, [
                orderData.STORE_CODE,
                orderData.M_MOA_CODE,
                O_CODE,
                O_STATUS,
                orderData.U_CODE,
                orderData.O_SHIP,
                orderData.O_POINT,
                orderData.O_COUPON,
                orderData.O_SERIAL,                
                orderData.O_REQ,
                orderData.O_ADMREQ,
                orderData.O_PLATFM,
                orderData.O_DEVICE,
                orderData.O_DEVICE_NAME,
                orderData.O_DEVICE_OS,
                orderData.O_DEVICE_BROWSER,
                orderData.O_DEVICE_BROWSER_VS,
                orderData.O_DEVICE_AGENT,
                orderData.U_ADDR_RECI,
                orderData.U_ADDR_PHONE,
                orderData.U_ADDR_PHONE_EX,
                orderData.U_POST_CODE,
                orderData.U_ADDR_STATE,
                orderData.U_ADDR_CITY,
                orderData.U_ADDR_RA,
                orderData.U_ADDR_DETAIL,
                orderData.IS_PRINT,
                orderData.BUNDLE_ORDER,
                orderData.IS_CHECK,
                orderData.O_WEBURL,
                orderData.O_DELIVERY_TYPE,
                orderData.O_PICKUP_TIME,
                orderData.O_PICKUP_DATE,
                orderData.DELIVERY_INFO,
                orderData.IS_DELIVERY,
                orderData.DELIVERY_DATA]);

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