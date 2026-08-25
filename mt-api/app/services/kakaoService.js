const logger = require('../../config/logger.js');
const qs = require('qs');
const axios = require('axios');
const moment = require('moment');

module.exports = class kakaoService {  
    // 카카오 엔터프라이즈의 API 호출코드
    // 정해진 등록값으로부터 카카오 로그인 토큰을 얻는다. 이 코드는 API가 호출될 때 계속 사용된다.
    static async  getToken() {
        console.log("========================== kakaoService 토큰을 가져옵니다=======================")
        const logBase = `service/kakaoService.getToken`;
        // const uri = 'https://bizmsg-web.kakaoenterprise.com/mng/v1/oauth/token';
        const uri = 'https://web1.dktechinmsg.com/mng/v1/oauth/token';
        let returnData = axios({
            method: 'post',
            url: uri,
            data: qs.stringify({
                code: "200"
            }),
            headers: {
                'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
                Authorization: `Basic ${KAKAO_ID} ${KAKAO_PWD}`,
                grant_type: "client_credentials",
            }
        })
        .then(function (response) {
            console.log(response)
            if (response.data.code == "API_200") 
                return response.data;
            else 
                return null;
        })
        .catch(function (error) {
            logger.writeLog('error', `${logBase}: ${error}`)
            return null
        });
        return returnData;
    }

    static async getTemplateList(kakao_profilekey, startDate, endDate, page, rows, kepStatus) {
        const logBase = `service/kakaoService.getTemplateList: kakao_profilekey(${kakao_profilekey}), kepStatus(${kepStatus})`;

        let token = await kakaoService.getToken();
        if (!token) return [];

        // console.log(kakao_profilekey)
        // const uri = `https://bizmsg-web.kakaoenterprise.com/mng/v1/resell/template/select/${kakao_profilekey}`;
        const uri = `https://web1.dktechinmsg.com/mng/v1/resell/template/select/${kakao_profilekey}`;
        let returnData = axios({
            method: 'get',
            url: uri,
            params: {
                page: page,
                rows: rows,
                startDate: startDate,
                endDate: endDate,
                kepStatus: kepStatus
            },
            headers: {
                Authorization: `${token.token_type} ${token.access_token}`
            }
        })
        .then(function (response) {
            console.log("==========================", response.data)
            if (response.data.code == "API_200") {
                return response.data;
            }
            else 
                return [];
        })
        .catch(function (error) {
            logger.writeLog('error', `${logBase}: ${error}`)
            return []
        });
        return returnData;
    }

    static async getTemplate(kakaoProfilekey, templateCode) {
        const logBase = `service/kakaoService.getTemplate: kakaoProfilekey(${kakaoProfilekey}), templateCode(${templateCode})`;

        let token = await kakaoService.getToken();
        if (!token) return null;

        // const uri = `https://bizmsg-web.kakaoenterprise.com/mng/v1/resell/template/select/${kakaoProfilekey}/${templateCode}`;
        const uri = `https://web1.dktechinmsg.com/mng/v1/resell/template/select/${kakaoProfilekey}/${templateCode}`;
        let returnData = axios({
            method: 'get',
            url: uri,
            headers: {
                Authorization: `${token.token_type} ${token.access_token}`
            }
        })
        .then(function (response) {
            if (response.data.code == "API_200") {
                return response.data.data;
            }
            else 
                return null;
        })
        .catch(function (error) {
            logger.writeLog('error', `${logBase}: ${error}`)
            return null
        });
        return returnData;
    }

    static getMessage(templateCode, storeName, callPhone, rejectPhone, message, uri, messageType) {
        let messageJSON = {
            "chatbotId": callPhone,
            "agencyId": "ktbizrcs",
            // "agencyId": "shuket",
            "messagebaseId": templateCode, 
            "serviceType": messageType, 
            "expiryOption": 1, 
            "header": "1", 
            "footer": rejectPhone, 
            "copyAllowed": false, 
            "body": { 
                "description": message 
            },
            "buttons": []
        }    

        let button = [];
        if (uri != "") {
            let buttonText = "방문하기";
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
            messageJSON.buttons.push(button);
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
        messageJSON.body = body;
        return JSON.stringify(messageJSON);
    }
    // 카카오 엔터프라이즈의 API 호출코드 끝

}