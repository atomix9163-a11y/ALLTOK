const logger = require('../../config/logger.js');
const axios = require('axios');

module.exports = class leafletService {
    static async get(leafletCode, xToken) {
        let returnData = await axios.post(`${apiServer}/leaflet/apiGet`, {
            leafletCode: leafletCode
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
    
}
