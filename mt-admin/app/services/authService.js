const logger = require('../../config/logger.js');
const jwt = require('jsonwebtoken');
const secretKey = require('../../config/secretKey.js').secretKey;

module.exports = class authService {
    static async verify(req) {
        const token = req.cookies.xToken;

        if (token) {
            let verifyData = jwt.verify(token, secretKey, (err, decoded) => {
                if (err) {
                    logger.writeLog('error', `service/authService: ${err}`);           
                    return null;
                } else {
                    logger.writeLog('info', `service/authService: 토큰체크 완료`);
                    // console.log("decoded.result", decoded.result);
                    return decoded.result;
                }
            });
            return verifyData;
        } else {
            logger.writeLog('error', `service/authService: 토큰 없음`);           
            return null;
        }

    }
}