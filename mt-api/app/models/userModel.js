const logger = require("../../config/logger");
const pool = require("../../config/database");

module.exports = class userModel {
    static async checkDuplicate(loginId) {
        let logBase = `models/usersModel.checkDuplicate: login_id(${loginId})`;
        try {
            // 아이디가 중복되는지 확인
            let query = 'SELECT COUNT(*) AS FOUND FROM tbl_users WHERE login_id = ?';

            const [rows, fields] = await pool.mysqlPool.query(query, [loginId]);
            return rows[0].FOUND;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return -1;
        }
    }

    static async create(loginId, password, name, adminType, active, C_ID = null) {
        let logBase = `models/usersModel.create: loginId(${loginId}), password(${password}), name(${name}), adminType(${adminType}), active(${active})`
        try {
            let query = `INSERT INTO tbl_users 
                (login_id, password, name, admin_type, active, C_ID, C_TIME, M_ID, M_TIME) 
                VALUES 
                (?, ?, ?, ?, ?, ?, NOW(), ?, NOW()) `;
            const [rows, fields] = await pool.mysqlPool.query(query, [loginId, password, name, adminType, active, C_ID, C_ID]);
            // logger.writeLog("info", `${logBase} - created`);
            return rows.insertId;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async get(seq) {
        let logBase = `models/usersModel.get: seq(${seq})`
        try {
            let query = `
            SELECT
                seq,
                login_id,
                password,
                name,
                admin_type,
                active,
                C_ID,
                C_TIME,
                M_ID,
                M_TIME
            FROM
                tbl_users
            WHERE
                seq = ?`;
            const [rows, fields] = await pool.mysqlPool.query(query, [seq]);
            // logger.writeLog("info", `${logBase} - get`);
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
        let logBase = `models/usersModel.getByLoginId: loginId(${loginId})`
        try {
            let query = `
            SELECT
                seq,
                login_id,
                password,
                name,
                admin_type,
                active,
                C_ID,
                C_TIME,
                M_ID,
                M_TIME
            FROM
                tbl_users
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

    static async list(page, rowCount, adminType, active) {
        let logBase = `models/usersModel.list: page(${page}) rowCount(${rowCount}) active(${active})`
        try {
            let countQuery = `SELECT COUNT(seq) AS USER_COUNT FROM tbl_users`;

            let query = `
            SELECT
                seq,
                login_id,
                password,
                name,
                admin_type,
                active,
                C_ID,
                C_TIME,
                M_ID,
                M_TIME
            FROM
                tbl_users `;                
            if (adminType.length != 0) {
                query += ` WHERE admin_type = '${adminType}' `;
            }
            query += ` ORDER BY login_id `;
            if (page != 0) {
                query += ` LIMIT ${rowCount} OFFSET ${(page - 1) * rowCount}`;
            }
            
            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, []);
            const [rows, fields] = await pool.mysqlPool.query(query, []);
            if (rows.length > 0) {
                // logger.writeLog("info", `${logBase} - ${rows.length} rows return`);
                return {
                    count: rowsCount[0].USER_COUNT,
                    rows: rows,
                };
            } else {
                logger.writeLog("info", `${logBase} - No data found`);
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

    static async setActive(loginId, active) {
        let logBase = `models/usersModel.remove: loginId(${loginId})`
        try {
            let query = `UPDATE tbl_users SET active = ? WHERE login_id = ?`;
            const [rows, fields] = await pool.mysqlPool.query(query, [active, loginId]);
            return true;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return false;
        }
    }

    static async update(seq, loginId, password, name, adminType, active, M_ID) {
        let logBase = `models/usersModel.update: seq(${seq}), loginId(${loginId}), password(${password}), name(${name}), adminType(${adminType}), active(${active})`;
        try {
            let query = `UPDATE tbl_users SET 
                ${(password.length > 0) ? `password = '${password}', ` : ''}
                name = ?, 
                admin_type = ?, 
                active = ?,
                M_ID = ?,
                M_TIME = NOW()
            WHERE 
                seq = ?`;
            await pool.mysqlPool.query(query, [name, adminType, active, M_ID, seq]);
            return true;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return false;
        }
    }
}