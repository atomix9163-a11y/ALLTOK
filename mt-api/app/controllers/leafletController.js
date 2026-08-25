const { v4: uuidv4 } = require("uuid");
const logger = require("../../config/logger");
const axios = require("axios");
// const leafletService = require('../services/leaflet.js');
const leafletModel = require('../models/leafletModel.js');
const storeModel = require('../models/storeModel.js');
const templateModel = require('../models/templateModel.js');
// const ioService = require('../services/io.js');

module.exports = {
    // // shuket API를 이용하여 템플릿 카테고리 정보를 얻는다
    // // categoryCode가 없으면 1차, 있으면 2차 카테고리가 된다
    // async getCategory(req, res, next) {
    //     let categoryCode = (req.body.categoryCode) ? req.body.categoryCode : "";

    //     // 카테고리 얻기 (shuket API call)

    //     const categories = await leafletService.getCategoryFromShuket(categoryCode);

    //     res.status(200).json({
    //         result: true,
    //         data: categories            
    //     });
    // },

    // // shuket API를 이용하여 템플릿의 선택 옵션 정보를 얻는다. 화면 검색 등을 구성할 때 사용한다
    // async getCountOption(req, res, next) {
    //     const logBase = `complexM(API).controller.leaflet.getCountOption`;
    //     // 카테고리 얻기 (shuket API call)
    //     const API_uri = `${SHUKET_API}/moa_back_api/api/v1/getFilterOptions`;
    //     logger.writeLog("info", `${logBase} 옵션 목록 가져오기`);

    //     let categories = await axios.post(API_uri, {
            
    //     }, { 
    //         headers: {
    //             "Authorization": "Bearer " + SHUKET_TOKEN
    //         }
    //     }).then(response => {
    //         logger.writeLog("info", `${logBase} 옵션 목록 가져오기 완료`);
    //         // console.log(response)
    //         return response.data.data;
    //     }).catch(error => {
    //         // console.log(error.response.data)
    //         if (error.response.data.code) {
    //             logger.writeLog("error", `${logBase} 옵션 목록 가져오기 오류 - (${error.response.data.code}) ${error.response.data.message}`);
    //         } else if (error.response.data.resultCode) {
    //             logger.writeLog("error", `${logBase} 옵션 목록 가져오기 오류 - (${error.response.data.resultCode}) ${error.response.data.resultMessage}`);
    //         } else {
    //             logger.writeLog("error", `${logBase} 옵션 목록 가져오기 오류 - (${error})`);
    //         }
    //     });

    //     res.status(200).json({
    //         result: true,
    //         data: categories            
    //     });
    // },
    
    // 등록된 전단지 목록을 얻는다
    async list(req, res, next) {
        const page = req.body.page;
        const rowCount = req.body.rowCount;
        const searchJSON = JSON.parse(req.body.searchJSON);
        
        const data = await leafletModel.list(req.user.storeCode, page, rowCount, searchJSON);

        res.status(200).json({
            result: true,
            data: data            
        });
    },

    
    // shuket API를 이용하여 선택 정보에 의해 템플릿 목록을 얻는다
    // 검색 조건은 클라이언트에서 만들어서 JSON.stringfy로 전달되므로, JSON.parse를 통해 JSON을 만든 후 API에 전달한다
    async searchTemplate(req, res, next) {
        const logBase = `complexM(API).controller.leaflet.searchTemplate`;
        const searchJSON = JSON.parse(req.body.searchJSON);

        // 카테고리 얻기 (shuket API call)
        const API_uri = `${SHUKET_API}/moa_back_api/api/v1/getCatalogs`;
        logger.writeLog("info", `${logBase} 템플릿 목록 검색해서 가져오기`);

        let categories = await axios.post(API_uri, searchJSON, { 
            headers: {
                "Authorization": "Bearer " + SHUKET_TOKEN
            }
        }).then(response => {
            logger.writeLog("info", `${logBase} 템플릿 목록 검색해서 가져오기 완료`);
            // console.log(response)
            return response.data.data;
        }).catch(error => {
            // console.log(error)
            if (error.response.data.code) {
                logger.writeLog("error", `${logBase} 템플릿 목록 검색해서 가져오기 오류 - (${error.response.data.code}) ${error.response.data.message}`);
            } else if (error.response.data.resultCode) {
                logger.writeLog("error", `${logBase} 템플릿 목록 검색해서 가져오기 오류 - (${error.response.data.resultCode}) ${error.response.data.resultMessage}`);
            } else {
                logger.writeLog("error", `${logBase} 템플릿 목록 검색해서 가져오기 오류 - (${error})`);
            }
        });

        res.status(200).json({
            result: true,
            data: categories            
        });
    },
    
    // shuket API를 이용하여 템플릿 정보를 얻고, 그 기반으로 전단을 생성한다
    async createByShuketTemplate(req, res, next) {
        const logBase = `complexM(API).controller.leaflet.createLeaflet`;
        const templateCode = req.body.templateCode;

        let storeInfo = await storeModel.get(req.user.storeCode);
        // 템플릿 상세 얻기 (shuket API call)
        const API_uri = `${SHUKET_API}/moa_back_api/api/v1/getCatalogData`;
        logger.writeLog("info", `${logBase} 템플릿 검색해서 가져오기`);

        let template = await axios.post(API_uri, {
            "templateCode": templateCode
        }, { 
            headers: {
                "Authorization": "Bearer " + SHUKET_TOKEN
            }
        }).then(response => {
            logger.writeLog("info", `${logBase} 템플릿 검색해서 가져오기 완료`);
            return response.data.data;
        }).catch(error => {
            // console.log(error.response.data)
            if (error.response.data.code) {
                logger.writeLog("error", `${logBase} 템플릿 검색해서 가져오기 오류 - (${error.response.data.code}) ${error.response.data.message}`);
            } else if (error.response.data.resultCode) {
                logger.writeLog("error", `${logBase} 템플릿 검색해서 가져오기 오류 - (${error.response.data.resultCode}) ${error.response.data.resultMessage}`);
            } else {
                logger.writeLog("error", `${logBase} 템플릿 검색해서 가져오기 오류 - (${error})`);
            }
        });

        // console.log(affiliatedStoreInfo, template);
        const leafletCode = await leafletModel.create(storeInfo.store_code, template, req.user.loginId);

        res.status(200).json({
            result: true,
            data: leafletCode            
        });
    },

    async create(req, res, next) {
        const logBase = `complexM(API).controller.leaflet.createLeaflet`;

        const storeCode = req.body.storeCode;
        const templateCode = req.body.templateCode;

        // 템플릿 상세 얻기 (shuket API call)
        const templateInfo = await templateModel.get(templateCode);
        // console.log(affiliatedStoreInfo, template);
        const leafletCode = await leafletModel.create(storeCode, templateInfo, req.user.loginId);

        res.status(200).json({
            result: true,
            data: leafletCode            
        });
    },

    async moveUp(req, res, next) {
        const storeCode = req.body.storeCode;
        const leafletCode = req.body.leafletCode;
        const order = parseInt(req.body.order);

        const result = await leafletModel.moveUp(leafletCode, storeCode, order, req.user.loginId);

        res.status(200).json({
            result: true,
            data: result            
        });
    },  

    async moveDown(req, res, next) {
        const storeCode = req.body.storeCode;
        const leafletCode = req.body.leafletCode;
        const order = parseInt(req.body.order);

        const result = await leafletModel.moveDown(leafletCode, storeCode, order, req.user.loginId);

        res.status(200).json({
            result: true,
            data: result            
        });
    },  
    
    // 전단지의 보기여부를 토글한다 A <-> D
    async toggleActive(req, res, next) {
        const leafletCode = req.body.leafletCode;

        const result = await leafletModel.toggleActive(leafletCode);

        res.status(200).json({
            result: true,
            data: result            
        });
    },
    
    // 전단지의 보기여부를 변경한다 C
    async remove(req, res, next) {
        const storeCode = req.body.storeCode;
        const leafletCode = req.body.leafletCode;

        const result = await leafletModel.remove(storeCode, leafletCode);

        res.status(200).json({
            result: true,
            data: result            
        });
    },

    // 대상 리플렛을 복제
    async copy(req, res, next) {
        const storeCode = req.body.storeCode;
        const leafletCode = req.body.leafletCode;

        let response = await leafletModel.copyLeaflet(storeCode, leafletCode, req.user.loginId);

        res.status(200).json({
            result: true,
            data: response            
        });
    },

    // 등록된 전단지 정보를 얻는다
    async get(req, res, next) {
        const leafletCode = req.body.leafletCode;

        const data = await leafletModel.get(leafletCode);

        res.status(200).json({
            result: true,
            data: data            
        });
    },

    // 전단지의 날짜 보기 설정을 저장
    async modifyUseTime(req, res, next) {
        const leafletCode = req.body.leafletCode;
        const useTime = req.body.useTime;
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;

        const result = await leafletModel.modifyUseTime(leafletCode, useTime, startDate, endDate, req.user.loginId);

        res.status(200).json({
            result: true,
            data: result            
        });
    },

    // 전단지의 데이터 JSON만 업데이트한다
    async updateDataJSON(req, res, next) {
        const leafletCode = req.body.leafletCode;
        const dataJSON = req.body.dataJSON;

        const result = await leafletModel.updateDataJSON(leafletCode, dataJSON, req.user.loginId);

        res.status(200).json({
            result: true,
            data: result            
        });
    },

    // 전단지의 템플릿을 변경한다
    async updateTemplate(req, res, next) {
        const leafletCode = req.body.leafletCode;
        const templateCode = req.body.templateCode;

        const result = await leafletModel.updateTemplate(leafletCode, templateCode, req.user.loginId);

        res.status(200).json({
            result: true,
            data: result            
        });
    },
   
    async getUseLeaflet(req, res, next) {
        const storeCode = req.body.storeCode;

        const list = await leafletModel.listForUse(storeCode);

        res.status(200).json({
            result: true,
            data: list            
        });
    },  


}