const logger = require("../../config/logger");
const pool = require("../../config/database");

module.exports = class kakaoModel {
    static async listProfile(page, rowCount) {
        let logBase = `models/kakaoModel.listProfile: page(${page}), rowCount(${rowCount})`;
        try {
            let countQuery = `SELECT COUNT(seq) AS TOTAL_COUNT FROM tbl_kko_profile WHERE status != 'D' `;

            let query = `SELECT
                A.seq,
                A.store_code,
                B.name,
                channel_id,
                channel_name,
                profile_key,
                category_code,
                category_name,
                status,
                A.C_ID,
                A.C_TIME,
                A.M_ID,
                A.M_TIME
            FROM
                tbl_kko_profile A
                INNER JOIN tbl_affiliated_store_main B ON B.store_code = A.store_code
            WHERE
                status != 'D'
            ORDER BY
                B.Name ASC
            LIMIT 
                ${rowCount} OFFSET ${(page - 1) * rowCount}`;

            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, []);
            const [rows, fields] = await pool.mysqlPool.query(query, []);
            return {
                count: rowsCount[0].TOTAL_COUNT,
                rows: rows,
            };
        } catch (error) {
            logger.writeLog("error", `${logBase} == listProfile failure ==\nStacktrace: ${error.stack}`);
            return {
                count: 0,
                rows: null
            };
        }
    }

    static async getProfile(storeCode) {
        let logBase = `models/kakaoModel.getProfile: storeCode(${storeCode})`;
        try {
            let query = `SELECT
                A.seq,
                A.store_code,
                B.name,
                channel_id,
                channel_name,
                profile_key,
                category_code,
                category_name,
                status,
                A.C_ID,
                A.C_TIME,
                A.M_ID,
                A.M_TIME
            FROM
                tbl_kko_profile A
                INNER JOIN tbl_affiliated_store_main B ON B.store_code = A.store_code
            WHERE
                status = 'A' AND
                A.store_code = ?`;

            const [rows, fields] = await pool.mysqlPool.query(query, [storeCode]);
            if (rows.length > 0) {
                logger.writeLog("info", `${logBase} MTS 카카오 프로파일 얻기 성공`);
                return rows[0];
            } else {
                logger.writeLog("info", `${logBase} MTS 카카오 프로파일 얻기 실패 == 데이터가 없습니다.`);
                return null;
            }
        } catch (error) {
            logger.writeLog("error", `${logBase} MTS 카카오 프로파일 얻기 실패 ==\nStacktrace: ${error.stack}`);
            return null
        }
    }

    static async addProfile(storeCode, channelId, channelName, profileKey, category, categoryName, C_ID) {
        let logBase = `models/kakaoModel.listProfile: storeCode(${storeCode}), channelId(${channelId}), channelName(${channelName}) profileKey(${profileKey}) C_ID(${C_ID})`;
        try {
            let query = `INSERT INTO tbl_kko_profile (
                store_code, channel_id, channel_name, profile_key, category_code, category_name, status, C_ID, C_TIME
            ) VALUES (
                ?, ?, ?, ?, ?, ?, 'A', ?, ?
            )`;

            await pool.mysqlPool.query(query, [storeCode, channelId, channelName, profileKey, category, categoryName, C_ID, new Date()]);
            logger.writeLog("info", `${logBase} MTS 카카오 프로파일 저장 성공`);
            return profileKey;
        } catch (error) {
            logger.writeLog("error", `${logBase} MTS 카카오 프로파일 저장 실패 ==\nStacktrace: ${error.stack}`);
            return null
        }
    }

    static async removeProfile(storeCode, channelId, M_ID) {
        let logBase = `models/kakaoModel.removeProfile: storeCode(${storeCode}), channelId(${channelId}), M_ID(${M_ID})`;
        try {
            let query = `UPDATE tbl_kko_profile SET status = 'D', M_ID=?, M_TIME = ? WHERE store_code = ? AND channel_id = ?`;

            await pool.mysqlPool.query(query, [M_ID, new Date(), storeCode, channelId]);
            logger.writeLog("info", `${logBase} 카카오 프로파일 삭제 설정 성공`);
            return storeCode;
        } catch (error) {
            logger.writeLog("error", `${logBase}카카오 프로파일 삭제 설정 실패 ==\nStacktrace: ${error.stack}`);
            return null
        }
    }

    static async removeProfileForce(storeCode, M_ID) {
        let logBase = `models/kakaoModel.removeProfileForce: storeCode(${storeCode}), M_ID(${M_ID})`;
        try {
            let query = `DELETE FROM tbl_kko_profile WHERE store_code = ?`;

            await pool.mysqlPool.query(query, [storeCode]);
            logger.writeLog("info", `${logBase} 카카오 프로파일 강제 삭제 성공 (데이터베이스에서만 삭제, MTS에 비활성화 아님)`);
            return storeCode;
        } catch (error) {
            logger.writeLog("error", `${logBase}카카오 프로파일 삭제 실패 ==\nStacktrace: ${error.stack}`);
            return null
        }
    }

    static async listTemplate(page, rowCount, storeCode = '') {
        let logBase = `models/kakaoModel.listTemplate: storeCode(${storeCode})`;
        try {
            let countQuery = `SELECT COUNT(seq) AS TEMPLATE_COUNT FROM tbl_kko_template A WHERE `

            let query = `SELECT
                A.seq,
                A.store_code,
                B.name,
                C.channel_id,
                C.channel_name,
                template_code,
                template_name,
                A.status,
                A.C_ID,
                A.C_TIME,
                A.M_ID,
                A.M_TIME
            FROM
                tbl_kko_template A
                INNER JOIN tbl_affiliated_store_main B ON B.store_code = A.store_code
                INNER JOIN tbl_kko_profile C ON C.store_code = A.store_code AND C.status = 'A'
            WHERE `;
            if (storeCode != '') {
                countQuery += ` A.store_code = '${storeCode}' AND A.status = 'A' ORDER BY template_code`
                query += ` A.store_code = '${storeCode}' AND A.status = 'A' ORDER BY template_code`
            } else {
                countQuery += ` A.status != 'D'`
                query += ` A.status != 'D' ORDER BY template_code LIMIT ${rowCount} OFFSET ${(page - 1) * rowCount}`
            }
            
            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, []);
            const [rows, fields] = await pool.mysqlPool.query(query, []);
            logger.writeLog("info", `${logBase} MTS 카카오 템플릿 정보 목록 얻기 성공`);
            return {
                count: rowsCount[0].TEMPLATE_COUNT,
                rows: rows,
            }
        } catch (error) {
            logger.writeLog("error", `${logBase} MTS 카카오 템플릿 정보 목록 얻기 실패 ==\nStacktrace: ${error.stack}`);
            return {
                count: 0,
                rows: null,
            }
        }
    }

    static async addTemplate(storeCode, templateCode, templateName, status, C_ID) {
        let logBase = `models/rcsModel.addTemplate: storeCode(${storeCode}), templateCode(${templateCode}), templateName(${templateName}), status(${status}), C_ID(${C_ID})`;
        try {
            let query = `INSERT INTO tbl_kko_template (
                store_code, template_code, template_name, status, C_ID, C_TIME
            ) VALUES (
                ?, ?, ?, ?, ?, ?
            )`;

            await pool.mysqlPool.query(query, [storeCode, templateCode, templateName, status, C_ID, new Date()]);
            logger.writeLog("info", `${logBase} MTS 카카오 템플릿 정보 저장 성공`);
            return storeCode;
        } catch (error) {
            logger.writeLog("error", `${logBase} MTS 카카오 템플릿 정보 저장 실패 ==\nStacktrace: ${error.stack}`);
            return null
        }
    }

    static async updateTemplate(seq, storeCode, templateCode, templateName, status, M_ID) {
        let logBase = `models/rcsModel.updateTemplate: seq(${seq}), status(${status}), M_ID(${M_ID})`;
        try {
            let query = `UPDATE tbl_kko_template SET 
                store_code = ?,
                template_code = ?,
                template_name = ?,
                status = ?, 
                M_ID = ?, 
                M_TIME = ? 
            WHERE 
                seq = ?`;

            await pool.mysqlPool.query(query, [storeCode, templateCode, templateName, status, M_ID, new Date(), seq]);
            logger.writeLog("info", `${logBase} MTS 카카오 템플릿 정보 변경 성공`);
            return seq;
        } catch (error) {
            logger.writeLog("error", `${logBase} MTS 카카오 템플릿 정보 변경 실패 ==\nStacktrace: ${error.stack}`);
            return null
        }
    }
}
