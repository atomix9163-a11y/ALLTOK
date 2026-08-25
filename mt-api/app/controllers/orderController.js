const orderService = require('../services/orderService.js');
const orderModel = require('../models/orderModel.js');
const storeModel = require('../models/storeModel.js');
const historyModel = require('../models/historyModel.js');
// const twagentModel = require('../models/twagent.js');
const logger = require("../../config/logger.js");
const moment = require('moment');
const messageService = require('../services/messageService.js');
const storeService = require('../services/storeService.js');

// const productsService = require('../services/products.js');

module.exports = {
    async list(req, res, next) {
        let storeCode = req.body.storeCode;
        let searchType = req.body.searchType;
        let searchValue = req.body.searchValue;
        let startDate = req.body.startDate;
        let endDate = req.body.endDate;
        let status = req.body.o_status;
        let payMethod = req.body.o_payMethod;
        let platform = req.body.o_platform;
        let page = req.body.page;
        let rowCount = req.body.rowCount;

        console.log(storeCode, searchType, searchValue, status, startDate, endDate, page, rowCount)

        let data = await orderModel.list(storeCode, searchType, searchValue, status, payMethod, platform, startDate, endDate, page, rowCount);

        // console.log(data)
        res.status(200).json({
            result: true,
            data: data
        });
    },

    async findByPhone(req, res, next) {
        let storeCode = req.body.storeCode;
        let phone = req.body.phone;

        let data = await orderModel.list(storeCode, 'o_phone', phone, '', '', '', '1999-01-01', moment().format("YYYY-MM-DD"), 1, 5);
        
        res.status(200).json({
            result: true,
            data: data
        });
    },    

    async get(req, res, next) {
        let O_CODE = req.body.O_CODE;

        let data = await orderModel.get(O_CODE);
        if (data) {
            data.O_PAY_METHOD_NAME = orderService.getPaymentMethd(data.O_PAY_METHOD);
            data.O_STATUS_NAME = orderService.getOrderSatatus(data.O_STATUS);
        }
        // console.log(data)
        // console.log(data)
        res.status(200).json({
            result: true,
            data: data
        });
    },

    async detail(req, res, next) {
        let O_CODE = req.body.O_CODE;

        let data = await orderModel.getDetails(O_CODE);
        
        res.status(200).json({
            result: true,
            data: data
        });
    },

    async history(req, res, next) {
        let O_CODE = req.body.O_CODE;

        let data = await orderModel.getHistory(O_CODE);
        if (data) {
            for (let history of data) {
                history.O_STATUS_NAME = orderService.getOrderSatatus(history.O_STATUS);
            }
        }

        res.status(200).json({
            result: true,
            data: data
        });
    },

    async setPrint(req, res, next) {
        let O_CODE = req.body.O_CODE;
        let IS_PRINT = req.body.IS_PRINT;

        // 주문 정보 가져오기
        const orderInfo = await orderModel.get(O_CODE);
        let data = true;
        if (orderInfo.O_STATUS == 70) {
            data = await orderModel.setPrint(O_CODE, IS_PRINT);
            await orderModel.setStatus(O_CODE, 82);
        }
        res.status(200).json({
            result: true,
            data: data
        });
    },

    async setStatus(req, res, next) {
        let O_CODE = req.body.O_CODE;
        let O_STATUS = req.body.O_STATUS;

        let data = await orderModel.setStatus(O_CODE, O_STATUS);
        res.status(200).json({
            result: true,
            data: data
        });
    },

    async getOCodeBase(req, res, next) {
        let storeCode = req.body.storeCode;

        let data = await orderModel.get_O_CODE_BaseValue(storeCode);
        res.status(200).json({
            result: true,
            data: data
        });
    },

    async getPAYCODEBase(req, res, next) {
        let store_code = req.body.store_code;

        let data = await orderModel.get_O_PAY_CODE_BaseValue(store_code);
        res.status(200).json({
            result: true,
            data: data
        });
    },

    // 모바일 페이지에서 주문을 생성
    async create(req, res, next) {
        let O_CODE = req.body.O_CODE;
        let O_PAY_CODE = req.body.O_PAY_CODE;
        let storeInfo = JSON.parse(req.body.storeInfo);
        let orderInfo = JSON.parse(req.body.orderInfo);
        let productList = JSON.parse(req.body.productList);

        // 주문이 정상 생성되었으면 주문번호가 리턴, 아니면 null 리턴
        let data = await orderModel.create(O_CODE, O_PAY_CODE, storeInfo, orderInfo, productList);
        logger.writeLog("info", `${O_CODE} 주문이 생성되었습니다.`);
        if (data) {
            // 문자 발송 대상을 얻는다
            let smslist = await storeModel.listSMSAdmin(storeInfo.store_code);
            let sendFlag = true;
            if (smslist.length > 0) {
                // 발송 제한 시간 사용 여부를 체크
                storeInfo.use_hide_sms = JSON.parse(storeInfo.use_hide_sms);
                // console.log(storeInfo.use_hide_sms)
                if (storeInfo.use_hide_sms.use == 'Y') {
                    // 현재 시간이 발송 제한 시간인지 확인한다
                    const hideStart = moment(moment().format("YYYY-MM-DD") + " " + storeInfo.use_hide_sms.start + ":00")
                    const hideEnd = moment(moment().add(1, "d").format("YYYY-MM-DD") + " " + storeInfo.use_hide_sms.end + ":00")

                    if (moment().isBetween(hideStart, hideEnd)) {
                        sendFlag = false;
                    }
                }
                // sendFlag가 true이면 문자 발송
                if (sendFlag) {
                    // 대상을 만든다.
                    let logPhoneList = "";
                    let members = new Set();
                    for (let member of smslist) {
                        members.add(member.SA_PHONE)
                        logPhoneList += member.SA_PHONE + ",";
                    }
                    let requestTime = moment().format('YYYY-MM-DD HH:mm');
                    let message = `새 주문 [${O_CODE}]이 등록되었습니다. 올톡 관리 사이트에서 확인하세요.`;
                   
                    // 알림톡 주문 등록 여부에 따라 설정
                    const targetPhone = Array.from(members).join(",");

                    const msgData = {
                        pushSendType: 'I',
                        sendType: 'I',
                        reserveTime: requestTime,
                        mpCode: "MP004",
                        pushData: null,
                        useWebLink: 'N',
                        webLink: '',
                        usePush: false,
                        kakaoProfilekey: process.env.KAKAO_ORDER_PROFILEKEY,    // 고정 키
                        kakaoTemplate: process.env.KAKAO_ORDER_TEMPLATE,
                        kakaoText: `새 주문 [${O_CODE}]이 등록되었습니다.

올톡 관리 사이트에서 확인하세요.`,
                        RCSText: "",
                        SMSText: message
                    }
                    

                    // let result = await messageService.sendMessage(process.env.KAKAO_ORDER_STORE, "AT", msgData, [], "", "", "alltok", targetPhone);
                    try {
                        let result = await messageService.sendMessageExt(process.env.KAKAO_ORDER_STORE, "AT", msgData, targetPhone, "alltok");
                        logger.writeLog("info", `주문알림발송: ${storeInfo.store_code} 가맹점의 ${O_CODE} 주문에 대해 ${targetPhone}에게 주문 알림 문자가 발송되었습니다.`);                    
                    } catch {
                        logger.writeLog("info", `주문알림발송: ${storeInfo.store_code} 가맹점의 ${O_CODE} 주문에 대해 ${targetPhone}에게 주문 알림 문자가 발송되지 않았습니다. 관리자에게 문의하세요.`);                    
                    }
                }
            } else {
                logger.writeLog("info", `주문알림발송: ${storeInfo.store_code} 가맹점의 ${O_CODE} 주문 알림 대상이 존재하지 않습니다.`);
            }
        }

        res.status(200).json({
            result: true,
            data: data         
        });
    },

}