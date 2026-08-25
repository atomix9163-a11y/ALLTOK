const shuketService = require('../services/shuketService.js');
const qmService = require('../services/qmService.js');

module.exports = {

    // app의 마트 정보를 가져온다. 푸시 보낼 때 정보를 사용하기 위함
    async getAppMartInfo(req, res, next) {
        const martCode = req.body.martCode;

        const response = await shuketService.getMartInfo(martCode);

        res.status(200).json({
            result: response ? true : false,
            data: response
        });
    },

    // 웹주문관리 특매상품 목록을 가져온다. push 발송용
    async getAppPushProducts(req, res, next) {
        const martCode = req.body.martCode;

        const response = await shuketService.getPushProducts(martCode);

        res.status(200).json({
            result: response ? true : false,
            data: response
        });
    },

    // 푸시를 발송한다
    async sendAppPush(req, res, next) {
        const shopType = req.body.shopType;
        const martCode = req.body.martCode;
        const mCode = req.body.mCode;
        const pushTarget = req.body.pushTarget ? req.body.pushTarget : 'N';
        const pushTargetScreenCode = req.body.pushTargetScreenCode ? req.body.pushTargetScreenCode : '';
        const appLogo = req.body.appLogo;
        const pushTitle = req.body.pushTitle;
        const pushContent = req.body.pushContent;
        const pushTime = req.body.pushTime;
        const pushOption = req.body.pushOption;
        const webUrl = req.body.webUrl;

        console.log("shopType", shopType, "martCode", martCode, "mCode", mCode, "pushTarget", pushTarget, "pushTargetScreenCode", pushTargetScreenCode, 
            "appLogo", appLogo, "pushTitle", pushTitle, "pushContent", pushContent, "pushTime", pushTime, "pushOption", pushOption)

        // 슈켓 연결(L)이거나 단독(U)일때 푸시는 슈켓 푸시로 보낸다
        const response = (shopType == "L" || shopType == "U") ? 
            await shuketService.sendAppPush(mCode, appLogo, pushTitle, pushContent, pushTime, pushOption, pushTarget, pushTargetScreenCode) : 
            await qmService.sendAppPush(martCode, pushTitle, "", webUrl, pushOption, pushTime);

        res.status(200).json({
            result: response ? true : false,
            data: response
        });
    },
    
}