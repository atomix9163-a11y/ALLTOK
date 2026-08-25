const MTSService = require('../services/MTSService.js');
const kakaoModel = require('../models/kakaoModel.js');
const storeModel = require('../models/storeModel.js');
const storeService = require('../services/storeService.js');
const moment = require('moment');

module.exports = {


    /******************************************/
    /* 엠티에스 API 호출용 */
    /******************************************/
    async getProfileList(req, res, next) {
        let page = (req.body.page) ? req.body.page : '1';
        let rowCount = (req.body.rowCount) ? req.body.rowCount : '20';

        let profileList = await kakaoModel.listProfile(page, rowCount);
        res.status(200).json({
            result: true,
            data: profileList            
        });
    },

    async getCategoryList(req, res, next) {
        const findCategory = (categoryTree, code) => {
            const item = categoryTree.find(e => e.code == code);
            return item;
        }

        let categoryList = await MTSService.getProfileCategoryAll();        
        // console.log(categoryList)
        let categoryTree = [];

        for (let item of categoryList) {
            
            const categoryCode = [item.code.substring(0, 3), item.code.substring(3, 7), item.code.substring(7, 11)]
            const categoryItem = item.name.split(",");

            // console.log(categoryCode)
            // 1번 코드를 얻어서 데이터에서 찾는다
            let firstCategory = findCategory(categoryTree, categoryCode[0]);
            if (!firstCategory) {
                // 1번이 없으므로 신규로 추가
                firstCategory = {
                    code: categoryCode[0],
                    name: categoryItem[0],
                    category: []
                }
                categoryTree.push(firstCategory);
            }

            // 2번 코드를 얻어서 데이터에서 찾는다
            let secondCategory = findCategory(firstCategory.category, categoryCode[1]);
            if (!secondCategory) {
                // 2 번째 카테고리가 없으므로 신규로 추가
                secondCategory = {
                    code: categoryCode[1],
                    name: categoryItem[1],
                    category: []
                }
                firstCategory.category.push(secondCategory);
            }

            // 3번 코드를 얻어서 데이터에서 찾는다
            let thirdCategory = findCategory(secondCategory.category, categoryCode[2]);
            if (!thirdCategory) {
                // 2 번째 카테고리가 없으므로 신규로 추가
                thirdCategory = {
                    code: categoryCode[2],
                    name: categoryItem[2],
                    fullCode: item.code,
                    fullName: item.name
                }
                secondCategory.category.push(thirdCategory);
            }
        }
        // console.log(categoryTree)
        res.status(200).json({
            result: true,
            data: {
                list: categoryList,
                tree: categoryTree
            }
        });

        
    },
    
    async sendToken(req, res, next) {
        let yellowId = req.body.yellowId;
        let phoneNumber = req.body.phoneNumber;

        let response = await MTSService.getToken(yellowId, phoneNumber);
        res.status(200).json({
            result: true,
            data: response            
        });
    },
    
    async profileAdd(req, res, next) {
        const storeCode = req.body.storeCode;
        const yellowId = req.body.yellowId;
        const categoryCode = req.body.categoryCode;
        const categoryName = req.body.categoryName;
        const phoneNumber = req.body.phoneNumber;
        const token = req.body.token;
        const C_ID = (req.user.loginId) ? req.user.loginId : "system";

        // MTS에 프로파일 등록 호출
       let response = await MTSService.createProfile(token, phoneNumber, yellowId, categoryCode);

        // console.log(response.code)
       if (response.code == "200") {
            // MTS에 프로파일 등록이 성공하면 데이터베이스에 기록
            const responseDBUpdate = await kakaoModel.addProfile(storeCode, yellowId, response.data.name, response.data.senderKey, categoryCode, categoryName, C_ID);
            // const responseDBUpdate = await kakaoModel.addProfile(storeCode, yellowId, "미스뷰티 코리아", "7d8bf16816d4d93b01e765d7c4c977f08bdb17c4", categoryCode, categoryName, C_ID);
            if (responseDBUpdate) {
                // 서비스에 있는 프로파일 업데이트
                let serviceJSON = await storeModel.getService(storeCode);
                if (!serviceJSON) {
                    serviceJSON = storeService.buildServiceJSON(null);
                } else {
                    serviceJSON = JSON.parse(serviceJSON.data);
                }
                serviceJSON.MTS_kakaoProfilekey = response.data.senderKey;
                // serviceJSON.MTS_kakaoProfilekey = "7d8bf16816d4d93b01e765d7c4c977f08bdb17c4";
                await storeModel.saveService(storeCode, JSON.stringify(serviceJSON), C_ID);
            }
       }

        res.status(200).json({
            result: true,
            data: response            
        });
    },

    async profileAddForce(req, res, next) {
        const storeCode = req.body.storeCode;
        const yellowId = req.body.yellowId;        
        const categoryCode = req.body.categoryCode;
        const categoryName = req.body.categoryName;
        const profileKey = req.body.profileKey;
        const C_ID = (req.user.loginId) ? req.user.loginId : "system";

        // MTS에 프로파일 등록이 성공하면 데이터베이스에 기록
        const responseDBUpdate = await kakaoModel.addProfile(storeCode, yellowId, "force added", profileKey, categoryCode, categoryName, C_ID);
        // const responseDBUpdate = await kakaoModel.addProfile(storeCode, yellowId, "미스뷰티 코리아", "7d8bf16816d4d93b01e765d7c4c977f08bdb17c4", categoryCode, categoryName, C_ID);
        if (responseDBUpdate) {
            // 서비스에 있는 프로파일 업데이트
            let serviceJSON = await storeModel.getService(storeCode);
            if (!serviceJSON) {
                serviceJSON = storeService.buildServiceJSON(null);
            } else {
                serviceJSON = JSON.parse(serviceJSON.data);
            }
            serviceJSON.MTS_kakaoProfilekey = profileKey;
            // serviceJSON.MTS_kakaoProfilekey = "7d8bf16816d4d93b01e765d7c4c977f08bdb17c4";
            await storeModel.saveService(storeCode, JSON.stringify(serviceJSON), C_ID);
        }

        res.status(200).json({
            result: true,
            data: responseDBUpdate            
        });
    },

    async profileRemove(req, res, next) {
        const storeCode = req.body.storeCode;
        const yellowId = req.body.yellowId;
        const M_ID = (req.user.loginId) ? req.user.loginId : "system";

        // 정보를 얻는다
        const profileInfo = await kakaoModel.getProfile(storeCode, yellowId);
        console.log(profileInfo)
        // MTS에 프로파일 등록 호출
        let response = await MTSService.removeProfile(profileInfo.profile_key);

        console.log(response)
       if (response.code == "200") {
            // MTS에 프로파일 등록이 성공하면 데이터베이스에서 삭제
            const responseDBUpdate = await kakaoModel.removeProfile(storeCode, yellowId, M_ID);
            if (responseDBUpdate) {
                // 서비스에 있는 프로파일 삭제
                let serviceJSON = await storeModel.getService(storeCode);
                if (!serviceJSON) {
                    serviceJSON = storeService.buildServiceJSON(null);
                } else {
                    serviceJSON = JSON.parse(serviceJSON.data);
                }
                serviceJSON.MTS_kakaoProfilekey = "";
                await storeModel.saveService(storeCode, JSON.stringify(serviceJSON), M_ID);
            }
       }

        res.status(200).json({
            result: true,
            data: response            
        });
    },

    async profileRemoveForce(req, res, next) {
        const storeCode = req.body.storeCode;
        const M_ID = (req.user.loginId) ? req.user.loginId : "system";

        const responseDBUpdate = await kakaoModel.removeProfileForce(storeCode, M_ID);
        if (responseDBUpdate) {
            // 서비스에 있는 프로파일 삭제
            let serviceJSON = await storeModel.getService(storeCode);
            if (!serviceJSON) {
                serviceJSON = storeService.buildServiceJSON(null);
            } else {
                serviceJSON = JSON.parse(serviceJSON.data);
            }
            serviceJSON.MTS_kakaoProfilekey = "";
            await storeModel.saveService(storeCode, JSON.stringify(serviceJSON), M_ID);
       }

        res.status(200).json({
            result: true,
            data: ""            
        });
    },

    async getTemplateList(req, res, next) {
        let storeCode = (req.body.storeCode) ? req.body.storeCode : '';
        let page = (req.body.page) ? req.body.page : '1';
        let rowCount = (req.body.rowCount) ? req.body.rowCount : '20';

        let templateList = await kakaoModel.listTemplate(page, rowCount, storeCode);
        res.status(200).json({
            result: true,
            data: templateList            
        });
    },   
    
    async templateAdd(req, res, next) {
        const storeCode = req.body.storeCode;
        const templateCode = req.body.templateCode;
        const templateName = req.body.templateName;
        const status = req.body.status;
        const C_ID = (req.user.loginId) ? req.user.loginId : "system";

        const response = await kakaoModel.addTemplate(storeCode, templateCode, templateName, status, C_ID);

        res.status(200).json({
            result: true,
            data: response            
        });
    },

    async templateUpdate(req, res, next) {
        const seq = req.body.seq;
        const storeCode = req.body.storeCode;
        const templateCode = req.body.templateCode;
        const templateName = req.body.templateName;
        const status = req.body.status;
        const M_ID = (req.user.loginId) ? req.user.loginId : "system";

        const response = await kakaoModel.updateTemplate(seq, storeCode, templateCode, templateName, status, M_ID);

        res.status(200).json({
            result: true,
            data: response            
        });

    },

    // MTS API 호출로 템플릿 내용을 가져온다
    async getTemplate(req, res, next) {
        const storeCode = req.body.storeCode;
        const templateCode = req.body.templateCode;

        // 카카오 프로파일을 얻는다
        const profile = await kakaoModel.getProfile(storeCode);

        const response = await MTSService.getTemplate(profile.profile_key, templateCode);

        res.status(200).json({
            result: true,
            data: response            
        });

    },


    /******************************************/
    /* 엠티에스 API 호출용 끝 */
    /******************************************/

}