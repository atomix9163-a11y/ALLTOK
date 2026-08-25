const logger = require('../../config/logger.js');

module.exports = class rcsService {
    // serviceType RCSSMS/RCSLMS/RCSMMS = messageType
    static buildMessage(agencykey, brandKey, storeName, callPhone, rejectPhone, message, useUri, uri, messageType) {
        let templateCode = (messageType == "RCSSMS") ? "SS000000" : (messageType == "RCSLMS") ? "SL000000" : (messageType == "RCSLMS") ? "SL000000" : "CMwMhM0300";
        
        // console.log(agencykey, brandKey)
        // templateCode = 'UBR.5150G1R7lN-GG000F';
        let RCSMessageJSON = {
            "chatbotId": callPhone,
            "agencyId": "shuket",
            "agencyKey": agencykey,
            "brandKey": brandKey, 
            "messagebaseId": templateCode, 
            "serviceType": messageType, 
            "expiryOption": 2, 
            "header": "1", 
            "footer": rejectPhone, 
            "copyAllowed": false, 
            "body": { 
                "description": message 
            },
            "buttons": []
        }    

        let button = [];
        if (useUri && uri != "") {
            let buttonText = "행사보기";
            button = {
                "suggestions": [{
                    "action": {
                        "urlAction": {
                            "openUrl": {
                                "url": uri
                            }
                        },
                        "displayText": buttonText,
                        "postback": {
                            "data": "set_by_chatbot_open_url"
                        }
                    }
                }]
            };
            RCSMessageJSON.buttons.push(button);
        }

        let body = null;
        if (messageType == "RCSLMS" || messageType == "RCSMMS") {
            body = {
                "title": storeName,
                "description": message
            }
        } else {
            body = {
                "description": message
            }
        }
        RCSMessageJSON.body = body;
        return RCSMessageJSON;
    }

}