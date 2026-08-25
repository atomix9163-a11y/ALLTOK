const logger = require('../../config/logger.js');
const qs = require('qs');
const axios = require('axios');
const moment = require('moment');

module.exports = class MTSService {  
    // MTS의 카카오 API 호출코드
    // 정해진 등록값으로부터 카카오 로그인 토큰을 얻는다. 이 코드는 API가 호출될 때 계속 사용된다.
    static async getToken(bizName, receivePhone) {
        const logBase = `service/MTSService.getToken @${bizName} ${receivePhone}`;
        const formData = {
            authCode: MTS_AUTH,
            yellowId: '@' + bizName,
            phoneNumber: receivePhone
        };
        const uri = 'https://talks.mtsco.co.kr/mts/api/sender/token';
        let returnData = axios.post(uri, formData, 
        {
            headers: {
                'Content-Type': 'application/multipart/form-data;charset=utf-8'
            }
        })
        .then(function (response) {
            if (response.data.code == "200") {
                logger.writeLog('info', `${logBase} 인증번호 발송 호출 성공  ${JSON.stringify(response.data)}`)
            } else {
                logger.writeLog('error', `${logBase} 인증번호 발송 호출 성공, 발송 실패  ${JSON.stringify(response.data)}`)
            }
            return response.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `${logBase} 인증번호 발송 호출 실패`)
            logger.writeLog('error', `${logBase}: ${error}`)
            return {
                "code": "500",
                "message": "axios 시스템 오류입니다."
            }
        });
        return returnData;
    }

    // 발신 프로필 카테고리 전체
    static async getProfileCategoryAll() {
        const logBase = `service/MTSService.getProfileCategoryAll `;
        const formData = {
            authCode: MTS_AUTH
        };
        const uri = 'https://talks.mtsco.co.kr/mts/api/category/all';
        let returnData = axios.post(uri, formData, 
        {
            headers: {
                'Content-Type': 'application/multipart/form-data;charset=utf-8'
            }
        })
        .then(function (response) {
            console.log(response)
            if (response.data.code == "200") {
                logger.writeLog('info', `${logBase} 전체 프로필 카테고리 얻기 호출 성공`)
            } else {
                logger.writeLog('error', `${logBase} 전체 프로필 카테고리 얻기 호출 성공, 데이터 실패`)
            }
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `${logBase} 전체 프로필 카테고리 얻기 실패`)
            logger.writeLog('error', `${logBase}: ${error}`)
            return {
                "code": "500",
                "message": "axios 시스템 오류입니다."
            }
        });
        return returnData;
    }

    // 발신 프로필 코드로 특정 카테고리 얻기
    static async getProfileCategory(categoryCode) {
        const logBase = `service/MTSService.getProfileCategory ${categoryCode}`;
        const formData = {
            authCode: MTS_AUTH,
            categoryCode: categoryCode
        };
        const uri = 'https://talks.mtsco.co.kr/mts/api/category';
        let returnData = axios.post(uri, formData, 
        {
            headers: {
                'Content-Type': 'application/multipart/form-data;charset=utf-8'
            }
        })
        .then(function (response) {
            if (response.data.code == "200") {
                logger.writeLog('info', `${logBase} 지정 프로필 카테고리 얻기 호출 성공  ${JSON.stringify(response.data.data)}`)                
            } else {
                logger.writeLog('error', `${logBase} 지정 프로필 카테고리 얻기 호출 성공, 데이터 실패`)                
            }
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `${logBase} 지정 프로필 카테고리 얻기 실패`)
            logger.writeLog('error', `${logBase}: ${error}`)
            return {
                "code": "500",
                "message": "axios 시스템 오류입니다."
            }
        });
        return returnData;
    }
    
    // 발신 프로필 등록
    static async createProfile(token, phoneNumber, yellowId, categoryCode) {
        const logBase = `service/MTSService.createProfile ${token}, ${phoneNumber}, @${yellowId} ${categoryCode}`;
        const formData = {
            authCode: MTS_AUTH,
            token: token,
            phoneNumber: phoneNumber,
            yellowId: '@' + yellowId,
            categoryCode: categoryCode
        };
        const uri = 'https://talks.mtsco.co.kr/mts/api/create/new/senderKey';        
        let returnData = axios.post(uri, formData, 
            {
                headers: {
                    'Content-Type': 'application/multipart/form-data;charset=utf-8'                
                }
            })
        .then(function (response) {
            if (response.data.code == "200") {
                logger.writeLog('info', `${logBase} 프로필 등록 호출 성공 ${JSON.stringify(response.data)} ${JSON.stringify(formData)}`)
            } else {
                logger.writeLog('error', `${logBase} 프로필 등록 호출 성공, 등록 실패 ${JSON.stringify(response.data)}`)
            }
            return response.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `${logBase} 프로필 등록 호출 실패 ${JSON.stringify(formData)}`)
            logger.writeLog('error', `${logBase}: ${error}`)
            return {
                "code": "500",
                "message": "axios 시스템 오류입니다."
            }
        });
        return returnData;
    }

    // 발신 프로필 조회
    static async getProfile(senderKey) {
        const logBase = `service/MTSService.getProfile ${senderKey}`;
        const formData = {
            authCode: MTS_AUTH,
            senderKey: senderKey
        };
        const uri = 'https://talks.mtsco.co.kr/mts/api/select/senderKey';
        let returnData = axios.post(uri, formData, 
        {
            headers: {
                'Content-Type': 'application/multipart/form-data;charset=utf-8'
            }
        })
        .then(function (response) {
            if (response.data.code == "200") {
                logger.writeLog('info', `${logBase} 프로필 조회 호출 성공 ${JSON.stringify(response.data)}`)
            } else {
                logger.writeLog('error', `${logBase} 프로필 조회 호출 성공, 조회 실패 ${JSON.stringify(response.data)}`)
            }
            return response.data;    
        })
        .catch(function (error) {
            logger.writeLog('error', `${logBase} 프로필 조회 호출 실패`)
            logger.writeLog('error', `${logBase}: ${error}`)
            return {
                "code": "500",
                "message": "axios 시스템 오류입니다."
            }
        });
        return returnData;
    }
    
    // 발신 프로필 삭제
    static async removeProfile(senderKey) {
        const logBase = `service/MTSService.removeProfile ${senderKey}`;
        const formData = {
            authCode: MTS_AUTH,
            senderKey: senderKey
        };
        const uri = 'https://talks.mtsco.co.kr/mts/api/delete/senderKey';
        let returnData = axios.post(uri, formData, 
        {
            headers: {
                'Content-Type': 'application/multipart/form-data;charset=utf-8'
            }
        })
        .then(function (response) {
            if (response.data.code == "200") {
                logger.writeLog('info', `${logBase} 프로필 삭제 호출 성공 ${JSON.stringify(response.data)}`)
            } else {
                logger.writeLog('error', `${logBase} 프로필 삭제 호출 성공, 삭제 실패 ${JSON.stringify(response.data)}`)
            }
            return response.data;    
        })
        .catch(function (error) {
            logger.writeLog('error', `${logBase} 프로필 삭제 호출 실패`)
            logger.writeLog('error', `${logBase}: ${error}`)
            return {
                "code": "500",
                "message": "axios 시스템 오류입니다."
            }
        });
        return returnData;
    }

    // 템플릿 조회 (등록 삭제 등은 mts 사이트에서 운영하도록 합니다)
    static async getTemplate(senderKey, templateCode, senderKeyType = 'S') {
        const logBase = `service/MTSService.getTemplete ${senderKey}, ${templateCode}, ${senderKeyType}`;
        const formData = {
            senderKey: senderKey,
            templateCode: templateCode,
            senderKeyType: senderKeyType
        };
        const uri = 'https://talks.mtsco.co.kr/mts/api/state/template';
        let returnData = axios.post(uri, formData, 
        {
            headers: {
                'Content-Type': 'application/multipart/form-data;charset=utf-8'
            }
        })
        .then(function (response) {
            if (response.data.code == "200") {
                logger.writeLog('info', `${logBase} 템플릿 조회 호출 성공 ${JSON.stringify(response.data.data)}`)
            } else {
                logger.writeLog('error', `${logBase} 템플릿 조회 호출 성공, 데이터 실패 ${JSON.stringify(response.data)}`)
            }
            return response.data.data;
        })
        .catch(function (error) {
            logger.writeLog('error', `${logBase} 템플릿 조회 실패`)
            logger.writeLog('error', `${logBase}: ${error}`)
            return {
                "code": "500",
                "message": "axios 시스템 오류입니다."
            }
        });
        return returnData;
    }
    // MTS의 카카오 API 호출코드 끝
}