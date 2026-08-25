const pool = require("../../config/database");
const logger = require("../../config/logger");

module.exports = class authModel {
    static async verifyRegNum(verifyNumber) {
        try {
            const [rows, fields] = await pool.mysqlPool.query(`SELECT REG_NUM FROM TBL_COMPANY_MAIN WHERE REG_NUM = ?`, [verifyNumber]);
            if (rows[0] != undefined) {
                // 사업자등록번호 조회 될 경우
                return 1;
            } else {
                // 사업자등록번호 조회 안됬을 경우
                return 2;
            }
        } catch (err) {
            logger.writeLog("error", `models/signUpModel.verifyRegNum: ${error}`);
            return null;
        }
    }
}
