const logger = require('../../config/logger.js');
const axios = require('axios');

module.exports = class storeService {
    static async getInfo(storeCode, xtoken) {
        let returnData = await axios.post(`${apiServer}/store/apiGet`, {
            storeCode: storeCode
        }, {
            headers: {
                xtoken: xtoken
            }
        })
        .then(function (response) {            
            if (response.data.result) {
                return response.data.data;
            }
            return null;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/store.info: ${error}`)
            return null;
        });
        return returnData;
    }

    static async getService(xToken, storeCode) {
        let returnData = await axios.post(`${apiServer}/store/apiGetService`, {
            storeCode: storeCode            
        },
        {
            headers: {
                xToken: xToken
            }            
        })
        .then(function (response) {
            if (response.data.result) {
                return response.data.data;
            }
            return null;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/apiService.storeServiceGet: ${error}`)
            return null;
        });
        return returnData;
    }  

    static async getVirtualAccount(storeCode, xtoken) {
        let returnData = await axios.post(`${apiServer}/store/apiGetVirtualAccount`, {
            storeCode: storeCode
        }, {
            headers: {
                xtoken: xtoken
            }
        })
        .then(function (response) {            
            if (response.data.result) {
                return response.data.data;
            }
            return null;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/store.getVirtualAccount: ${error}`)
            return null;
        });
        return returnData;
    }
}
