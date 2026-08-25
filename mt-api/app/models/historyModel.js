const logger = require("../../config/logger");
const pool = require("../../config/database");
const moment = require("moment");

module.exports = class historyModel {
    static getUniqe5Digit() {
        return Math.floor(10000 + Math.random() * 90000);
    }

    static async add(storeCode, mpCode, requestTime, reserveTime, messageJSON, sendCount, msgType, serviceType = "KKO", pushCode = "") {
        let logBase = `models/messageHistoryModel.add: storeCode(${storeCode}), mpCode(${mpCode}), requestTime(${requestTime}), reserveTime(${reserveTime}), sendCount(${sendCount}), msgType(${msgType}), serviceType(${serviceType}), pushCode(${pushCode})`;
        try {
            let status = (reserveTime) ? "R" : "I";

            // 코드를 생성한다
            let codeQuery = 'SELECT IFNULL(MAX(seq), 0) AS codeCount FROM tbl_message_history_main';
            const [rowsCode, fieldsCode] = await pool.mysqlPool.query(codeQuery, []);

            let reserveCode = `R${String(rowsCode[0].codeCount + 1).padStart(9, "0")}${historyModel.getUniqe5Digit()}`;

            let query = `INSERT INTO tbl_message_history_main (
                reserve_code, store_code, mp_code, request_time, reserve_time, message_JSON, send_count, msg_type, service_type, push_code, status, C_ID, C_TIME, M_ID, M_TIME
            ) VALUES ( 			   		
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SYSTEM', NOW(), null, null
            );`;

            const [rows, fields] = await pool.mysqlPool.query(query, [reserveCode, storeCode, mpCode, requestTime, reserveTime, messageJSON, sendCount, msgType, serviceType, pushCode, status]);
            return reserveCode;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return "";
        }
    }

    static async list(storeCode, msgType, startDate, endDate, page, rowCount) {
        let logBase = `models/messageHistoryModel.list: storeCode(${storeCode}), msgType(${msgType})`;
        try {
            // 예약 메시지이며 시간이 30분 이내로 남은 R 상태의 기록을 모두 I로 바꾼다
            let query = `UPDATE tbl_message_history_main SET status = 'S'
            WHERE 
                store_code = ? 
                AND status = "R" 
                AND TIMESTAMPDIFF(minute, NOW(), reserve_time) < 10`;
            await pool.mysqlPool.query(query, [storeCode]);

            let countQuery = `SELECT COUNT(seq) AS TOTAL_COUNT FROM tbl_message_history_main `;
            
            query = `SELECT
                reserve_code, store_code, request_time, reserve_time, message_JSON, send_count, msg_type, status, service_type,
                IFNULL(real_send_count_sms, 0) AS real_send_count_sms,
                IFNULL(real_send_count_mms, 0) AS real_send_count_mms,
                IFNULL(real_send_count_rcs, 0) AS real_send_count_rcs,
                IFNULL(real_send_count_at, 0) AS real_send_count_at,
                IFNULL(use_amount, 0) AS use_amount
            FROM
                tbl_message_history_main
                LEFT JOIN (
                    SELECT
                        ETC3 ,
                        MAX(CASE WHEN TYPE = '1' THEN real_send_count END) AS real_send_count_sms,
                        MAX(CASE WHEN TYPE = '2' THEN real_send_count END) AS real_send_count_mms,
                        MAX(CASE WHEN TYPE = '3' THEN real_send_count END) AS real_send_count_rcs,
                        MAX(CASE WHEN TYPE = '5' THEN real_send_count END) AS real_send_count_at,
                        SUM(use_amount) AS use_amount
                    FROM 
                        (
                            SELECT
                                    ETC3,
                                    TYPE,
                                    COUNT(MSGKEY) AS real_send_count,
                                    SUM(ETC4) AS use_amount
                            FROM tmsg_log
                            WHERE
                                    ETC1 = ?
                                    AND
                                    (((CAST(RSLT AS UNSIGNED) = 0 AND RSLT2 is null) OR (CAST(RSLT AS UNSIGNED) = 0 AND CAST(RSLT2 AS UNSIGNED) = 0)))
                            GROUP BY
                                    ETC3, TYPE
                        ) A
                        GROUP BY 
                            ETC3
                ) tmsg_log ON tmsg_log.ETC3 = reserve_code`;
            let whereQuery = `
            WHERE
                store_code = ? 
                AND service_type = 'KKO' 
                ${(startDate != "") ? ` AND (request_time BETWEEN '${startDate} 00:00:00)' AND '${endDate} 23:59:59')` : "" } 
                ${msgType != "" ? ` AND msg_type = '${msgType}'` : ""}`;

            countQuery += whereQuery;
            query = query + whereQuery + `ORDER BY
                request_time DESC`;
            if (page > 0) {
                query += ` LIMIT ${rowCount} OFFSET ${(page - 1) * rowCount}`;
            }

            console.log(query)
            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, [storeCode]);
            const [rows, fields] = await pool.mysqlPool.query(query, [storeCode, storeCode]);
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

    static async listYearMonth(storeCode, msgType, yearMonth, page, rowCount) {
        let logBase = `models/messageHistoryModel.listYearMonth: storeCode(${storeCode}), msgType(${msgType}), yearMonth(${yearMonth})`;
        try {
            // 백업 기록에서 가져오는 것이므로, 기존 기록 설정을 바꾸지 않는다
            let countQuery = `SELECT COUNT(seq) AS TOTAL_COUNT FROM tbl_message_history_main `;            
            // `${yearMonth.substring(0, 3)}-${yearMonth.substring(4, 5)}-01`
            let startDate = moment(`${yearMonth}01`).format("YYYY-MM-DD");
            let endDate = moment(startDate).endOf('Month').format("YYYY-MM-DD")

            let query = `SELECT
                reserve_code, store_code, request_time, reserve_time, message_JSON, send_count, msg_type, status, service_type,        
                IFNULL(real_send_count_sms, 0) AS real_send_count_sms,
                IFNULL(real_send_count_mms, 0) AS real_send_count_mms,
                IFNULL(real_send_count_rcs, 0) AS real_send_count_rcs,
                IFNULL(real_send_count_at, 0) AS real_send_count_at,
                IFNULL(use_amount, 0) AS use_amount
            FROM
                tbl_message_history_main
                LEFT JOIN (
                    SELECT
                        ETC3 ,
                        MAX(CASE WHEN TYPE = '1' THEN real_send_count END) AS real_send_count_sms,
                        MAX(CASE WHEN TYPE = '2' THEN real_send_count END) AS real_send_count_mms,
                        MAX(CASE WHEN TYPE = '3' THEN real_send_count END) AS real_send_count_rcs,
                        MAX(CASE WHEN TYPE = '5' THEN real_send_count END) AS real_send_count_at,
                        SUM(use_amount) AS use_amount
                    FROM 
                        (
                            SELECT
                                    ETC3,
                                    TYPE,
                                    COUNT(MSGKEY) AS real_send_count,
                                    SUM(ETC4) AS use_amount
                            FROM tmsg_log_${yearMonth}
                            WHERE
                                    ETC1 = ?
                                    AND
                                    (((CAST(RSLT AS UNSIGNED) = 0 AND RSLT2 is null) OR (CAST(RSLT AS UNSIGNED) = 0 AND CAST(RSLT2 AS UNSIGNED) = 0)))
                            GROUP BY
                                    ETC3, TYPE
                        ) A
                        GROUP BY 
                            ETC3
                ) tmsg_log_${yearMonth} ON tmsg_log_${yearMonth}.ETC3 = reserve_code`;
            let whereQuery = `
            WHERE
                store_code = ?                 
                AND (request_time BETWEEN '${startDate} 00:00:00)' AND '${endDate} 23:59:59')
                ${msgType != "" ? ` AND msg_type = '${msgType}'` : ""}`;

            countQuery += whereQuery;
            query = query + whereQuery + `ORDER BY
                request_time DESC`;
            if (page > 0) {
                query += ` LIMIT ${rowCount} OFFSET ${(page - 1) * rowCount}`;
            }

            // console.log(query)
            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, [storeCode]);
            const [rows, fields] = await pool.mysqlPool.query(query, [storeCode, storeCode]);
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

    static async cancel(storeCode, reserveCode) {
        let logBase = `models/messageHistoryModel.cancel: storeCode(${storeCode}), reserveCode(${reserveCode})`;
        const connection = await pool.mysqlPool.getConnection(async (conn) => conn);
        try {
            // 예약 메시지이며 시간이 30분 이내로 남은 R 상태의 기록을 모두 I로 바꾼다
            let query = `UPDATE tbl_message_history_main SET status = 'I'
            WHERE 
                store_code = ? AND
                status = "R" AND TIMESTAMPDIFF(minute, NOW(), reserve_time) < 30`;
            await connection.query(query, [storeCode]);

            // 변경할 데이터가 있는지 검사한다
            query = `SELECT count(seq) AS foundCount FROM tbl_message_history_main WHERE status = "R" AND reserve_code = ?`;
            const [found_rows, found_fields] = await connection.query(query, [reserveCode]);
            // console.log(logBase, found_rows[0].foundCount)
            if (found_rows[0].foundCount == 1) {
                // 데이터를 변경한다

                // 히스토리 메인 업데이트
                query = `UPDATE tbl_message_history_main SET status='C' WHERE status = "R" AND reserve_code = ?`;
                await connection.query(query, [reserveCode]);

                // 발송 데이터를 모두 삭제한다
                query = 'DELETE FROM tmsg_msg WHERE etc3 = ?';
                await connection.query(query, [reserveCode]);

                connection.commit();
                return "OK";
            } else {
                connection.commit();
                return "NO DATA";
            }
        } catch (error) {
            connection.rollback();
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return "DB ERROR";
        } finally {
            connection.release();
        }
    }    

    static async listDetailsLog(storeCode, reserveCode, sendType, sendResult, page, rowCount, yearMonth = "") {
        let logBase = `models/messageHistoryModel.listDetailsLog: storeCode(${storeCode}), reserveCode(${reserveCode}), sendType(${sendType}), sendResult(${sendResult})`;
        try {
            // logger.writeLog("error", `${logBase}`);
            let countQuery = `SELECT COUNT(MSGKEY) AS TOTAL_COUNT FROM tmsg_log${yearMonth != "" ? `_${yearMonth}` : ''} `;
            
            let query = `SELECT
                MSGKEY,
                PHONE,
                STATUS, 
                TYPE,
                RSLT, 
                RSLT2,
                REQDATE,
                SENTDATE,
                RSLTDATE,
                TELCOINFO,
                MESSAGE_TYPE,
                ETC4
            FROM
                tmsg_log${yearMonth != "" ? `_${yearMonth}` : ''}`;

            let whereQuery = `
            WHERE
                ETC1 = ? AND ETC3 = ?
                ${(sendType != "") ? ` AND TYPE = '${sendType}' ` : "" } 
                ${(sendResult != "") ? 
                    (sendResult == "0") ?
                    `AND (
                    (CAST(RSLT AS UNSIGNED) = 0 AND RSLT2 is null)
                    OR 
                    (CAST(RSLT AS UNSIGNED) = 0 AND CAST(RSLT2 AS UNSIGNED) = 0)
                    )` : 
                    `AND (
                        (CAST(RSLT AS UNSIGNED) != 0 AND RSLT2 is null)
                        OR 
                        (CAST(RSLT AS UNSIGNED) != 0 OR CAST(RSLT2 AS UNSIGNED) != 0)
                    )`
                    : ''
                }
            `;

            countQuery += whereQuery;
            query = query + whereQuery + `ORDER BY
                PHONE ASC`;
            if (parseInt(page) > 0) {
                query += ` LIMIT ${rowCount} OFFSET ${(page - 1) * rowCount}`;
            }
            logger.writeLog("info", `${logBase} KKO BIZ 상세 로그 내역을 가져옵니다.`);
            // console.log(query)
            

            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, [storeCode, reserveCode]);
            const [rows, fields] = await pool.mysqlPool.query(query, [storeCode, reserveCode]);
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

    static async listMTS(storeCode, msgType, startDate, endDate, page, rowCount) {
        let logBase = `models/messageHistoryModel.list: storeCode(${storeCode}), msgType(${msgType})`;
        try {
            // 예약 메시지이며 시간이 30분 이내로 남은 R 상태의 기록을 모두 I로 바꾼다
            let query = `UPDATE tbl_message_history_main SET status = 'S'
            WHERE 
                store_code = ? 
                AND status = "R" 
                AND TIMESTAMPDIFF(minute, NOW(), reserve_time) < 10`;
            await pool.mysqlPool.query(query, [storeCode]);

            let countQuery = `SELECT COUNT(seq) AS TOTAL_COUNT FROM tbl_message_history_main main `;
            
            query = `SELECT
                reserve_code, store_code, request_time, reserve_time, message_JSON, send_count, msg_type, status, service_type,    
                IFNULL(at_send_count, 0) AS at_send_count,
                IFNULL(at_use_amount, 0) AS at_use_amount,
                IFNULL(mms_send_count, 0) AS mms_send_count,
                IFNULL(mms_use_amount, 0) AS mms_use_amount,
                IFNULL(sms_send_count, 0) AS sms_send_count,
                IFNULL(sms_use_amount, 0) AS sms_use_amount,
                (IFNULL(at_send_count, 0) + IFNULL(mms_send_count, 0) + IFNULL(sms_send_count, 0)) AS total_send_count,
                (IFNULL(at_use_amount, 0) + IFNULL(mms_use_amount, 0) + IFNULL(sms_use_amount, 0)) AS total_use_amount,
                ((IFNULL(at_send_count, 0) + IFNULL(mms_send_count, 0) + IFNULL(sms_send_count, 0)) / send_count) AS send_rate
            FROM
                complexm.tbl_message_history_main main
                LEFT JOIN (
                    SELECT
                        TRAN_ETC1,
                        TRAN_ETC3,
                        'AT',
                        COUNT(TRAN_PR) AS at_send_count,
                        SUM(TRAN_ETC4) AS at_use_amount
                    FROM alltok.MTS_ATALK_MSG_LOG
                    WHERE
                        TRAN_ETC1 = '${storeCode}'
                        AND
                        CAST(TRAN_RSLT AS UNSIGNED) = 1000
                    GROUP BY
                        TRAN_ETC3
                ) kat ON main.store_code = kat.TRAN_ETC1 AND main.reserve_code = kat.TRAN_ETC3
                LEFT JOIN (
                    SELECT
                        TRAN_ETC1,
                        TRAN_ETC3,
                        'AT',
                        COUNT(TRAN_PR) AS mms_send_count,
                        SUM(TRAN_ETC4) AS mms_use_amount
                    FROM alltok.MTS_MMS_MSG_LOG
                    WHERE
                        TRAN_ETC1 = '${storeCode}'
                        AND
                        CAST(TRAN_RSLT AS UNSIGNED) = 1000
                    GROUP BY
                        TRAN_ETC3
                ) mms ON main.store_code = mms.TRAN_ETC1 AND main.reserve_code = mms.TRAN_ETC3
                LEFT JOIN (
                    SELECT
                        TRAN_ETC1,
                        TRAN_ETC3,
                        'AT',
                        COUNT(TRAN_PR) AS sms_send_count,
                        SUM(TRAN_ETC4) AS sms_use_amount
                    FROM alltok.MTS_SMS_MSG_LOG
                    WHERE
                        TRAN_ETC1 = '${storeCode}'
                        AND
                        CAST(TRAN_RSLT AS UNSIGNED) = 0
                    GROUP BY
                        TRAN_ETC3
                ) sms ON main.store_code = sms.TRAN_ETC1 AND main.reserve_code = sms.TRAN_ETC3
            `;
            let whereQuery = `
            WHERE
                main.service_type = 'MTS' AND main.store_code = '${storeCode}' 
                ${(startDate != "") ? ` AND (request_time BETWEEN '${startDate} 00:00:00)' AND '${endDate} 23:59:59')` : "" } 
                ${msgType != "" ? ` AND msg_type = '${msgType}'` : ""}`;

            countQuery += whereQuery;
            query = query + whereQuery + `ORDER BY
                request_time DESC`;
            if (page > 0) {
                query += ` LIMIT ${rowCount} OFFSET ${(page - 1) * rowCount}`;
            }

            // console.log(query)
            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, []);
            const [rows, fields] = await pool.mysqlPool.query(query, [storeCode, ]);
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
    
    static async listYearMonthMTS(storeCode, msgType, yearMonth, page, rowCount) {
        let logBase = `models/messageHistoryModel.listYearMonth: storeCode(${storeCode}), msgType(${msgType}), yearMonth(${yearMonth})`;
        try {
            // 백업 기록에서 가져오는 것이므로, 기존 기록 설정을 바꾸지 않는다
            let countQuery = `SELECT COUNT(seq) AS TOTAL_COUNT FROM tbl_message_history_main main `;            
            // `${yearMonth.substring(0, 3)}-${yearMonth.substring(4, 5)}-01`
            let startDate = moment(`${yearMonth}01`).format("YYYY-MM-DD");
            let endDate = moment(startDate).endOf('Month').format("YYYY-MM-DD")

            let query = `SELECT
                reserve_code, store_code, request_time, reserve_time, message_JSON, send_count, msg_type, status, service_type,    
                IFNULL(at_send_count, 0) AS at_send_count,
                IFNULL(at_use_amount, 0) AS at_use_amount,
                IFNULL(mms_send_count, 0) AS mms_send_count,
                IFNULL(mms_use_amount, 0) AS mms_use_amount,
                IFNULL(sms_send_count, 0) AS sms_send_count,
                IFNULL(sms_use_amount, 0) AS sms_use_amount,
                (IFNULL(at_send_count, 0) + IFNULL(mms_send_count, 0) + IFNULL(sms_send_count, 0)) AS total_send_count,
                (IFNULL(at_use_amount, 0) + IFNULL(mms_use_amount, 0) + IFNULL(sms_use_amount, 0)) AS total_use_amount,
                ((IFNULL(at_send_count, 0) + IFNULL(mms_send_count, 0) + IFNULL(sms_send_count, 0)) / send_count) AS send_rate
            FROM
                complexm.tbl_message_history_main main
                LEFT JOIN (
                    SELECT
                        TRAN_ETC1,
                        TRAN_ETC3,
                        'AT',
                        COUNT(TRAN_PR) AS at_send_count,
                        SUM(TRAN_ETC4) AS at_use_amount
                    FROM alltok.MTS_ATALK_MSG_LOG_${yearMonth}
                    WHERE
                        TRAN_ETC1 = '${storeCode}'
                        AND
                        CAST(TRAN_RSLT AS UNSIGNED) = 1000
                    GROUP BY
                        TRAN_ETC3
                ) kat ON main.store_code = kat.TRAN_ETC1 AND main.reserve_code = kat.TRAN_ETC3
                LEFT JOIN (
                    SELECT
                        TRAN_ETC1,
                        TRAN_ETC3,
                        'AT',
                        COUNT(TRAN_PR) AS mms_send_count,
                        SUM(TRAN_ETC4) AS mms_use_amount
                    FROM alltok.MTS_MMS_MSG_LOG_${yearMonth}
                    WHERE
                        TRAN_ETC1 = '${storeCode}'
                        AND
                        CAST(TRAN_RSLT AS UNSIGNED) = 1000
                    GROUP BY
                        TRAN_ETC3
                ) mms ON main.store_code = mms.TRAN_ETC1 AND main.reserve_code = mms.TRAN_ETC3
                LEFT JOIN (
                    SELECT
                        TRAN_ETC1,
                        TRAN_ETC3,
                        'AT',
                        COUNT(TRAN_PR) AS sms_send_count,
                        SUM(TRAN_ETC4) AS sms_use_amount
                    FROM alltok.MTS_SMS_MSG_LOG_${yearMonth}
                    WHERE
                        TRAN_ETC1 = '${storeCode}'
                        AND
                        CAST(TRAN_RSLT AS UNSIGNED) = 0
                    GROUP BY
                        TRAN_ETC3
                ) sms ON main.store_code = sms.TRAN_ETC1 AND main.reserve_code = sms.TRAN_ETC3 `;
            let whereQuery = `
            WHERE
                main.service_type = 'MTS' AND main.store_code = '${storeCode}'
                AND (main.request_time BETWEEN '${startDate} 00:00:00)' AND '${endDate} 23:59:59')
                ${msgType != "" ? ` AND main.msg_type = '${msgType}'` : ""}`;

            countQuery += whereQuery;
            query = query + whereQuery + `ORDER BY
                request_time DESC`;
            if (page > 0) {
                query += ` LIMIT ${rowCount} OFFSET ${(page - 1) * rowCount}`;
            }

            // console.log(query)
            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, []);
            const [rows, fields] = await pool.mysqlPool.query(query, [storeCode, ]);
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

    static async cancelMTS(storeCode, reserveCode) {
        let logBase = `models/messageHistoryModel.cancelMTS: ${moment().format("YYYY-MM-DD HH:mm:ss")} storeCode(${storeCode}), reserveCode(${reserveCode})`;
        const connection = await pool.mysqlPool.getConnection(async (conn) => conn);
        let cancelSendData = "OK";
        let pushCode = "";  // 큐마켓의 푸시 연동인 경우 pushCode 값이 존재
        try {
            logger.writeLog("info", `${logBase} 30분 이내의 예약메시지를 모두 취소 불가 처리 시작 >>>>>>>>>>>>>>>>>>>>>>>`);
            // 예약 메시지이며 시간이 30분 이내로 남은 R 상태의 기록을 모두 I로 바꾼다
            let query = `UPDATE complexm.tbl_message_history_main SET status = 'I'
            WHERE 
                store_code = ? AND
                status = "R" AND TIMESTAMPDIFF(minute, NOW(), reserve_time) < 30`;
            await connection.query(query, [storeCode]);

            logger.writeLog("info", `${logBase} 30분 이내의 예약메시지를 모두 취소 불가 처리 종료 <<<<<<<<<<<<<<<<<<<<<`);

            logger.writeLog("info", `${logBase} 변경할 데이터가 있는지 검사 >>>>>>>>>>>>>>>>>>>>>>>`);
            // 변경할 데이터가 있는지 검사한다
            query = `SELECT seq, msg_type, push_code FROM complexm.tbl_message_history_main WHERE status = "R" AND reserve_code = ? LIMIT 1`;
            const [found_rows, found_fields] = await connection.query(query, [reserveCode]);
            pushCode = found_rows[0].push_code ? found_rows[0].push_code : '';
            logger.writeLog("info", `${logBase} 변경할 데이터가 있는지 검사 종료 <<<<<<<<<<<<<<<<<<<<<`);
            // console.log(logBase, found_rows[0].foundCount)
            if (found_rows.length > 0) {
                // 데이터를 변경한다

                logger.writeLog("info", `${logBase} 히스토리 메인 업데이트 >>>>>>>>>>>>>>>>>>>>>>>`);
                // 히스토리 메인 업데이트
                query = `UPDATE complexm.tbl_message_history_main SET status='C' WHERE status = "R" AND reserve_code = ?`;
                await connection.query(query, [reserveCode]);

                logger.writeLog("info", `${logBase} 히스토리 메인 업데이트 종료 <<<<<<<<<<<<<<<<<<<<<`);

                logger.writeLog("info", `${logBase} 발송 데이터 삭제 >>>>>>>>>>>>>>>>>>>>>>>`);
                // 발송 데이터를 모두 삭제한다
                const tableName = found_rows[0].msg_type == 'AT' ? 'ATALK' : found_rows[0].msg_type == 'SMS' ? 'SMS' : 'MMS'
                query = `DELETE FROM alltok.MTS_${tableName}_MSG WHERE TRAN_ETC3 = ?`;
                await connection.query(query, [reserveCode]);

                logger.writeLog("info", `${logBase} 발송 데이터  삭제 종료 <<<<<<<<<<<<<<<<<<<<<`);

                logger.writeLog("info", `${logBase} 예약 데이터를 취소 처리하고 발송 데이터를 모두 삭제하였습니다.`);
                connection.commit();
                cancelSendData = "OK";
            } else {
                // 예약 상태 변경 코드만 커밋
                logger.writeLog("error", `${logBase} 취소할 예약 데이터를 찾을 수 없습니다.`);
                connection.commit();
                cancelSendData = "NO DATA";
            }
        } catch (error) {
            connection.rollback();
            logger.writeLog("error", `${logBase} 시스템 오류. 취소되지 않았습니다. \nStacktrace: ${error.stack}`);
            cancelSendData = "DB ERROR";
        } finally {
            connection.release();
        }

        return {
            cancelSendData : cancelSendData,
            pushCode: pushCode,
            cancelPushData: ''
        };
    }    


    static async listDetailsLogMTS(storeCode, reserveCode, sendType, sendResult, page, rowCount, yearMonth = "") {
        let logBase = `models/messageHistoryModel.listDetailsLogMTS: storeCode(${storeCode}), reserveCode(${reserveCode}), sendType(${sendType}), sendResult(${sendResult})`;
        try {
            // logger.writeLog("error", `${logBase}`);
            let countQuery = `SELECT COUNT(TRAN_PR) AS TOTAL_COUNT FROM alltok.MTS_${sendType}_MSG_LOG${yearMonth != "" ? `_${yearMonth}` : ''} `;
            
            let query = `SELECT
                TRAN_PR,
                TRAN_PHONE,
                TRAN_STATUS, 
                TRAN_TYPE,
                TRAN_RSLT,
                TRAN_SENDDATE,
                TRAN_RSLTDATE,
                TRAN_END_TELCO,
                TRAN_ETC4
            FROM
                alltok.MTS_${sendType}_MSG_LOG${yearMonth != "" ? `_${yearMonth}` : ''}`;

            let whereQuery = `
            WHERE
                TRAN_ETC1 = ? AND TRAN_ETC3 = ?
                ${(sendResult != "") ? 
                    (sendResult == "0") ? ` TRAN_TRAN_RSLT = '1000' OR TRAN_TRAN_RSLT = '00' ` :
                    ` TRAN_TRAN_RSLT != '1000' OR TRAN_TRAN_RSLT != '00' ` : ''
                }
            `;

            countQuery += whereQuery;
            query = query + whereQuery + `ORDER BY
                TRAN_PHONE ASC`;
            if (parseInt(page) > 0) {
                query += ` LIMIT ${rowCount} OFFSET ${(page - 1) * rowCount}`;
            }
            logger.writeLog("info", `${logBase} MTS 상세 로그 내역을 가져옵니다.`);
            console.log(query)
            

            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, [storeCode, reserveCode]);
            const [rows, fields] = await pool.mysqlPool.query(query, [storeCode, reserveCode]);
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
}
