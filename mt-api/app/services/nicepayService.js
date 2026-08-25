const crypto = require('crypto');
const moment = require('moment');
const axios = require('axios');
const logger = require('../../config/logger.js');
const virtualBankModel = require('../models/virtualBankModel.js');
const iconv  = require('iconv-lite');

module.exports = class nicepayService {
    // 마트 정보 가져오기
    static async sendVerify(storeCode, amount, account, accountName) {
        const logBase = `나이스페이.nicepayService.sendVerify: storeCode(${storeCode})`;

        // 가상계좌연결 정보를 가져온다
        const virtualBankInfo = await virtualBankModel.get(storeCode);
        // console.log(virtualBankInfo)
        
        const nowDateString = moment().format("YYMMDDHHmmss");
        const ediDate = moment().format("YYYYMMDDHHmmss");
        const reandom4Digit = Math.floor(Math.random() * 8999) + 1000;
        const TID = `${NICEPAY_MID}0301${nowDateString}${reandom4Digit}`;
        const nicePayVerifyCode = `NICEPAY_${storeCode}_${nowDateString}_${reandom4Digit}`;
        const signDataPlainText = `${NICEPAY_MID}${amount}${ediDate}${nicePayVerifyCode}${NICEPAY_MERCHANTKEY}`;        
        const signData = crypto.createHash('sha256').update(signDataPlainText).digest('hex');;

        const sendData = {
            TID: TID,
            MID: NICEPAY_MID,
            EdiDate: ediDate,
            Moid: nicePayVerifyCode,
            Amt: amount.toString(),
            SignData: signData,
            VbankBankCode: '020',
            VbankNum: virtualBankInfo.bank_account,
            VbankAccountName: virtualBankInfo.name,
            VbankExpDate: moment().add(1, 'days').format("YYYYMMDD"),
            VbankExpTime: '175959',
            ReceiptType: '0'   // 현금영수증 용도 구분 0: 미발행 , 1: 소득공제 , 2: 지출증빙
        }
        
        // 가상계좌결제프로세스 시작 - 콜백 형태이므로 디비에 기록해서 시작하고, 프로세스 단위로 히스토리 기록
        await virtualBankModel.addHistory(storeCode, TID, "가상계좌프로세스 등록", "", "", {});
        const callVerify = await virtualBankModel.createProcess(storeCode, TID, nicePayVerifyCode, sendData);
        if (callVerify == -1) {
            await virtualBankModel.addHistory(storeCode, TID, "가상계좌 프로세스 등록 실패", "", "", {});
            return null;
        }
        await virtualBankModel.addHistory(storeCode, TID, "과오납체크 API 호출", "", "", sendData );
        // 과오납 API 호출 -> nicepay
        logger.writeLog("info", `${logBase} 가상계좌 과오납체크 API 호출:\n ${JSON.stringify(sendData)}`);

        const API_uri = `https://webapi.nicepay.co.kr/webapi/bulk_vacct_regist.jsp`;
        
        const params = new URLSearchParams();
        params.append('TID', TID);
        params.append('MID', NICEPAY_MID);
        params.append('EdiDate', ediDate);
        params.append('Moid', nicePayVerifyCode);
        params.append('Amt', amount.toString());
        params.append('SignData', signData);
        params.append('VbankBankCode', '020');
        params.append('VbankNum', virtualBankInfo.bank_account);        
        params.append('VbankAccountName', 'SHUKET');        
        params.append('VbankExpDate', moment().add(1, 'days').format("YYYYMMDD"));
        params.append('VbankExpTime', '175959'); 
        params.append('ReceiptType', '0');

        let responseData = await axios.post(API_uri,
            params, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=EUC-KR",
                },
                responseType: "arraybuffer"
            },            
        ).then(async response => {
            logger.writeLog("info", `${logBase} 과오납체크 API 호출 완료.`);
            virtualBankModel.addHistory(storeCode, TID, "과오납체크 API 호출 완료", '', '', {});

            const responseData = iconv.decode(response.data, "EUC-KR").toString();
            const responseDataJSON = JSON.parse(responseData);
            logger.writeLog("info", `${logBase} 과오납체크 API 호출 결과 ${responseData}`);            

            await virtualBankModel.addHistory(storeCode, TID, "과오납체크 API 호출 결과 기록", responseDataJSON.ResultCode, responseDataJSON.ResultMsg, responseDataJSON);
            await virtualBankModel.updateProcessVerify(storeCode, TID, responseData);
            return responseData;
        }).catch(error => {
            virtualBankModel.addHistory(storeCode, TID, "과오납체크 API 호출 실패", "", "", {});
            logger.writeLog("error", `${logBase} 과오납체크 API 호출 실패.\nStacktrace: ${error.stack}`);            
            return null;
        });

        return responseData;
    }


}