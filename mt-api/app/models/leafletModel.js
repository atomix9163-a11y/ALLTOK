const logger = require("../../config/logger");
const pool = require("../../config/database");
const moment = require("moment");
const leafletService = require('../services/leaflet.js');
const sanitizeService = require('../services/sanitizeService.js');

module.exports = class leafletModel {

    // 모든 스마트 전단 목록 얻기 (삭제 제외)
    static async list(storeCode, page, rowCount, searchJSON) {
        let logBase = `models/leafletModel.list: storeCode(${storeCode}), rowCount(${rowCount})`
        try {
            let countQuery = `SELECT COUNT(SEQ) AS TOTAL_COUNT FROM tbl_leaflet_main `;

            let query = `
            SELECT
                LEAFLET_CODE,
                STORE_CODE,
                TEMPLATE_CODE,
                TEMPLATE_NAME,
                TEMPLATE_THUMBNAIL_URI,
                TEMPLATE_USE_SECTION,
                TEMPLATE_MAIN,
                TEMPLATE_SUB,
                TEMPLATE_HTML,
                THUMBNAIL_URI,
                TAGS,
                USE_TIME,
                START_DATE,
                END_DATE,
                DATA,
                ORD,
                STATUS,
                C_TIME,
                C_ID,
                M_TIME,
                M_ID
            FROM
                tbl_leaflet_main 
            `;

            let whereQuery = `WHERE STATUS != 'C' AND STORE_CODE = ? `;
            // searchJSON으로부터 검색 조건 설정
            // 카테고리 1ST, 2ND
            if (searchJSON.cateCode != "") {
                whereQuery += ` AND (CATEGORY_1ST = '${searchJSON.cateCode}' OR CATEGORY_2ND = '${searchJSON.cateCode}') `;
            }
            // 섹션 사용 여부
            if (searchJSON.cateSection != "") {
                whereQuery += ` AND (TEMPLATE_USE_SECTION = '${searchJSON.cateSection}') `;
            }
            // 메인 수량 갯수
            let productQuery = "-1";
            for (let mainProduct of searchJSON.mainProduct) {
                if (mainProduct.option == "0" && mainProduct.isCheck) {
                    productQuery = "";
                    break;
                }
                if (mainProduct.isCheck) {
                    productQuery += "," + mainProduct.value;
                }
            }
            if (productQuery != "") {
                whereQuery += ` AND (TEMPLATE_MAIN IN (${productQuery})) `;
            }
            // 서브 수량 갯수
            productQuery = "-1";
            for (let subProduct of searchJSON.subProduct) {
                if (subProduct.option == "0" && subProduct.isCheck) {
                    productQuery = "";
                    break;
                }
                if (subProduct.isCheck) {
                    productQuery += "," + (parseInt(subProduct.option) - 1);
                }
            }
            if (productQuery != "") {
                whereQuery += ` AND (TEMPLATE_SUB IN (${productQuery})) `;
            }
            // tag 검색
            if (searchJSON.keyword != "") {
                let keywords = searchJSON.keyword.split(",");
                for (let keyword of keywords) {
                    whereQuery += ` AND (TAGS LIKE '%#${keyword}%')`;
                }
            }            

            countQuery += whereQuery;
            query = query + whereQuery + ` 
            ORDER BY
                ORD ASC, SEQ ASC
            LIMIT 
                ${rowCount} OFFSET ${(page - 1) * rowCount}
            `;

            // console.log(query)
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

    // 현재 운영 중인 스마트 전단 목록 얻기
    static async listForUse(storeCode) {
        let logBase = `models/leafletModel.listForUse: storeCode(${storeCode})`;
        try {
            let query = `
            SELECT
                LEAFLET_CODE,
                STORE_CODE,
                LM.TEMPLATE_CODE,
                TEMPLATE_NAME,
                TEMPLATE_THUMBNAIL_URI,
                TEMPLATE_USE_SECTION,
                TEMPLATE_MAIN,
                TEMPLATE_SUB,
                HTML AS TEMPLATE_HTML,
                LT.THUMBNAIL_URI,
                TAGS,
                USE_TIME,
                START_DATE,
                END_DATE,
                DATA,
                LM.ORD,
                STATUS,
                LM.C_TIME,
                LM.C_ID,
                LM.M_TIME,
                LM.M_ID
            FROM
                tbl_leaflet_main LM
                inner join tbl_leaflet_template LT ON LT.TEMPLATE_CODE = LM.TEMPLATE_CODE 
            WHERE
                STATUS = 'A' AND STORE_CODE = ? AND
                (USE_TIME = 'N' OR (USE_TIME = 'Y' AND ? BETWEEN START_DATE AND END_DATE))
            ORDER BY
                ORD ASC,
                START_DATE ASC`;
                
            const [rows, fields] = await pool.mysqlPool.query(query, [storeCode, moment().format("YYYY-MM-DD HH:mm:ss")]);
            return rows;            
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async get(leafletCode) {
        let logBase = `models/leafletModel.get: leafletCode(${leafletCode})`
        try {
            let query = `
            SELECT
                LEAFLET_CODE,
                STORE_CODE,
                LM.TEMPLATE_CODE,
                TEMPLATE_NAME,
                TEMPLATE_THUMBNAIL_URI,
                TEMPLATE_USE_SECTION,
                TEMPLATE_MAIN,
                TEMPLATE_SUB,
                HTML AS TEMPLATE_HTML,
                LT.THUMBNAIL_URI,
                TAGS,
                USE_TIME,
                START_DATE,
                END_DATE,
                DATA,
                LM.ORD,
                STATUS,
                LM.C_TIME,
                LM.C_ID,
                LM.M_TIME,
                LM.M_ID
            FROM
                tbl_leaflet_main LM
                inner join tbl_leaflet_template LT ON LT.TEMPLATE_CODE = LM.TEMPLATE_CODE
            WHERE
                LEAFLET_CODE = ?`;

            const [rows, fields] = await pool.mysqlPool.query(query, [leafletCode]);
            if (rows.length > 0)
                return rows[0];
            else
                return null
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async remove(storeCode, leafletCode) {
        let logBase = `models/leafletModel.remove: storeCode(${storeCode}), leafletCode(${leafletCode})`;
        const connection = await pool.mysqlPool.getConnection(async conn => conn); 
        try {
            connection.beginTransaction();

            let query = `UPDATE tbl_leaflet_main SET STATUS = 'C' WHERE LEAFLET_CODE = ?`;
            await connection.query(query, [leafletCode]);

            query = `UPDATE tbl_leaflet_main SET ORD=@ORD:=@ORD+1  WHERE STORE_CODE = ? AND  STATUS != 'C'  AND (@ORD := 0) = 0 ORDER BY ORD;`;
            await connection.query(query, [storeCode]);
            // 순번 정리

            await connection.commit();

            return leafletCode;
        } catch (error) {
            await connection.rollback();
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        } finally {
            connection.release();
        }         
    }

    // template 정보로부터 새로운 전단을 생성한다
    static async createByShuketTemplate(storeCode, template, C_ID) {
        let logBase = `models/leafletModel.create: template(${template.templateCode})`;
        try {            
            let query = 'SELECT IFNULL(MAX(SEQ), 0) + 1 AS SEQ FROM tbl_leaflet_main';            
            const [rowsCode, fieldsCode] = await pool.mysqlPool.query(query, []);
            const leafletCode = 'LF' + String(rowsCode[0].SEQ).padStart(8, "0");

            query = 'SELECT IFNULL(MAX(ORD), 0) + 1 AS LAST_ORD FROM tbl_leaflet_main WHERE STORE_CODE = ? AND STATUS != "C"';
            const [rowsORD] = await pool.mysqlPool.query(query, [storeCode]);
            const ORD = (rowsORD.length > 0) ? rowsORD[0].LAST_ORD : 1;

            query = `INSERT INTO tbl_leaflet_main (
                LEAFLET_CODE,
                STORE_CODE,
                CATEGORY_1ST,
                CATEGORY_2ND,
                TEMPLATE_CODE,
                TEMPLATE_NAME,
                TEMPLATE_THUMBNAIL_URI,
                TEMPLATE_USE_SECTION,
                TEMPLATE_MAIN,
                TEMPLATE_SUB,
                TEMPLATE_HTML,
                THUMBNAIL_URI,
                TAGS,
                USE_TIME,
                START_DATE,
                END_DATE,
                DATA,
                STATUS,
                ORD,
                C_TIME,
                C_ID,
                M_TIME,
                M_ID
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
                'N',
                null,
                null,
                null,
                'A',
                ?,
                ?,
                ?,
                null,
                null
            )`;
            await pool.mysqlPool.query(query, [
                leafletCode,
                storeCode,
                template.cateCode1st,
                template.cateCode2nd,
                template.templateCode,
                template.templateName,
                template.templateImage,
                template.templateUseCateSection,
                parseInt(template.templateTotalMainProduct),
                parseInt(template.templateSubProductInRow),
                template.templateHTML,
                '',
                template.templateTags,
                ORD,
                new Date(),
                C_ID
            ]);

            return leafletCode;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }            
    }

    static async create(storeCode, templateInfo, C_ID) {
        let logBase = `models/leafletModel.create: storeCode(${storeCode}), template(${templateInfo.TEMPLATE_CODE})`;
        try {            
            let query = 'SELECT IFNULL(MAX(SEQ), 0) + 1 AS SEQ FROM tbl_leaflet_main';            
            const [rowsCode, fieldsCode] = await pool.mysqlPool.query(query, []);
            const leafletCode = 'LF' + String(rowsCode[0].SEQ).padStart(8, "0");

            query = 'SELECT IFNULL(MAX(ORD), 0) + 1 AS LAST_ORD FROM tbl_leaflet_main WHERE STORE_CODE = ? AND STATUS != "C"';
            const [rowsORD] = await pool.mysqlPool.query(query, [storeCode]);
            const ORD = (rowsORD.length > 0) ? rowsORD[0].LAST_ORD : 1;

            query = `INSERT INTO tbl_leaflet_main (
                LEAFLET_CODE,
                STORE_CODE,
                CATEGORY_1ST,
                CATEGORY_2ND,
                TEMPLATE_CODE,
                TEMPLATE_NAME,
                TEMPLATE_THUMBNAIL_URI,
                TEMPLATE_USE_SECTION,
                TEMPLATE_MAIN,
                TEMPLATE_SUB,
                TEMPLATE_HTML,
                THUMBNAIL_URI,
                TAGS,
                USE_TIME,
                START_DATE,
                END_DATE,
                DATA,
                STATUS,
                ORD,
                C_TIME,
                C_ID,
                M_TIME,
                M_ID
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
                'N',
                null,
                null,
                null,
                'A',
                ?,
                ?,
                ?,
                null,
                null
            )`;
            await pool.mysqlPool.query(query, [
                leafletCode,
                storeCode,
                '',
                '',
                templateInfo.TEMPLATE_CODE,
                '',
                templateInfo.THUMBNAIL_URI,
                templateInfo.USE_SECTION,
                0,
                0,
                templateInfo.HTML,
                '',
                '',
                ORD,
                new Date(),
                C_ID
            ]);

            logger.writeLog("error", `${logBase} 템플릿으로부터 상품세트가 생성되었습니다.`);
            return leafletCode;
        } catch (error) {
            logger.writeLog("error", `${logBase} 템플릿으로부터 상품세트 생성이 실패했습니다.\nStacktrace: ${error.stack}`);
            return null;
        }            
    }

    static async toggleActive(leafletCode) {
        let logBase = `models/leafletModel.toggleActive: leafletCode(${leafletCode})`
        try {
            logger.writeLog("info", `${logBase} 상태 토글`);

            let query = `UPDATE tbl_leaflet_main SET STATUS = IF(STATUS = 'A', 'D', 'A') WHERE LEAFLET_CODE = ?`;
            await pool.mysqlPool.query(query, [leafletCode]);
            return leafletCode;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async modifyUseTime(leafletCode, useTime, startDate, endDate, M_ID) {
        let logBase = `models/leafletModel.toggleUseTime: leafletCode(${leafletCode}) useTime(${useTime}), startDate(${startDate}), endDate(${endDate})`
        try {
            logger.writeLog("info", `${logBase} 기간 사용 여부 변경`);

            if (useTime == 'Y') {
                let query = `UPDATE tbl_leaflet_main SET USE_TIME = 'Y', START_DATE = ?, END_DATE = ?, M_TIME = ?, M_ID = ? WHERE LEAFLET_CODE = ?`;
                await pool.mysqlPool.query(query, [startDate, endDate, new Date(), M_ID, leafletCode]);
            } else {
                let query = `UPDATE tbl_leaflet_main SET USE_TIME = 'N', START_DATE = null, END_DATE = null, M_TIME = ?, M_ID = ? WHERE LEAFLET_CODE = ?`;
                await pool.mysqlPool.query(query, [new Date(), M_ID, leafletCode]);
            }

            return leafletCode;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }
    
    static async updateADText(leafletCode, ADText, M_ID) {
        let logBase = `models/leafletModel.updateADText: leafletCode(${leafletCode}), M_ID(${M_ID})`
        try {
            logger.writeLog("info", `${logBase} 데이터 AD Text 업데이트`);

            let query = `UPDATE tbl_leaflet_main SET ADText = ?, M_TIME = ?, M_ID = ? WHERE LEAFLET_CODE = ?`;
            await pool.mysqlPool.query(query, [ADText, new Date(), M_ID, leafletCode]);

            return leafletCode;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async updateDataJSON(leafletCode, dataJSON, M_ID) {
        let logBase = `models/leafletModel.updateDataJSON: leafletCode(${leafletCode}), M_ID(${M_ID})`
        try {
            logger.writeLog("info", `${logBase} 데이터 JSON 업데이트`);

            let dataJSON_JSON = JSON.parse(dataJSON);
            // dataJSON.topNotice
            // 1) 저장 직전 진단(원인 추적용)
            const bad_topNotice = sanitizeService.detectBadChars(dataJSON_JSON.topNotice);
            if (bad_topNotice.surrogate || bad_topNotice.zeroWidth || bad_topNotice.control) {
                logger.writeLog("error", `${logBase} badChars detected: ${JSON.stringify(bad_topNotice)}`);
            }
            // 2) 저장 직전 정리(재발 방지)
            dataJSON_JSON.topNotice = sanitizeService.sanitizeHtmlForMySQL_keepEmoji(dataJSON_JSON.topNotice);

            // dataJSON.bottomInfo
            // 1) 저장 직전 진단(원인 추적용)
            const bad_bottomInfo = sanitizeService.detectBadChars(dataJSON_JSON.bottomInfo);
            if (bad_bottomInfo.surrogate || bad_bottomInfo.zeroWidth || bad_bottomInfo.control) {
                logger.writeLog("error", `${logBase} badChars detected: ${JSON.stringify(bad_bottomInfo)}`);
            }
            // 2) 저장 직전 정리(재발 방지)
            dataJSON_JSON.bottomInfo = sanitizeService.sanitizeHtmlForMySQL_keepEmoji(dataJSON_JSON.bottomInfo);

            dataJSON = JSON.stringify(dataJSON_JSON);

            let query = `UPDATE tbl_leaflet_main SET DATA = ?, M_TIME = ?, M_ID = ? WHERE LEAFLET_CODE = ?`;
            await pool.mysqlPool.query(query, [dataJSON, new Date(), M_ID, leafletCode]);

            return leafletCode;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async updateTemplate(leafletCode, templateCode, M_ID) {
        let logBase = `models/leafletModel.updateTemplate: leafletCode(${leafletCode}), templateCode(${templateCode}), M_ID(${M_ID})`
        try {
            logger.writeLog("info", `${logBase} 템플릿 변경`);

            let query = `SELECT THUMBNAIL_URI, HTML FROM tbl_leaflet_template WHERE TEMPLATE_CODE = ?`;
            const [row] = await pool.mysqlPool.query(query, [templateCode]);

            query = `UPDATE tbl_leaflet_main SET TEMPLATE_CODE = ?, M_TIME = ?, M_ID = ? WHERE LEAFLET_CODE = ?`;
            await pool.mysqlPool.query(query, [templateCode, new Date(), M_ID, leafletCode]);

            return row[0].HTML;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async moveUp(leafletCode, storeCode, order, M_ID) {
        let logBase = `models/leafletModel.moveUp: leafletCode(${leafletCode}), storeCode(${storeCode}), order(${order}), M_ID(${M_ID})`
        const connection = await pool.mysqlPool.getConnection(async conn => conn);
        try {
            logger.writeLog("info", `${logBase} 전단지 순서 변경 UP`);

            let query = "";

            // 현재 전단지 바로 위의 전단지 코드를 얻는다
            query = `SELECT LEAFLET_CODE FROM tbl_leaflet_main WHERE STORE_CODE = ? AND ORD = ? AND STATUS!='C'`;
            const [rows_prd] =  await pool.mysqlPool.query(query, [storeCode, order - 1]);
            // console.log(rows_prd[0].LEAFLET_CODE)

            connection.beginTransaction();
            // 바로 위 전단지 순서를 현재 전단지 순서로 바꾸고, 현재 전단지를 -1로 업데이트한다
            query = `UPDATE tbl_leaflet_main SET ORD = ? WHERE LEAFLET_CODE = ?`;
            await connection.query(query, [order - 1, leafletCode]);
            await connection.query(query, [order, rows_prd[0].LEAFLET_CODE]);

            await connection.commit();
            return leafletCode;
        } catch (error) {
            await connection.rollback();
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        } finally {
            connection.release();
        }
    }

    static async moveDown(leafletCode, storeCode, order, M_ID) {
        let logBase = `models/leafletModel.moveDown: leafletCode(${leafletCode}), storeCode(${storeCode}), order(${order}), M_ID(${M_ID})`
        const connection = await pool.mysqlPool.getConnection(async conn => conn);
        try {
            logger.writeLog("info", `${logBase} 전단지 순서 변경 DOWN`);

            let query = "";

            // 현재 전단지 바로 아래의 전단지 코드를 얻는다
            query = `SELECT LEAFLET_CODE FROM tbl_leaflet_main WHERE STORE_CODE = ? AND ORD = ? AND STATUS!='C'`;
            const [rows_prd] =  await pool.mysqlPool.query(query, [storeCode, order + 1]);
            console.log(rows_prd[0].LEAFLET_CODE)
            connection.beginTransaction();
            // 바로 위 전단지 순서를 현재 전단지 순서로 바꾸고, 현재 전단지를 -1로 업데이트한다
            query = `UPDATE tbl_leaflet_main SET ORD = ? WHERE LEAFLET_CODE = ?`;
            console.log(leafletCode, order, rows_prd[0].LEAFLET_CODE, order + 1)
            await connection.query(query, [order + 1, leafletCode]);
            await connection.query(query, [order, rows_prd[0].LEAFLET_CODE]);

            await connection.commit();
            return leafletCode;
        } catch (error) {
            await connection.rollback();
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        } finally {
            connection.release();
        }
    }

    static async updateThumbnail(leafletCode, thumbnailUri, M_ID) {
        let logBase = `models/leafletModel.updateThumbnail: leafletCode(${leafletCode}), thumbnailUri(${thumbnailUri}), M_ID(${M_ID})`
        try {
            logger.writeLog("info", `${logBase} 전단 썸네일 업데이트`);

            let query = `UPDATE tbl_leaflet_main SET THUMBNAIL_URI = ?, M_TIME = ?, M_ID = ? WHERE LEAFLET_CODE = ?`;
            await pool.mysqlPool.query(query, [thumbnailUri, new Date(), M_ID, leafletCode]);

            return leafletCode;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }

    static async copyLeaflet(storeCode, leafletCode, C_ID) {
        let logBase = `models/leafletModel.copyLeaflet: storeCode(${storeCode}), leafletCode(${leafletCode}), C_ID(${C_ID})`

        try {
            logger.writeLog("info", `${logBase} 전단 복사 시작`);

            // 전단 코드 생성
            let query = 'SELECT IFNULL(MAX(SEQ), 0) + 1 AS SEQ FROM tbl_leaflet_main';            
            const [rowsCode, fieldsCode] = await pool.mysqlPool.query(query, []);
            const newLeafletCode = 'LF' + String(rowsCode[0].SEQ).padStart(8, "0");

            // 해당 스토어의 전단 중 가장 나중 순번을 얻는다
            query = `SELECT IFNULL(MAX(ORD), 1) AS ORD FROM tbl_leaflet_main WHERE STORE_CODE = ? AND STATUS != 'C'`;
            const [rowsORD, fieldsORD] = await pool.mysqlPool.query(query, [storeCode]);
            let ORD = rowsORD[0].ORD + 1;

            // 전단을 복사
            query = `INSERT INTO tbl_leaflet_main (
                LEAFLET_CODE,
                STORE_CODE,
                TEMPLATE_CODE,
                CATEGORY_1ST,
                CATEGORY_2ND,
                TEMPLATE_NAME,
                TEMPLATE_THUMBNAIL_URI,
                TEMPLATE_USE_SECTION,
                TEMPLATE_MAIN,
                TEMPLATE_SUB,
                TEMPLATE_HTML,
                THUMBNAIL_URI,
                TAGS,
                USE_TIME,
                START_DATE,
                END_DATE,
                DATA,
                ORD,
                STATUS,
                C_TIME,
                C_ID,
                M_TIME,
                M_ID
            ) SELECT 
                ?,
                STORE_CODE,
                TEMPLATE_CODE,
                CATEGORY_1ST,
                CATEGORY_2ND,
                TEMPLATE_NAME,
                TEMPLATE_THUMBNAIL_URI,
                TEMPLATE_USE_SECTION,
                TEMPLATE_MAIN,
                TEMPLATE_SUB,
                TEMPLATE_HTML,
                THUMBNAIL_URI,
                TAGS,
                USE_TIME,
                START_DATE,
                END_DATE,
                DATA,
                ${ORD},
                STATUS,
                now(),
                ?,
                now(),
                ?
            FROM 
                tbl_leaflet_main 
            WHERE LEAFLET_CODE = ?`;
            console.log(query)
            await pool.mysqlPool.query(query, [newLeafletCode, C_ID, C_ID, leafletCode]);

            logger.writeLog("info", `${logBase} 전단 복사 완료`);
            return newLeafletCode;
        } catch (error) {
            logger.writeLog("error", `${logBase} 전단 복사 실패`);
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }
    }
}
