const logger = require("../../config/logger");
const pool = require("../../config/database");

module.exports = class imageModel {
    static async listCategory() {
        let logBase = `models/imageModel.listCategory`;
        try {            
            let query = `
            SELECT
                seq,
                category_code,
                category_name,
                category_order,
                active
            FROM
                tbl_product_image_category
            WHERE
                active = 'Y'
            ORDER BY
                category_order`;

            const [rows] = await pool.mysqlPool.query(query, []);
            return rows;
        } catch (error) {
            logger.writeLog("error", `${logBase} 이미지 카테고리 얻기 실패\nStacktrace: ${error.stack}`);
            return -1;
        }
    }

    static async list(categoryCode, tags, page, rowCount, active = 'Y') {
        let logBase = `models/imageModel.list: page(${page}) active(${active})`
        try {
            let countQuery = `SELECT COUNT(pim.seq) AS IMAGE_COUNT FROM 
                    tbl_product_image_main pim
                    INNER JOIN tbl_product_image_category pic ON pic.category_code = pim.category_code 
                WHERE pim.active = ? `;

            let query = `
            SELECT
                pim.seq,
                pim.image_code,
                pim.category_code,
                pic.category_name,
                pim.path,
                pim.tags,
                pim.use_count,
                pim.active,
                pim.C_ID,
                pim.C_TIME,
                pim.M_ID,
                pim.M_TIME
            FROM
                tbl_product_image_main pim
                INNER JOIN tbl_product_image_category pic ON pic.category_code = pim.category_code 
            WHERE
                pim.active = ?`;
            if (categoryCode != "") {
                countQuery += ` AND category_code = '${categoryCode}' `;
                query += ` AND pim.category_code = '${categoryCode}' `;
            }
            if (tags != "") {
                const tagCount = tags.split(/\s/).length;
                // 검색어 태그가 있으면
                tags = "'" + tags.replaceAll(" ", "','") + "'";
                let searchQuery = ` AND  pim.image_code IN (
					SELECT image_code FROM complexm.tbl_product_image_tag
					where tag IN (${tags})
                    group by image_code
					having COUNT(image_code) >= ${tagCount}
                 )`;
                 countQuery += searchQuery;
                 query += searchQuery;
            }
            query += `ORDER BY 
                C_TIME DESC
            LIMIT ${rowCount} OFFSET ${(page - 1) * rowCount}`;            
            
            const [rowsCount] = await pool.mysqlPool.query(countQuery, [active]);
            const [rows] = await pool.mysqlPool.query(query, [active]);
            if (rows.length > 0) {                
                return {
                    count: rowsCount[0].IMAGE_COUNT,
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

    static async create(categoryCode, path, tags, C_ID = null) {
        let logBase = `models/imageModel.create: categoryCode(${categoryCode}), path(${path}), tags(${tags}), C_ID(${C_ID})`;
        const connection = await pool.mysqlPool.getConnection(async (conn) => conn);
        try {
            let query = 'SELECT IFNULL(MAX(seq), 0) + 1 AS SEQ FROM tbl_product_image_main';            
            const [rowsCode, fieldsCode] = await pool.mysqlPool.query(query, []);
            const imageCode = 'IM' + String(rowsCode[0].SEQ).padStart(8, "0"); 

            // 이미지 메인 데이터 저장
            query = `INSERT INTO tbl_product_image_main (
                image_code, category_code, path, tags, use_count, active, C_ID, C_TIME
            ) VALUES (
                ?, ?, ?, ?, 0, 'Y', ?, ?
            )`;
            connection.query(query, [imageCode, categoryCode, path, tags, C_ID, new Date()])

            // 이미지 태그 저장
            console.log("tags", tags)
            let tagArray = tags.split(" ");
            query = `INSERT INTO tbl_product_image_tag (image_code, tag) VALUES ?`;

            let tagDataList = []
            for (let tag of tagArray) {
                let tagData = [imageCode, tag];
                tagDataList.push(tagData);
            }
            await connection.query(query, [tagDataList]);

            connection.commit();

            logger.writeLog("error", `${logBase} 이미지가 추가되었습니다.`);
            return imageCode;
        } catch (error) {
            connection.rollback();

            logger.writeLog("error", `${logBase} 이미지 추가가 실패했습니다.\nStacktrace: ${error.stack}`);
            return false;
        } finally {
            connection.release();
        }
    }

    static async get(imageCode) {
        let logBase = `models/imageModel.get: imageCode(${imageCode})`
        try {
            let query = `
            SELECT
                pim.seq,
                pim.image_code,
                pim.category_code,
                pic.category_name,
                pim.path,
                pim.tags,
                pim.use_count,
                pim.active,
                pim.C_ID,
                pim.C_TIME,
                pim.M_ID,
                pim.M_TIME
            FROM
                tbl_product_image_main pim
                INNER JOIN tbl_product_image_category pic ON pic.category_code = pim.category_code 
            WHERE
                pim.image_code = ?`;
            const [rows, fields] = await pool.mysqlPool.query(query, [imageCode]);            
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

    static async remove(imageCode) {
        let logBase = `models/imageModel.remove: imageCode(${imageCode})`
        try {
            let query = 'DELETE FROM tbl_product_image_tag WHERE image_code = ?';
            await pool.mysqlPool.query(query, [imageCode]);

            query = 'UPDATE tbl_product_image_main SET active = "N" WHERE image_code = ?';
            const [rows, fields] = await pool.mysqlPool.query(query, [imageCode]);
            if (rows.length > 0) {
                logger.writeLog("info", `${logBase} 이미지를 미사용처리하였습니다.`);
                return imageCode;
            } else {
                return null;
            }
        } catch (error) {
            logger.writeLog("error", `${logBase} 이미지 미사용 처리에 실패했습니다.\nStacktrace: ${error.stack}`);
            return null;
        }
    }
    
    static async update(imageCode, categoryCode, tags, M_ID) {
        let logBase = `models/imageModel.update: imageCode(${imageCode}), categoryCode(${categoryCode}), tags(${tags}), M_ID(${M_ID})`;
        const connection = await pool.mysqlPool.getConnection(async (conn) => conn);
        try {
            // 이미지 메인 데이터 저장
            let query = `UPDATE tbl_product_image_main SET 
                category_code = ?, 
                tags = ?, 
                M_ID = ?, 
                M_TIME = ?
            WHERE
                image_code = ?`;
            connection.query(query, [categoryCode, tags, M_ID, new Date(), imageCode])

            // 이미지 태그 저장
            query = `DELETE FROM tbl_product_image_tag WHERE image_code = ?`;
            await connection.query(query, [imageCode]);

            let tagArray = tags.split(" ");
            query = `INSERT INTO tbl_product_image_tag (image_code, tag) VALUES ?`;

            let tagDataList = []
            for (let tag of tagArray) {
                let tagData = [imageCode, tag];
                tagDataList.push(tagData);
            }
            await connection.query(query, [tagDataList]);

            connection.commit();

            logger.writeLog("error", `${logBase} 이미지 정보가 변경되었습니다.`);
            return imageCode;
        } catch (error) {
            connection.rollback();

            logger.writeLog("error", `${logBase} 이미지 정보 변경이 실패했습니다.\nStacktrace: ${error.stack}`);
            return false;
        } finally {
            connection.release();
        }
    }
}