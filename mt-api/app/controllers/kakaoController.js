// const storeModel = require('../models/storeModel.js');
const storeService = require('../services/storeService.js');
const kakaoService = require('../services/kakaoService.js');
// const twagentService = require('../services/twagent.js');
const moment = require('moment');

module.exports = {

    /******************************************/
    /* 카카오비즈의 API 호출용 */
    /******************************************/
    async getTemplateList(req, res, next) {
        let storeCode = req.body.storeCode;
        let startDate = (req.body.startDate) ? req.body.startDate : '2022-01-01';
        let endDate = (req.body.endDate) ? req.body.endDate : moment(new Date()).format("YYYY-MM-DD");
        let page = (req.body.page) ? req.body.page : '1';
        let rows = (req.body.rows) ? req.body.rows : '50';
        let kepStatus = req.body.kepStatus;
        let storeInfo = await storeService.get(storeCode);
        // let storeInfo = await affiliatedStoreModel.get(store_code);

        let templateList = await kakaoService.getTemplateList(storeInfo.service.kakaoProfilekey, startDate, endDate, page, rows, kepStatus);
        console.log(templateList)
        res.status(200).json({
            result: true,
            data: templateList            
        });
    },

    async getTemplate(req, res, next) {
        let storeCode = req.body.storeCode;
        let templateCode = req.body.templateCode;
        let storeInfo = await storeService.get(storeCode);        

        let template = await kakaoService.getTemplate(storeInfo.service.kakaoProfilekey, templateCode);
        res.status(200).json({
            result: true,
            data: template
        });
    },
    /******************************************/
    /* 카카오비즈의 API 호출용 끝 */
    /******************************************/


}