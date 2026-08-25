const moment = require("moment");
const logger = require("../../config/logger");
const nicepayService = require('../services/nicepayService.js');
const { urlencoded } = require("body-parser");

module.exports = {
    // 가상계좌입금완료 콜백
    async callback(req, res, next) {
        const resultParams = {
            Amt: req.body.Amt,                          //상품금액 (예시: 1000) : '13'
            AuthCode: req.body.AuthCode,                //승인번호 : ''
            AuthDate: req.body.AuthDate,                //입금일시 (예시: 170821195328): '240613114020'
            BuyerAuthNum: req.body.BuyerAuthNum,        //구매자 식별번호: ''
            BuyerEmail: req.body.BuyerEmail,            //구매자 e-mail (예시: it@nicepay.co.kr) : ''
            FnCd: req.body.FnCd,                        //은행코드 (예시: 004) : '020'
            FnName: req.body.FnName,                    //은행명 (예시: 국민은행) : '%BF%EC%B8%AE%C0%BA%C7%E0'
            GoodsName: req.body.GoodsName,              //상품명 (예시: 곰인형) : ''
            MallUserID: req.body.MallUserID,            //회원사고객ID : ''
            MID: req.body.MID,                          //상점ID (예시: nicepay00m) : 'moaplat10m'
            MOID: req.body.MOID,                        //주문번호 : 'NICEPAY_MT000005_240613113600_4533'
            name: req.body.name,                        //구매자명 (예시: 홍길동) : ''
            PayMethod: req.body.PayMethod,              //지불수단 (예시: VBANK) : 'VBANK'
            RcptAuthCode: req.body.RcptAuthCode,        //현금영수증 승인번호 (예시: 533061234) : ''
            RcptTID: req.body.RcptTID,                  //현금영수증 TID (예시: nicepay00m04011709110011161234) : ''
            RcptType: req.body.RcptType,                //현금영수증 구분 (예시: 1) : ''
            ReceitType: req.body.ReceitType,            //현금영수증 타입 (미발행: 0 / 소득공제: 1 / 지출증빙: 2) : ''
            ResultCode: req.body.ResultCode,            //결과 코드 (예시: 4110) : '4110'
            ResultMsg: req.body.ResultMsg,              //결과 메시지 (예시: 승인) : '%BD%C2%C0%CE'
            StateCd: req.body.StateCd,                  //거래 상태 (승인: 0, 전취소: 1, 후취소: 2) : '0'
            TID: req.body.TID,                          //거래ID (예시: nicepay00m03011708211953289333) : 'moaplat10m03012406131136004533'
            VbankInputName: req.body.VbankInputName,    //가상계좌 입금자명 (예시: 홍길동) : '%BC%BA%B3%AB%C3%B5'
            VbankName: req.body.VbankName,              //가상계좌 은행명 (예시: 국민은행) : '%BF%EC%B8%AE%C0%BA%C7%E0'
            VbankNum: req.body.VbankNum,                //가상계좌 번호 (예시: 12349012131234) : '29294050718073'
            CancelMOID: req.body.CancelMOID,            //취소요청 주문번호 (신용카드 취소 통보 시에만 응답값이 있습니다.) : ''
            MallReserved: req.body.MallReserved,        //가맹점 여분필드, 500byte 초과 문자열 삭제 주의 : ''
            MallReserved1: req.body.MallReserved1      //사업자번호 '2378101274'
        }

        // 인코딩하여 리턴한다
        nicepayService.decodeData(resultParams)

        logger.writeLog("info", `${moment().format("YYYY-MM-DD hh:mm:ss")} 나이스페이 결제 콜백: 콜백 결과 ${resultParams.ResultCode}`);
        logger.writeLog("info", `${resultParams.MOID.split("_")[1]} 가상계좌 ${resultParams.VbankName} ${resultParams.VbankNum}/${resultParams.Amt}원`);
        logger.writeLog("info", `결과 리턴 데이터 ${JSON.stringify(resultParams)}`);
        
        const result = await nicepayService.callbackProcess(resultParams);

        res.status(200).send('OK');
    },

    async callbackTest(req, res, next) {
        res.status(200).send('call OK');
    }
}