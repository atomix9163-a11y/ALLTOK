const logger = require("../../config/logger");
const pool = require("../../config/database");

module.exports = class storeModel {
    static async count() {
        let logBase = `models/storeModel.count`;
        try {
            // 활성 가맹점 숫자 리턴
            let query = `SELECT active, COUNT(*) AS FOUND FROM tbl_affiliated_store_main GROUP BY active`;
            const [rows, fields] = await pool.mysqlPool.query(query, []);
            return rows;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return -1;
        }
    }
    
    static async list(managerId, page, rowCount, searchKey, storeType, active = '') {
        let logBase = `models/storeModel.list: managerId(${managerId}) page(${page}) rowCount(${rowCount}), searchKey(${searchKey}), storeType(${storeType})`
        try {
            let countQuery = `SELECT COUNT(seq) AS STORE_COUNT FROM tbl_affiliated_store_main asm`;

            let query = `
            SELECT
                asm.seq,
                asm.store_code,
                M_MOA_CODE,
                app_mart_code,
                shop_type,
                shuket_manager,
                manager_id,
                POS_type,
                logo_image,
                notice_top,
                asm.name,
                owener,
                name_reg,
                regno,
                address,
                email,
                contact,
                asm.login_id,
                login_pwd,
                use_mobile_shop,
                use_mobile_order,
                mobile_order_limit,
                balance,
                use_hide_sms,
                asm.active,
                asm.C_ID,
                asm.C_TIME,
                asm.M_ID,
                asm.M_TIME,
                IFNULL(tbl_users.name, '') AS manager_name,
                ass.data
            FROM
                tbl_affiliated_store_main asm
                LEFT JOIN tbl_affiliated_store_service ass ON ass.store_code = asm.store_code
                LEFT JOIN tbl_users ON tbl_users.login_id = asm.manager_id `;

            let whereQuery = ` WHERE ${active == '' ? `asm.active != 'T' ` : `asm.active = '${active}'`} `;
            if (managerId.length > 0) {
                whereQuery += ` AND (manager_id = '${managerId}') `;
            }
            if (searchKey != "") {
                whereQuery += ` AND (asm.store_code LIKE '%${searchKey}' OR asm.name LIKE '%${searchKey}%') `;
            }
            if (storeType != "") {
                whereQuery += ` AND asm.store_type = '${storeType}' `;
            }

            countQuery += whereQuery;
            query += whereQuery;
            query += ` ORDER BY asm.name
                LIMIT ${rowCount} OFFSET ${(page - 1) * rowCount}`

            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, []);
            const [rows, fields] = await pool.mysqlPool.query(query, []);
            if (rows.length > 0) {
                // logger.writeLog("info", `${logBase} - ${rows.length} rows return`);
                return {
                    count: rowsCount[0].STORE_COUNT,
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

    static async findLoginId(loginId, storeCode = "") {
        try {
            let query = `SELECT COUNT(seq) AS findCount FROM tbl_affiliated_store_main WHERE login_id = ?`;
            if (storeCode != "") {
                query += ` AND store_code != '${storeCode}'`
            }

            const [rows] = await pool.mysqlPool.query(query, [loginId]);

            logger.writeLog("info", `아이디 ${loginId} 중복 검사 결과 ${rows[0].findCount}개가 발견되었습니다`);
            return rows[0].findCount;
        } catch (error) {
            logger.writeLog("error", `아이디 ${loginId} 중복 검사에 실패했습니다. \nStacktrace: ${error.stack}`);
            return null;
        }            
    }
    
    static async create(mCode, martCode, shopType, shuketManager, managerId, POSType, name, owener, nameReg, regno, address, email, contact, loginId, loginPwd, useMobileShop, useMobileOrder, mobileOrderLimit, active, C_ID) {
        let logBase = `models/storeModel.create: name(${name}) POSType(${POSType}) shuketManager(${shuketManager}), managerId(${managerId})`;
        try {
            let codeQuery = 'SELECT IFNULL(COUNT(seq), 0) AS codeCount FROM tbl_affiliated_store_main WHERE store_type = "MT"';
            const [rowsCode, fieldsCode] = await pool.mysqlPool.query(codeQuery, []);

            let storeCode = "AT" + String(rowsCode[0].codeCount + 1).padStart(6, "0");

            let query = `
            INSERT INTO tbl_affiliated_store_main (
                store_code, M_MOA_CODE, app_mart_code, shop_type, store_type, POS_type, shuket_manager, manager_Id, name, owener, name_reg, regno, address, email, contact, login_id, login_pwd, use_mobile_shop, use_mobile_order, mobile_order_limit, balance, active, C_ID, C_TIME
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, NOW()                
            )`;

            const [rows, fields] = await pool.mysqlPool.query(query, [
                storeCode, mCode, martCode, shopType, 'MT', POSType, shuketManager, managerId, name, owener, nameReg, regno, address, email, contact, loginId, loginPwd, useMobileShop, useMobileOrder, mobileOrderLimit, active, C_ID
            ]);
            logger.writeLog("info", `${logBase} 새로운 가맹점이 등록되었습니다.`);
            return storeCode;
        } catch (error) {
            logger.writeLog("error", `${logBase} 새로운 가맹점 등록이 실패했습니다. \nStacktrace: ${error.stack}`);
            return null;
        }            
    }

    static async update(storeCode, mCode, martCode, shopType, shuketManager, managerId, POSType, name, owener, name_reg, regno, address, email, contact, loginId, loginPwd, useMobileShop, useMobileOrder, mobileOrderLimit, active, M_ID) {
        let logBase = `models/storeModel.update: storeCode(${storeCode}), name(${name}), shuketManager(${shuketManager}), managerId(${managerId})`;
        try {
            let query = `
            UPDATE tbl_affiliated_store_main SET
                M_MOA_CODE = ?,
                app_mart_code = ?,
                shop_type = ?,
                shuket_manager = ?,
                manager_id = ?,
                POS_type = ?,
                name = ?,
                owener = ?,
                name_reg = ?,
                regno = ?,
                address = ?,
                email = ?,
                contact = ?,
                login_id = ?,
                use_mobile_shop = ?,
                use_mobile_order = ?,
                mobile_order_limit = ?,
                ${(loginPwd.length > 0) ? `login_pwd = '${loginPwd}', ` : ''}
                active = ?,
                M_ID = ?,
                M_TIME = NOW()
            WHERE
                store_code = ?`;

            const [rows, fields] = await pool.mysqlPool.query(query, [
                mCode, martCode, shopType, shuketManager, managerId, POSType, name, owener, name_reg, regno, address, email, contact, loginId, useMobileShop, useMobileOrder, mobileOrderLimit, active, M_ID, storeCode
            ]);
            logger.writeLog("info", `${logBase} 가맹점 정보가 변경되었습니다.`);
            return true;
        } catch (error) {
            logger.writeLog("error", `${logBase} 가맹점 정보가 변경이 실패했습니다.\nStacktrace: ${error.stack}`);
            return null;
        }            
    }

    static async get(storeCode) {
        let logBase = `models/storeModel.get: storeCode(${storeCode})`;
        try {
            let query = `
            SELECT
                asm.seq,
                asm.store_code,
                M_MOA_CODE,
                app_mart_code,
                shop_type,
                shuket_manager,
                manager_id,
                POS_type,                
                logo_image,
                notice_top,
                name,
                owener,
                name_reg,
                regno,
                address,
                email,
                contact,
                working_time,
                holidays,
                map_location,
                mart_image,
                mart_image2,
                delivery_comment,
                login_id,
                login_pwd,
                use_mobile_shop,
                use_mobile_order,
                use_mobile_title,
                mobile_order_limit,
                balance,
                use_hide_sms,
                use_pay_method,
                use_time_limit,
                active,
                asm.C_ID,
                asm.C_TIME,
                asm.M_ID,
                asm.M_TIME,
                ass.data AS service              
            FROM
                tbl_affiliated_store_main asm
                LEFT JOIN tbl_affiliated_store_service ass ON ass.store_code = asm.store_code
            WHERE
                asm.store_code = ?`;

            const [rows, fields] = await pool.mysqlPool.query(query, [storeCode]);
            logger.writeLog("info", `${logBase} 마트 정보를 얻습니다`);
            if (rows.length > 0) {
                return rows[0];
            } else {
                return null;
            }
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async getByLoginId(loginId) {
        let logBase = `models/storeModel.getByLoginId: loginId(${loginId})`
        try {
            let query = `
            SELECT
                seq,
                store_code,
                M_MOA_CODE,
                app_mart_code,
                shop_type,
                manager_id,
                POS_type,
                logo_image,
                notice_top,
                name,
                owener,
                name_reg,
                regno,
                address,
                email,
                contact,
                working_time,
                holidays,
                map_location,
                mart_image,
                mart_image2,
                delivery_comment,
                login_id,
                login_pwd,
                use_mobile_shop,
                use_mobile_order,
                mobile_order_limit,
                balance,
                use_hide_sms,
                use_pay_method,
                use_time_limit,
                active,
                C_ID,
                C_TIME,
                M_ID,
                M_TIME
            FROM
                tbl_affiliated_store_main
            WHERE
                login_id = ?`;

            const [rows, fields] = await pool.mysqlPool.query(query, [loginId]);
            if (rows.length > 0) {
                return rows[0];
            } else {
                return null;
            }
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }  

    static async updateStore(
        storeCode,
        contact,
        loginPwd,
        noticeTop,
        workingTime,
        holidays,
        deliveryComment,
        address,
        useMobileShop,
        useMobileOrder,
        useMobileTitle,
        mobileOrderLimit,
        usePayMethod,
        useTimeLimit,
        M_ID) {
        let logBase = `models/affiliatedStoreModel.updateStore: storeCode(${storeCode})`;
        try {
            let query = `
            UPDATE tbl_affiliated_store_main SET
                contact = ?,
                ${(loginPwd.length > 0) ? `login_pwd = '${loginPwd}', ` : ''}
                notice_top = ?,
                working_time = ?,
                holidays = ?,
                delivery_comment = ?,
                address = ?,
                use_mobile_shop = ?,
                use_mobile_order = ?,
                use_mobile_title = ?,
                mobile_order_limit = ?,
                use_pay_method = ?,
                use_time_limit = ?,
                M_ID = ?,
                M_TIME = NOW()
            WHERE
                store_code = ?`;

            const [rows, fields] = await pool.mysqlPool.query(query, [
                contact,
                noticeTop,
                workingTime,
                holidays,
                deliveryComment,
                address,
                useMobileShop,
                useMobileOrder,
                useMobileTitle,
                mobileOrderLimit,
                usePayMethod,
                useTimeLimit,
                M_ID,
                storeCode
            ]);
            logger.writeLog("info", `${logBase} 가맹점 정보가 변경되었습니다.`);
            return true;
        } catch (error) {
            logger.writeLog("error", `${logBase} 가맹점 정보 변경이 실패하였습니다.\nStacktrace: ${error.stack}`);
            return null;
        }            
    }

    static async updateStorePhoto(storeCode, target, photoPath, M_ID) {
        let logBase = `models/storeModel.updateStorePhoto: storeCode(${storeCode}), target(${target})`;
        try {
            let query = `
            UPDATE tbl_affiliated_store_main SET ${target} = ?, M_ID = ?, M_TIME = NOW() WHERE store_code = ?`;

            const [rows, fields] = await pool.mysqlPool.query(query, [
                photoPath,
                M_ID,
                storeCode
            ]);
            logger.writeLog("info", `${logBase} 마트 정보 이미지가 변경되었습니다.`);
            return true;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }            
    }

    static async getService(storeCode) {
        let logBase = `models/storeModel.getService: storeCode(${storeCode})`;
        try {
            let query = `SELECT
                seq,
                store_code,
                data,
                C_ID,
                C_TIME,
                M_ID,
                M_TIME                
            FROM
                tbl_affiliated_store_service                
            WHERE
                store_code = ?`;

            const [rows, fields] = await pool.mysqlPool.query(query, [storeCode]);            
            if (rows.length > 0)
                return rows[0];
            else
                return null;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }            
    }

    static async saveService(storeCode, JSONdata, C_ID) {
        let logBase = `models/storeModel.saveService: storeCode(${storeCode})`;
        try {
            let remove_query = 'DELETE FROM tbl_affiliated_store_service WHERE store_code = ?';
            await pool.mysqlPool.query(remove_query, [storeCode]);

            let query = `INSERT INTO tbl_affiliated_store_service (
                store_code, data, C_ID, C_TIME
            ) VALUES (
                ?, ?, ?, NOW()
            )`;

            const [rows, fields] = await pool.mysqlPool.query(query, [storeCode, JSONdata, C_ID]);
            return rows.insertId;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }            
    }
    
    // static async getDeepLink(store_code) {
    //     let logBase = `models/affiliatedStoreModel.getDeepLink: store_code(${store_code})`;
    //     try {
    //         let query = `SELECT
    //             seq,
    //             deeplink_code,
    //             store_code,
    //             M_MOA_CODE,
    //             DIRECT_LINK,
    //             ANR_SCHEME,
    //             ANR_HOST,
    //             ANR_PACKAGE,
    //             IOS_SCHEME,
    //             IOS_APPID,
    //             C_ID,
    //             C_TIME,
    //             M_ID,
    //             M_TIME
    //         FROM
    //             tbl_affiliated_store_deeplink 
    //         WHERE
    //             store_code = ?`;

    //         const [rows, fields] = await pool.mysqlPool.query(query, [store_code]);
    //         // logger.writeLog("info", `${logBase} - updated`);
    //         if (rows.length > 0)
    //             return rows[0];
    //         else
    //             return null;
    //     } catch (error) {
    //         logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
    //         return null;
    //     }            
    // }

    // static async saveDeepLink(storeCode, M_MOA_CODE, directLink, anr_scheme, anr_package, ios_scheme, ios_appId, M_ID) {
    //     let logBase = `models/affiliatedStoreModel.saveDeepLink: storeCode(${storeCode})`;
    //     try {
    //         // 이미 있으면 삭제
    //         let deleteQuery = `DELETE FROM tbl_affiliated_store_deeplink WHERE store_code = ?`;
    //         await pool.mysqlPool.query(deleteQuery, [storeCode]);

    //         let codeQuery = 'SELECT IFNULL(MAX(seq), 0) AS codeCount FROM tbl_affiliated_store_deeplink';
    //         const [rowsCode, fieldsCode] = await pool.mysqlPool.query(codeQuery, []);

    //         let deeplinkCode = 'DL' + String(rowsCode[0].codeCount + 1).padStart(8, "0");

    //         let query = `
    //         INSERT INTO tbl_affiliated_store_deeplink (
    //             deeplink_code,
    //             store_code,
    //             M_MOA_CODE,
    //             DIRECT_LINK,
    //             ANR_SCHEME,
    //             ANR_HOST,
    //             ANR_PACKAGE,
    //             IOS_SCHEME,
    //             IOS_APPID,
    //             C_ID,
    //             C_TIME,
    //             M_ID,
    //             M_TIME
    //         ) VALUES (
    //             ?,
    //             ?,
    //             ?,
    //             ?,
    //             ?,
    //             'main',
    //             ?,
    //             ?,
    //             ?,
    //             ?,
    //             NOW(),
    //             ?,
    //             NOW()
    //         )`;

    //         const [rows, fields] = await pool.mysqlPool.query(query, [deeplinkCode, storeCode, M_MOA_CODE, directLink, anr_scheme, anr_package, ios_scheme, ios_appId, M_ID, M_ID]);
    //         // logger.writeLog("info", `${logBase} - created`);
    //         return rows.insertId;
    //     } catch (error) {
    //         logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
    //         return null;
    //     } 
    // }

    static async listSMSAdmin(storeCode) {
        let logBase = `models/storeModel.listSMSAdmin: storeCode(${storeCode})`;
        try {
            let query = `
            SELECT
                SEQ,
                STORE_CODE,
                M_MOA_CODE,
                SA_CODE,
                SA_PHONE,
                SA_STATUS,
                C_ID,
                C_TIME,
                M_ID,
                M_TIME
            FROM 
                tbl_moa_ord_sms_admin
            WHERE
                STORE_CODE = ? AND SA_STATUS = 'A'`;

            const [rows, fields] = await pool.mysqlPool.query(query, [storeCode]);
            return rows;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        } 
    }

    static async createSMSAdmin(storeCode, phone, C_ID) {
        const crypto = require('crypto');

        let logBase = `models/storeModel.createAdmin: storeCode(${storeCode}), phone(${phone}))`;
        try {
            // 이미 있으면 삭제
            let deleteQuery = `DELETE FROM tbl_moa_ord_sms_admin WHERE STORE_CODE = ? AND SA_PHONE = ? AND SA_STATUS = 'A'`;
            await pool.mysqlPool.query(deleteQuery, [storeCode, phone]);

            let saCode = 'SA' + crypto.randomBytes(Math.ceil(9)).toString('hex').slice(0, 18);

            let query = `
            INSERT INTO tbl_moa_ord_sms_admin (
                STORE_CODE,
                M_MOA_CODE,
                SA_CODE,
                SA_PHONE,
                SA_STATUS,
                C_ID,
                C_TIME,
                M_ID,
                M_TIME
            ) VALUES (
                ?,
                ?,
                ?,
                ?,
                'A',
                ?,
                NOW(),
                ?,
                NOW()
            )`;

            const [rows, fields] = await pool.mysqlPool.query(query, [storeCode, '', saCode, phone, C_ID, C_ID]);
            // logger.writeLog("info", `${logBase} - created`);
            return rows.insertId;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        } 
    }

    static async deleteSMSAdmin(saCode, M_ID) {
        let logBase = `models/storeModel.deleteSMSAdmin: saCode(${saCode})`;
        try {
            // 이미 있으면 삭제
            let deleteQuery = `UPDATE tbl_moa_ord_sms_admin SET SA_STATUS = 'D', M_ID = ?, M_TIME = NOW() WHERE SA_CODE = ?`;
            await pool.mysqlPool.query(deleteQuery, [M_ID, saCode]);

            return true;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return false;
        } 
    }   
    
}