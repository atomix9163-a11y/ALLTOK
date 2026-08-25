const logger = require('../../config/logger.js');
const axios = require('axios');
const FormData = require('form-data');

module.exports = class martroService {
    // 마트로에 폰문자 고객 추가
    static async addMember(affiliatedStoreInfo, groupInfo, phone) {
        let logBase = `services/martroService.addMember: store_code(${affiliatedStoreInfo.store_code}), groupInfo(${groupInfo}), phone(${phone})`;
        const formData = new FormData()
        formData.append('user_id', affiliatedStoreInfo.service.MARTRO_CODE)
        formData.append('api_key', affiliatedStoreInfo.service.MARTRO_API_key)
        formData.append('mode', "insert")
        formData.append('mobile', phone)

        const APIAddress = (groupInfo.send_type == "K") ? `${apiMartoServer}kko/kko_address.php` : `${apiMartoServer}phone/phone_address.php`;
        let returnData = await axios.post(APIAddress, formData, {
            headers: formData.getHeaders() 
        })
        .then(function (response) {
            logger.writeLog('info', `${logBase}`)
            return response.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `${logBase}: ${error}`)
            return {
                RESULT_CODE: "999",
                RESULT_MSG: error.message
            }
        });
        return returnData;
    }
    // 마트로에 폰문자 고객 삭제
    static async removeMember(affiliatedStoreInfo, groupInfo, phone) {
        let logBase = `services/martroService.removeMember: store_code(${affiliatedStoreInfo.store_code}), groupInfo(${groupInfo}), phone(${phone})`;
        const formData = new FormData()
        formData.append('user_id', affiliatedStoreInfo.marto_code)
        formData.append('api_key', affiliatedStoreInfo.marto_API_key)
        formData.append('mode', "delete")
        formData.append('mobile', phone)

        const APIAddress = (groupInfo.send_type == "K") ? `${apiMartoServer}kko/kko_address.php` : `${apiMartoServer}phone/phone_address.php`;
        let returnData = await axios.post(APIAddress, formData, {
            headers: formData.getHeaders() 
        })
        .then(function (response) {
            logger.writeLog('info', `${logBase}`)
            return response.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `${logBase}: ${error}`)
            return {
                RESULT_CODE: "999",
                RESULT_MSG: error.message
            }
        });
        return returnData;
    }

        // 마트로에 폰문자 발송
    static async sendPhone(affiliatedStoreInfo, membersText, content, sendReserveTime) {
        let logBase = `services/martroService.sendPhone: store_code(${affiliatedStoreInfo.store_code}), membersText(${membersText}), content(${content}), sendReserveTime(${sendReserveTime})`;
        const formData = new FormData()
        formData.append('user_id', affiliatedStoreInfo.marto_code)
        formData.append('api_key', affiliatedStoreInfo.marto_API_key)
        formData.append('mode', "insert")
        formData.append('mobile', membersText)
        formData.append('message', content)
        formData.append('res_datetime', (sendReserveTime) ? sendReserveTime : "")
        formData.append('send_no', 0)

        const APIAddress = `${apiMartoServer}phone/phone_send.php`;
        let returnData = await axios.post(APIAddress, formData, {
            headers: formData.getHeaders() 
        })
        .then(function (response) {
            logger.writeLog('info', `${logBase}`)
            return response.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `${logBase}: ${error}`)
            return {
                RESULT_CODE: "999",
                RESULT_MSG: error.message
            }
        });
        return returnData;
    }

    static async sendKakao(affiliatedStoreInfo, membersText, content, sendReserveTime) {
        let logBase = `services/martroService.sendKakao: store_code(${affiliatedStoreInfo.store_code}), membersText(${membersText}), content(${content}), sendReserveTime(${sendReserveTime})`;
        const formData = new FormData()
        formData.append('user_id', affiliatedStoreInfo.marto_code)
        formData.append('api_key', affiliatedStoreInfo.marto_API_key)
        formData.append('mode', "insert")
        formData.append('mobile', membersText)
        formData.append('message', content)
        formData.append('res_datetime', (sendReserveTime) ? sendReserveTime : "")
        formData.append('send_no', 0)

        const APIAddress = `${apiMartoServer}kko/kko_send.php`;
        let returnData = await axios.post(APIAddress, formData, {
            headers: formData.getHeaders() 
        })
        .then(function (response) {
            logger.writeLog('info', `${logBase}`)
            return response.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `${logBase}: ${error}`)
            return {
                RESULT_CODE: "999",
                RESULT_MSG: error.message
            }
        });
        return returnData;
    }

    // 마트로에 결과 요청
    static async getResult(affiliatedStoreInfo, send_method, send_no) {
        let logBase = `services/martroService.getResult: store_code(${affiliatedStoreInfo.store_code}), send_method(${send_method}), send_no(${send_no})`;
        const formData = new FormData()
        formData.append('user_id', affiliatedStoreInfo.marto_code)
        formData.append('api_key', affiliatedStoreInfo.marto_API_key)
        formData.append('send_no', send_no)

        const APIAddress = (send_method == "K") ? `${apiMartoServer}kko/kko_result.php` : `${apiMartoServer}phone/phone_result.php`;
        let returnData = await axios.post(APIAddress, formData, {
            headers: formData.getHeaders() 
        })
        .then(function (response) {
            logger.writeLog('info', `${logBase}`)
            return response.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `${logBase}: ${error}`)
            return {
                RESULT_CODE: "999",
                RESULT_MSG: error.message
            }
        });
        return returnData;
    }

    // 마트로에 결과 요청
    static async cancelReserve(affiliatedStoreInfo, send_method, send_no) {
        let logBase = `services/martroService.getResult: store_code(${affiliatedStoreInfo.store_code}), send_method(${send_method}), send_no(${send_no})`;
        const formData = new FormData()
        formData.append('user_id', affiliatedStoreInfo.marto_code)
        formData.append('api_key', affiliatedStoreInfo.marto_API_key)
        formData.append('mode', "delete")
        formData.append('mobile', "")
        formData.append('message', "")
        formData.append('res_datetime', "")
        formData.append('send_no', send_no)

        const APIAddress = (send_method == "K") ? `${apiMartoServer}kko/kko_send.php` : `${apiMartoServer}phone/phone_send.php`;
        let returnData = await axios.post(APIAddress, formData, {
            headers: formData.getHeaders() 
        })
        .then(function (response) {
            logger.writeLog('info', `${logBase}`)
            return response.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `${logBase}: ${error}`)
            return {
                RESULT_CODE: "999",
                RESULT_MSG: error.message
            }
        });
        return returnData;
    }
}