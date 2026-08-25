const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const logger = require('../../config/logger.js');
const authService = require('../services/authService.js');
const userModel = require('../models/userModel.js');
const storeModel = require('../models/storeModel.js');

module.exports = {
    
    async verify(req, res, next) {
        console.log("req.headers.xtoken", req.headers.xtoken)
        const authData = await authService.verify(req);
        console.log("authData=====================================", authData)
        if (authData) {
                req.user = {
                app: authData[0],
                storeCode: authData[2],
                loginId: authData[3]
            }
        }
        
        if (!authData) {
            // 사용자 정보를 얻어서 보관
            res.json({
                result: false,
                data : null
            });
        } else {
            next();
        }
    },

    async verifyAPI(req, res, next) {
        console.log("req.headers.xtoken", req.headers.xtoken)
        const authData = await authService.verify(req);
        console.log("authData=====================================", authData)
        if (authData) {
                req.user = {
                app: authData[0],
                storeCode: authData[2],
                loginId: authData[3]
            }
        }
        
        if (!authData) {
            // 사용자 정보를 얻어서 보관
            res.status(200).json({
                resultCode: 100,
                resultMessage: "토큰이 정상적이지 않습니다.",
                resultData: null
            }); 
        } else {
            next();
        }
    },

    //  로그인 프로세스
    async loginVerify(req, res, next) {
        let loginId = req.body.loginId;
        let password = req.body.password;
        let refer = (req.body.refer) ? req.body.refer : '';

        let userInfo = await userModel.getByLoginId(loginId);
        // console.log(userInfo);
        if (userInfo && userInfo.active == 'A') {
            // 암호화된 암호를 비교
            const result = compareSync(password, userInfo.password);
            if (result) {
                // 토큰 생성
                const secretKey = require("../../config/secretKey.js").secretKey;
                const options = require("../../config/secretKey.js").options;
                let accessToken = sign({ result: ["mcomplex-backoffice", userInfo.seq, "", userInfo.login_id, userInfo.name, userInfo.admin_type] }, secretKey, options);
                // let accessToken = sign({ result: ["mcomplex-shuket", userInfo.seq, userInfo.login_id, userInfo.name, userInfo.admin_type] }, secretKey, options);
                logger.writeLog('info', `controller/login: 아이디 암호 매칭 성공 ${loginId} / ${accessToken}`);
    
                if (userInfo.active == 'A') {               
                    return res.json({
                        result: true,
                        data: {
                            seq: userInfo.seq,
                            loginId: userInfo.login_id,
                            name: userInfo.name,
                            adminType: userInfo.admin_type,
                            token: accessToken
                        }
                    })
                } else {
                    return res.json({
                        result: false,
                        data: {
                            code : 1,
                            message: "Waiting For Approval"
                        }
                    });
                }
            } else {
                logger.writeLog('info', `controller/login: 로그인 실패 (암호 매칭 실패) ${loginId} / ${password}`);
                return res.json({
                    result: false,
                    data: {
                        code: 2,
                        message: "Not match password"
                    }
                });
            }
        } else {
            logger.writeLog('info', `controller/login: 로그인 실패 (아이디 찾을 수 없음) ${loginId}`);
            return res.json({
                result: false,
                data: {
                    code: 3, 
                    mesage: "No user Id exist"
                }
            });
        }
    },

    async loginVerifyStore(req, res, next) {
        let loginId = req.body.loginId;
        let password = req.body.password;
        let refer = (req.body.refer) ? req.body.refer : '';

        let storeInfo = await storeModel.getByLoginId(loginId);
        // console.log(userInfo);
        if (storeInfo && storeInfo.active == 'A') {
            // 암호화된 암호를 비교
            const result = compareSync(password, storeInfo.login_pwd);
            if (result) {
                // 토큰 생성
                const secretKey = require("../../config/secretKey.js").secretKey;
                const options = require("../../config/secretKey.js").options;
                let accessToken = sign({ result: ["mcomplex-front", storeInfo.seq, storeInfo.store_code, storeInfo.login_id, storeInfo.name, storeInfo.M_MOA_CODE, storeInfo.marto_code, storeInfo.marto_API_key] }, secretKey, options);
                // logger.writeLog('info', `controller/login: 아이디 암호 매칭 성공 ${loginId} / ${accessToken}`);
    
                if (storeInfo.active == 'A') {               
                    return res.json({
                        result: true,
                        data: {
                            seq: storeInfo.seq,
                            loginId: storeInfo.login_id,
                            name: storeInfo.name,
                            token: accessToken
                        }
                    })
                } else {
                    return res.json({
                        result: false,
                        data: {
                            code : 1,
                            message: "Waiting For Approval"
                        }
                    });
                }
            } else {
                logger.writeLog('info', `controller/login: 로그인 실패 (암호 매칭 실패) ${loginId} / ${password}`);
                return res.json({
                    result: false,
                    data: {
                        code: 2,
                        message: "Not match password"
                    }
                });
            }
        } else {
            logger.writeLog('info', `controller/login: 로그인 실패 (아이디 찾을 수 없음) ${loginId}`);
            return res.json({
                result: false,
                data: {
                    code: 3, 
                    mesage: "No user Id exist"
                }
            });
        }
    },

    async createToken(req, res, next) {
        const seq = 0;  // API 용
        const loginId = req.body.id;
        const name = req.body.name;
        const adminType = "extern-API";
        const secretKey = require("../../config/secretKey.js").secretKey;
        const options = require("../../config/secretKey.js").options;

        let accessToken = sign({ result: ["mcomplex-auth", seq, "", loginId, name, adminType] }, secretKey, options);
        res.status(200).json({
            resultCode: 200,
            resultMessage: "성공",
            resultData: accessToken
        });        
    }
 }