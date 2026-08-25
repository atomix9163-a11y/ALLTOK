const cashModel = require('../models/cashModel.js');

module.exports = {
    async historyList(req, res, next) {
        const storeCode = req.body.storeCode;
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;
        const page = req.body.page;
        const rowCount = req.body.rowCount;

        const data = await cashModel.chargeHistoryList(storeCode, startDate, endDate, page, rowCount, '');

        res.status(200).json({
            result: true,
            data: data
        });
    },

    async add(req, res, next) {
        const storeCode = req.body.storeCode;
        const amount = (req.body.amount) ? parseFloat(req.body.amount) : 0;
        const cashType = req.body.cashType;
        const C_ID = req.user.loginId;

        const data = await cashModel.add(storeCode, amount, cashType, C_ID);

        res.status(200).json({
            result: true,
            data: data
        });
    },
}