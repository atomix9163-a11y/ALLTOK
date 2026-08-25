const logger = require('../../config/logger.js');
const scheduleModel = require('../models/schedule.js');

module.exports = class productsService {
    static getTypeName(type, sub1, sub2) {
        switch (parseInt(type)) {
            case 1:
                return "SMS"
            case 2:
                return "LMS"
            case 3:
                return sub1.serviceType;
            case 5:
                return sub2;
            default:
                return ""
        }
    }

    static safeJsonParse(str) {
        try {
            return [null, JSON.parse(str)];
        } catch (err) {
            return [err];
        }
    }
}