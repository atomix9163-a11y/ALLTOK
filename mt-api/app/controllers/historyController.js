const { compareSync } = require('bcrypt');
const historyModel = require('../models/historyModel.js');
const qmService = require('../services/qmService.js');

module.exports = {
    // KKO BIZ & RCS
    async list(req, res, next) {
        const storeCode = req.body.storeCode;
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;
        const page = req.body.page;
        const rowCount = req.body.rowCount;

        data = await historyModel.list(storeCode, "", startDate, endDate, page, rowCount);

        res.status(200).json({
            result: true,
            data: data
        });
    },

    async listYearMonth(req, res, next) {
        const storeCode = req.body.storeCode;
        const yearMonth = req.body.yearMonth;   // 202408
        const page = req.body.page;
        const rowCount = req.body.rowCount;

        data = await historyModel.listYearMonth(storeCode, "", yearMonth, page, rowCount);

        res.status(200).json({
            result: true,
            data: data
        });
    },

    async cancelReserve(req, res, next) {
        const storeCode = req.body.storeCode;
        const reserveCode = req.body.reserveCode;

        data = await historyModel.cancel(storeCode, reserveCode);
        // 신규 매장은 모두 MTS로 세팅할 것이기 때문에 (기존 매장도 변경 시 MTS로 변경), 큐마켓 연동 코드는 넣지 않음
        res.status(200).json({
            result: true,
            data: data
        });
    },

    async listDetails(req, res, next) {
        const storeCode = req.body.storeCode;
        const reserveCode = req.body.reserveCode;
        const yearMonth = req.body.yearMonth ? req.body.yearMonth : '';
        const sendType = req.body.sendType;
        const sendResult = req.body.sendResult;
        const page = req.body.page;
        const rowCount = req.body.rowCount;
        
        let data = await historyModel.listDetailsLog(storeCode, reserveCode, sendType, sendResult, page, rowCount, yearMonth);

        res.status(200).json({
            result: true,
            data: data
        });
    }, 
    // KKO BIZ & RCS end

    // MTS
    async listMTS(req, res, next) {
        const storeCode = req.body.storeCode;
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;
        const page = req.body.page;
        const rowCount = req.body.rowCount;

        data = await historyModel.listMTS(storeCode, "", startDate, endDate, page, rowCount);

        res.status(200).json({
            result: true,
            data: data
        });
    },

    async listYearMonthMTS(req, res, next) {
        const storeCode = req.body.storeCode;
        const yearMonth = req.body.yearMonth;   // 202408
        const page = req.body.page;
        const rowCount = req.body.rowCount;

        data = await historyModel.listYearMonthMTS(storeCode, "", yearMonth, page, rowCount);

        res.status(200).json({
            result: true,
            data: data
        });
    },

    async cancelReserveMTS(req, res, next) {
        const storeCode = req.body.storeCode;
        const reserveCode = req.body.reserveCode;

        const data = await historyModel.cancelMTS(storeCode, reserveCode);
        console.log(data)
        // DB 삭제가 완료(data.cancelSendData == 'OK')되고, 큐마켓 푸시(data.pushCode)가 있다면 큐마켓 푸시를 취소하도록 API 호출
        if (data.cancelSendData == 'OK' && data.pushCode != "") {
            let response = await qmService.removeAppPush(data.pushCode);
            data.cancelPushData = response.code;
        }

        res.status(200).json({
            result: true,
            data: data
        });
    },

    async listDetailsMTS(req, res, next) {
        const storeCode = req.body.storeCode;
        const reserveCode = req.body.reserveCode;
        const yearMonth = req.body.yearMonth ? req.body.yearMonth : '';
        const sendType = req.body.sendType;
        const sendResult = req.body.sendResult;
        const page = req.body.page;
        const rowCount = req.body.rowCount;
        
        let data = await historyModel.listDetailsLogMTS(storeCode, reserveCode, sendType, sendResult, page, rowCount, yearMonth);

        res.status(200).json({
            result: true,
            data: data
        });
    },

    
    // MTS end

}