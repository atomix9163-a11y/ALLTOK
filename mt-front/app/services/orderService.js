const logger = require('../../config/logger.js');
const axios = require('axios');

module.exports = class orderService {
    static async get(O_CODE) {
        let returnData = await axios.post(`${apiServer}/order/apiGet`, {
            O_CODE: O_CODE
        })
        .then(function (response) {            
            if (response.data.result) {
                return response.data.data;
            }
            return null;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/orderService.get: ${error}`)
            return null;
        });
        return returnData;
    }

    static async getDetails(O_CODE) {
        let returnData = await axios.post(`${apiServer}/order/apiDetail`, {
            O_CODE: O_CODE
        })
        .then(function (response) {
            if (response.data.result) {
                return response.data.data;
            }
            return null;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/orderService.getDetails: ${error}`)
            return null;
        });
        return returnData;
    }

    static async getHistory(O_CODE) {
        let returnData = await axios.post(`${apiServer}/order/apiHistory`, {
            O_CODE: O_CODE
        })
        .then(function (response) {
            if (response.data.result) {
                return response.data.data;
            }
            return null;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/orderService.getHistory: ${error}`)
            return null;
        });
        return returnData;
    }
}
