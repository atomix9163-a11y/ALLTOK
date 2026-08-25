const logger = require("../../config/logger");
const pool = require("../../config/database");

module.exports = class imageControllerModel {
    static async add(imagePath) {
        let logBase = `models/imageControllerModel.add: imagePath(${imagePath})`
        try {            
            let query = 'SELECT IFNULL(MAX(SEQ), 0) + 1 AS SEQ FROM tbl_image_storage';            
            const [rowsCode, fieldsCode] = await pool.mysqlPool.query(query, []);
            const imageCode = 'IMG' + String(rowsCode[0].SEQ).padStart(7, "0");

            query = `INSERT INTO tbl_image_storage (
                IMAGE_CODE,
                IMAGE_PATH,
                C_TIME
            ) VALUES (
                ?,
                ?,
                ?
            )`;
            await pool.mysqlPool.query(query, [
                imageCode,
                imagePath,
                new Date()
            ]);
            logger.writeLog("info", `${logBase} 이미지 업로드 완료`);
            return imageCode;
        } catch (error) {
            logger.writeLog("error", `${logBase} \nStacktrace: ${error.stack}`);
            return null;
        }    
    }


}