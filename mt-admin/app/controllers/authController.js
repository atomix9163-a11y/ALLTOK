const authService = require('../services/authService.js');

module.exports = {
    async verify(req, res, next) {
        const authData = await authService.verify(req);

        if (authData && authData[0] == "mcomplex-backoffice") {
            // 사용자 정보를 얻어서 보관
            req.user = {
                app: authData[0],
                seq: authData[1],
                loginId: authData[2],
                name: authData[3],
                adminType: authData[4]
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
}