const storeService = require('../services/storeService.js');
const customersService = require('../services/customerService.js');

const numeral = require('numeral');
const moment = require('moment');

module.exports = {
    async info(req, res, next) {
        // const group_seq = req.query.group_seq;
        const storeCode = req.user.storeCode;   // 로그인한 마트의 번호 얻기
        let storeInfo = await storeService.getInfo(storeCode, req.cookies.xToken);

        // let groupList = await customersService.getGroupList(store_code, ['P', 'K', 'N'], req.cookies.xToken);

        console.log(req.user)
        res.render('customer/info', {             
            layout: 'layouts/default',
            pageTitle: "주소록 관리",
            active: "customers_info",
            user: req.user,
            storeInfo: storeInfo,
            // groupList: groupList,
            // firstGroup: groupList ? groupList[0] : null,
            // numeral: numeral,
            // moment: moment
        });
    },

}