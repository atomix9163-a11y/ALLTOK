const logger = require("../../config/logger");
const pool = require("../../config/database");

module.exports = class customerModel {
    static async getGroup(groupCode) {
        let logBase = `models/customerModel.getGroup: groupCode(${groupCode})`
        try {
            let query = `
            SELECT 
                seq,
                group_code,
                store_code,
                name,                
                active,
                C_ID,
                C_TIME
            FROM 
                tbl_affiliated_store_group 
            WHERE                
                group_code = ?`;

            const [rows] = await pool.mysqlPool.query(query, [groupCode]);
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
    
    static async groupList(storeCode, showDeleted = false) {
        let logBase = `models/customerModel.groupList: storeCode(${storeCode}), showDeleted(${showDeleted})`

        try {
            let query = `
            SELECT 
                seq,
                a.group_code,
                store_code,
                name,
                active,
                IFNULL(member_count, 0) AS member_count,
                C_ID,
                C_TIME
            FROM 
                tbl_affiliated_store_group a
                LEFT JOIN (
                    SELECT
						group_code,
                        COUNT(seq) AS member_count
                    FROM
                        tbl_affiliated_store_group_member
					WHERE
						store_code = ?
                    GROUP BY
                        group_code
                ) b ON b.group_code = a.group_code
            WHERE
                a.store_code = ?
                ${!showDeleted ? `AND a.active = 'A'` : ''} 
            ORDER BY name
            `;

            const [rows, fields] = await pool.mysqlPool.query(query, [storeCode, storeCode]);
            if (rows.length > 0) {
                logger.writeLog("info", `${logBase} - ${rows.length} rows return`);
                return rows;
            } else {
                logger.writeLog("info", `${logBase} - No data found`);
                return rows;
            }

        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async createGroup(storeCode, name, userId) {
        let logBase = `models/customerModel.createGroup: storeCode(${storeCode}), name(${name}), userId(${userId})`
        try {
            // 코드를 만들기 위해 카운트를 얻는다
            let countQuery = `SELECT IFNULL(MAX(seq), 0) AS foundCount FROM tbl_affiliated_store_group`;
            const [rowsCountFound, fieldsCountFound] = await pool.mysqlPool.query(countQuery, []);

            // 그룹 코드를 만든다
            let groupCode = "GR" + String(rowsCountFound[0].foundCount + 1).padStart(8, "0");
            
            let query = `INSERT INTO tbl_affiliated_store_group 
                (group_code, store_code, name, active, C_ID, C_TIME, M_ID, M_TIME) 
            values 
                (?, ?, ?, ?, ?, NOW(), null, null)`;

            const [rows, fields] = await pool.mysqlPool.query(query, [groupCode, storeCode, name, 'A', userId]);
            logger.writeLog("info", `${logBase} 그룹을 생성했습니다.`);
            return groupCode;
        } catch (error) {
            logger.writeLog("error", `${logBase} 그룹을 생성하지 못했습니다.`);
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return 0;
        }
    }

    static async updateGroup(groupCode, name, userId) {
        let logBase = `models/customerModel.updateGroup: groupCode(${groupCode}), name(${name}), userId(${userId})`
        try {
            let query = `UPDATE tbl_affiliated_store_group SET
                name = ?, 
                active = ?, 
                M_ID = ?, 
                M_TIME = NOW()
            WHERE
                group_code = ?`;
            await pool.mysqlPool.query(query, [name, 'A', userId, groupCode]);
            logger.writeLog("error", `${logBase}, groupCode(${groupCode}) 그룹 이름을 변경했습니다.`);
            return groupCode;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async removeGroup(groupCode, userId) {
        let logBase = `models/customerModel.removeGroup: groupCode(${groupCode}), userId(${userId})`
        try {
            let query = `UPDATE tbl_affiliated_store_group SET active = ?, 
                M_ID = ?, 
                M_TIME = NOW()
            WHERE
                group_code = ?`;
            await pool.mysqlPool.query(query, ['D', userId, groupCode]);
            logger.writeLog("info", `${logBase} 그룹을 삭제했습니다.`);
            return groupCode;
        } catch (error) {
            logger.writeLog("error", `${logBase} 그룹을 삭제하지 못했습니다.`);
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async reviveGroup(groupCode, userId) {
        let logBase = `models/customerModel.reviveGroup: groupCode(${groupCode}), userId(${userId})`
        try {
            let query = `UPDATE tbl_affiliated_store_group SET active = ?, 
                M_ID = ?, 
                M_TIME = NOW()
            WHERE
                group_code = ?`;
            await pool.mysqlPool.query(query, ['A', userId, groupCode]);
            logger.writeLog("info", `${logBase} 그룹을 복구했습니다.`);
            return groupCode;
        } catch (error) {
            logger.writeLog("error", `${logBase} 그룹을 복구하지 못했습니다.`);
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }    

    static async groupMemberCount(groupCode) {
        let logBase = `models/customerModel.groupMemberCount: groupCode(${groupCode})`
        try {
            let query = `
                    SELECT
                        COUNT(seq) AS member_count
                    FROM
                        tbl_affiliated_store_group_member
					WHERE
						group_code = ?
                    `;

            const [rows] = await pool.mysqlPool.query(query, [groupCode]);
            if (rows.length > 0) {
                return rows[0].member_count;
            } else {
                return 0;
            }

        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return 0;
        }
    }

    static async groupMemberList(groupCode, phone, page, rowCount) {
        let logBase = `models/customerModel.groupMemberList: groupCode(${groupCode})`
        try {
            let countQuery = `SELECT 
                COUNT(seq) AS MEMBER_COUNT 
            FROM 
                tbl_affiliated_store_group_member 
            WHERE 
                group_code = ?
                ${(phone != "") ? ` AND phone LIKE '%${phone}' ` : "" }`;

            let query = `
            SELECT 
                seq,
                group_code,
                phone,
                LENGTH(phone) AS phone_length,
                C_ID,
                C_TIME
            FROM 
                tbl_affiliated_store_group_member
            WHERE
                group_code = ?
                ${(phone != "") ? ` AND phone LIKE '%${phone}' ` : "" }
            ORDER BY
                LENGTH(phone) DESC,
                C_TIME DESC,
                phone
            LIMIT 
                ${rowCount} OFFSET ${(page - 1) * rowCount}`;
            const [rowsCount, fieldsCount] = await pool.mysqlPool.query(countQuery, [groupCode]);

            const [rows, fields] = await pool.mysqlPool.query(query, [groupCode]);
            if (rows.length > 0) {
                // logger.writeLog("info", `${logBase} - ${rows.length} rows return`);
                return {
                    count: rowsCount[0].MEMBER_COUNT,
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

    // groups는 ,로 구분된 그룹 코드
    static async groupsAllMembers(groups) {        
        let logBase = `models/customerModel.groupsAllMembers: groups(${groups})`
        try {
            let query = `
            SELECT 
                seq,
                group_code,
                phone,
                C_ID,
                C_TIME
            FROM 
                tbl_affiliated_store_group_member
            WHERE
                group_code IN (${groups})
            ORDER BY
                phone`;

            const [rows, fields] = await pool.mysqlPool.query(query, []);
            if (rows.length > 0) {
                return rows;                
            } else {
                return rows;                
            }

        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    // 수신 거부 목록 얻기
    static async refuseMembers(storeCode) {        
        let logBase = `models/customerModel.refuseMembers: storeCode(${storeCode})`
        try {
            let query = `
            SELECT 
                DISTINCT
                phone
            FROM 
                tbl_refuse_phone
            WHERE                
                store_code is null
                ${(storeCode.length > 0) ? ` OR store_code = '${storeCode}' ` : ``}
            ORDER BY
                phone`;

            // console.log(query)
            const [rows, fields] = await pool.mysqlPool.query(query, []);
            return rows;                
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async addGroupMember(groupCode, storeCode, phone, userId) {
        let logBase = `models/customerModel.addGroupMember: groupCode(${groupCode}), storeCode(${storeCode}), phone(${phone}), userId(${userId})`
        try {
            // 이미 있으면 -1 리턴
            let checkQuery = `SELECT COUNT(*) AS FOUNDCOUNT FROM tbl_affiliated_store_group_member WHERE group_code = ? AND phone = ?`;
            const [rowsFound] = await pool.mysqlPool.query(checkQuery, [groupCode, phone]);
            if (rowsFound[0].FOUNDCOUNT != 0) return -1;

            let query = `INSERT INTO tbl_affiliated_store_group_member 
                (group_code, store_code, phone, C_ID, C_TIME) 
            values 
                (?, ?, ?, '', NOW())`;

            // 추가했으면 id 리턴
            const [rows, fields] = await pool.mysqlPool.query(query, [groupCode, storeCode, phone]);
            logger.writeLog("info", `${logBase} 그룹에 고객을 등록했습니다.`);
            return rows.insertId;
        } catch (error) {
            logger.writeLog("error", `${logBase} 그룹에 고객을 등록하지 못했습니다.`);
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            // 에러면 0 리턴
            return 0;
        }
    }

    static async removeGroupMember(groupCode, phone, userId) {
        let logBase = `models/customerModel.createGroupMember: groupCode(${groupCode}), phone(${phone}), userId(${userId})`
        try {
            let query = `DELETE FROM tbl_affiliated_store_group_member WHERE group_code = ? AND phone = ?`;

            // 삭제했으면 1 리턴
            const [rows, fields] = await pool.mysqlPool.query(query, [groupCode, phone]);
            logger.writeLog("info", `${logBase} 그룹에서 고객을 삭제했습니다.`);
            return 1;
        } catch (error) {
            logger.writeLog("error", `${logBase} 그룹에서 고객을 삭제하지 못했습니다.`);
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            // 에러면 0 리턴
            return 0;
        }
    }

    static async removeGroupMemberSeq(groupCode, seq, userId) {
        let logBase = `models/customerModel.removeGroupMemberSeq: groupCode(${groupCode}), seq(${seq}), userId(${userId})`
        try {
            let query = `DELETE FROM tbl_affiliated_store_group_member WHERE group_code = ? AND seq = ?`;

            // 삭제했으면 1 리턴
            const [rows, fields] = await pool.mysqlPool.query(query, [groupCode, seq]);
            logger.writeLog("info", `${logBase} 그룹에서 고객을 삭제했습니다.`);
            return 1;
        } catch (error) {
            logger.writeLog("error", `${logBase} 그룹에서 고객을 삭제하지 못했습니다.`);
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            // 에러면 0 리턴
            return 0;
        }
    }

    // static async removeAllGroupMember(group_code) {
    //     let logBase = `models/customerModel.removeAllGroupMember: group_code(${group_code})`
    //     try {
    //         let query = `DELETE FROM tbl_affiliated_store_group_member WHERE group_code = ?`;

    //         // 삭제했으면 1 리턴
    //         const [rows, fields] = await pool.mysqlPool.query(query, [group_code]);
    //         return 1;
    //     } catch (error) {
    //         logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
    //         // 에러면 0 리턴
    //         return 0;
    //     }
    // }    

    static async addCustomersFromFile(groupCode, storeCode, phoneList) {
        let logBase = `models/customerModel.addCustomersFromFile: groupCode(${groupCode}), storeCode(${storeCode}), phoneList(${phoneList.length})`
        try {
            let query = `INSERT INTO tbl_affiliated_store_group_member (group_code, store_code, phone, C_ID, C_TIME) VALUES ?`;

            let phoneDataList = []
            for (let phone of phoneList) {
                let phoneData = [groupCode, storeCode, phone, '', new Date()];
                phoneDataList.push(phoneData);
            }
            await pool.mysqlPool.query(query, [phoneDataList]);
            return true;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            // 에러면 0 리턴
            return false;
        }
    }
    
    // static async customerAllCount(store_code) {
    //     let logBase = `models/customerModel.customerCount`;
    //     try {
    //         // 활성 가맹점 숫자 리턴
    //         let query = `SELECT 
    //             count(asgm.seq) as total_count
    //         FROM 
    //             tbl_affiliated_store_group_member asgm
    //             INNER JOIN tbl_affiliated_store_group asg ON asg.group_code = asgm.group_code
    //         where
    //             asg.store_code = ?`;
    //         const [rows, fields] = await pool.mysqlPool.query(query, [store_code]);            
    //         return rows[0].total_count;
    //     } catch (error) {
    //         logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
    //         return -1;
    //     }
    // }
}