const logger = require('../../config/logger.js');
const axios = require('axios');

module.exports = class customersService {
    static async getGroupList(store_code, send_type = ['P'], xToken) {
        let returnData = await axios.post(`${apiServer}/customers/apiGroupList`, {
            store_code: store_code,
            send_type: send_type.concat()
        }, {
            headers: {
                xtoken: xToken
            }
        })
        .then(function (response) {
            if (response.data.result) {
                return response.data.data;
            }
            return null;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/customersService.getGroupList: ${error}`)
            return null;
        });
        return returnData;
    }

    static async getAllCustomerCount(store_code, xToken) {
        let returnData = await axios.post(`${apiServer}/customers/apiCustomerAllCount`, {
            store_code: store_code
        }, {
            headers: {
                xtoken: xToken
            }
        })
        .then(function (response) {
            if (response.data.result) {
                return response.data.data;
            }
            return null;
        })
        .catch(function (error) {
            logger.writeLog('error', `services/customersService.getAllCustomerCount: ${error}`)
            return null;
        });
        return returnData;
    }
}
