const storeService = require('../services/storeService.js');
const authService = require('../services/authService.js');
const { sign } = require("jsonwebtoken");

module.exports = {
    async verify(req, res, next) {
        const token = req.cookies.xToken;
        const authData = await authService.verify(token);

        if (authData && authData[0] == "mcomplex-front") {
            // 사용자 정보를 얻어서 보관
            req.user = {
                app: authData[0],
                seq: authData[1],
                storeCode: authData[2],
                loginId: authData[3],
                name: authData[4]
            }
        } else {
            req.user = null;
        }

        next();

    },
    
    async redirectLogin(req, res, next) {
        if (!req.user) {
            let loginUrl = "/auth/login?refer=" + ((req.route.path != 'login') ? req.originalUrl : '');
            res.redirect(loginUrl);
        } else
            next();
    },

    async login(req, res, next) {
        // 0: 정상 1 :로그인 에러 후
        let resultCode = (req.query.result) ? req.query.result : '0';
        let refer = (req.query.refer) ? req.query.refer : '';

        res.render('login', {             
            layout: 'layouts/full',
            apiServer: apiServer,
            resultCode: resultCode,
            refer: refer
        });
    },

    async logout(req, res, next) {
        // 토큰 쿠키의 유효기간을 0으로 세팅
        res.cookie('xToken', { expires: 0 });

        res.redirect("/");
    },

    async manage(req, res, next) {
        const storeCode = req.params.storeCode;
        const xToken = req.params.xToken;        
        const authData = await authService.verify(xToken);

        let storeInfo = await storeService.getInfo(storeCode, xToken);
        const secretKey = require("../../config/secretKey.js").secretKey;
        const options = require("../../config/secretKey.js").options;
        let accessToken = sign({ result: ["mcomplex-front", storeInfo.seq, storeInfo.store_code, storeInfo.login_id, storeInfo.name, storeInfo.M_MOA_CODE, storeInfo.marto_code, storeInfo.marto_API_key] }, secretKey, options);

        res.render('oAuth', {             
            layout: 'layouts/full',
            loginId: "shuket-admin",
            xToken: accessToken
        });

    },
}