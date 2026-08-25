const logger = require('../../config/logger.js');
const storeModel = require('../models/store.js');
const historyModel = require('../models/history.js');
const martroService = require('./martro.js');

module.exports = class historyService {
    static async updateRecent(store_code, historyList) {

        let storeInfo = await storeModel.get(store_code);

        // 대상 목록에 대해 반복
        for (let history of historyList) {
            const result = await martroService.getResult(storeInfo, history.send_method, history.send_no);
            // 대기였는데 0000이 리턴이라면 처리가 완료되었을 수 있다는 의미
            // console.log(result.RESULT_CODE, result.SEND_COUNT, result.SUCCESS_COUNT, result.FAIL_COUNT)
            let sendCount = (result.SEND_COUNT) ? parseInt(result.SEND_COUNT) : 0;
            let successCount = (result.SUCCESS_COUNT) ? parseInt(result.SUCCESS_COUNT) : 0;
            let waitCount = (result.WAIT_COUNT) ? parseInt(result.WAIT_COUNT) : 0;  // 카카오만 씀
            let failCount = (result.FAIL_COUNT) ? parseInt(result.FAIL_COUNT) : 0;
            let filterCount = (result.FILTER_COUNT) ? parseInt(result.FILTER_COUNT) : 0;  // 카카오만 씀
            // console.log(sendCount, successCount, waitCount, failCount, filterCount)
            let send_time = new Date();
            if (result.RESULT_CODE == "0000") {
                if (history.send_method == "K") {
                    // 카카오 업데이트, result.SEND_RESULT.SEND_STATUS 발송대기 발송성공 발송실패 
                    // console.log(result.SEND_RESULT.SEND_STATUS);
                    switch (result.SEND_RESULT.SEND_STATUS) {
                        case "발송성공":
                            historyModel.updateMartroHistory(history.send_code, 'A', send_time, successCount, failCount);
                            historyModel.updateMartroHistoryDetail(history.send_code, 'A');
                            break;
                        case "발송실패":
                            historyModel.updateMartroHistory(history.send_code, 'F', send_time, successCount, failCount);
                            historyModel.updateMartroHistoryDetail(history.send_code, 'F');
                            break;
                    }
                } else {
                    // 일반 업데이트
                    // SEND_COUNT = SUCCESS_COUNT + FAIL_COUNT 이면 완료
                    if (sendCount == successCount + failCount) {
                        historyModel.updateMartroHistory(history.send_code, 'A', send_time, successCount, failCount)
                    }
                }
            }
            // console.log(result)
        }

    }


 
}