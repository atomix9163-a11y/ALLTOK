const logger = require('../../config/logger.js');
const systemModel = require('../models/systemModel.js');

module.exports = class systemService {
    static async saveUseService(req, res, next) {
        let agencyKey = req.body.agencyKey;
        let P_SMS = req.body.P_SMS;
        let P_AT = req.body.P_AT;
        let SMS = req.body.SMS;
        let LMS = req.body.LMS;
        let MMS = req.body.MMS;
        let RCSSMS = req.body.RCSSMS;
        let RCSLMS = req.body.RCSLMS;
        let RCSMMS = req.body.RCSMMS;
        let AT = req.body.AT;
        let FT = req.body.FT;
        let C_ID = req.body.C_ID;

        let serviceJSON = {
            agencyKey: agencyKey,
            P_SMS: P_SMS,
            P_AT: P_AT,
            SMS: SMS,
            LMS: LMS,
            MMS: MMS,
            RCSSMS: RCSSMS,
            RCSLMS: RCSLMS,
            RCSMMS: RCSMMS,
            AT: AT,
            FT: FT
        }

        let data = await systemModel.save("SERVICE", JSON.stringify(serviceJSON), C_ID);

        res.status(200).json({
            result: true,
            data: data
        });
    }
}