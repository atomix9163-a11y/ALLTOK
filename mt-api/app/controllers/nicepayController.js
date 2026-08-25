const virtualBankModel = require('../models/virtualBankModel.js');
const nicepayService = require('../services/nicepayService.js');

module.exports = {
    // 과오납 체크 API 호출 및 가상계좌입금 프로세스 시작
    async sendVerify(req, res, next) {
        let storeCode = req.body.storeCode;
        let amount = parseInt(req.body.amount);
        
        const result = await nicepayService.sendVerify(storeCode, amount);

        res.status(200).json({
            result: true,
            data: result
        });
    },

    async getLiveVirtualBank(req, res, next) {
        let storeCode = req.body.storeCode;
        
        const result = await virtualBankModel.getLiveVirtualBank(storeCode);

        res.status(200).json({
            result: true,
            data: result
        });
    },

    async accountList(req, res, next) {
        let searchKey = req.body.searchKey;
        let notAssigned = req.body.notAssigned ? req.body.notAssigned : 'N';
        let accountType = req.body.accountType ? req.body.accountType : '62';
        let page = req.body.page;
        let rowCount = req.body.rowCount;

        const result = await virtualBankModel.listVirtualBankAccount(notAssigned, accountType, searchKey, page, rowCount);

        res.status(200).json({
            result: true,
            data: result
        });
    },

    async accountLink(req, res, next) {
        let accountCode = req.body.accountCode;
        let storeCode = req.body.storeCode;

        // 이미 사용 중인 계좌인지 확인
        const usedAccount = await virtualBankModel.checkUsedAccount(accountCode);
        if (usedAccount == -1) {
            res.status(200).json({
                result: false,
                data: -1
            });
            return;
        }
        if (usedAccount > 0) {
            res.status(200).json({
                result: false,
                data: -2
            });
            return;
        }

        // 이미 연결된 가맹점인지 확인
        const usedStore = await virtualBankModel.checkUsedStore(storeCode);
        if (usedStore == -1) {
            res.status(200).json({
                result: false,
                data: -3
            });
            return;
        }
        if (usedStore > 0) {
            res.status(200).json({
                result: false,
                data: -4
            });
            return;
        }

        const result = await virtualBankModel.linkAccountStore(accountCode, storeCode);

        res.status(200).json({
            result: true,
            data: result
        });
    },
    
    async accountUnlink(req, res, next) {
        let accountCode = req.body.accountCode;
        let storeCode = req.body.storeCode;

        const result = await virtualBankModel.unlinkAccountStore(accountCode, storeCode);

        res.status(200).json({
            result: true,
            data: result
        });
    },
    
    async accountHistory(req, res, next) {
        let storeCode = req.body.storeCode;
        let page = req.body.page;
        let rowCount = req.body.rowCount;

        const result = await virtualBankModel.listVirtualBankAccountHistory(storeCode, page, rowCount);

        res.status(200).json({
            result: true,
            data: result
        });
    },

    async accountHistoryMonth(req, res, next) {
        let year = req.body.year;
        let month = req.body.month;
        let page = req.body.page;
        let rowCount = req.body.rowCount;

        const result = await virtualBankModel.listVirtualBankAccountHistoryMonth(year, month, page, rowCount);

        res.status(200).json({
            result: true,
            data: result
        });
    },

    async accountHistoryMonthERP(req, res, next) {
        let year = req.body.year;
        let month = req.body.month;

        const result = await virtualBankModel.listVirtualBankAccountHistoryMonthERP(year, month);

        res.status(200).json({
            result: true,
            data: result
        });
    },
    
}