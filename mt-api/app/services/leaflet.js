const logger = require('../../config/logger.js');
const axios = require('axios');

module.exports = class leafletService {  
    // 정해진 등록값으로부터 카카오 로그인 토큰을 얻는다. 이 코드는 API가 호출될 때 계속 사용된다.
    static async getCategoryFromShuket(categoryCode) {
        const logBase = `complexM(API).service.leaflet.getCategoryFromShuket: category(${categoryCode})`;

        const API_uri = `${SHUKET_API}/moa_back_api/api/v1/getCate`;
        logger.writeLog("info", `${logBase} 카테고리 목록 가져오기`);
        let categories = await axios.post(API_uri, {
            cateCode: categoryCode
        }, { 
            headers: {
                "Authorization": "Bearer " + SHUKET_TOKEN
            }
        }).then(response => {
            logger.writeLog("info", `${logBase} 카테고리 목록 가져오기 완료`);
            // console.log(response)
            return response.data.data;
        }).catch(error => {
            // console.log(error.response.data)
            if (error.response.data.code) {
                logger.writeLog("error", `${logBase} 카테고리 목록 가져오기 오류 - (${error.response.data.code}) ${error.response.data.message}`);
            } else if (error.response.data.resultCode) {
                logger.writeLog("error", `${logBase} 카테고리 목록 가져오기 오류 - (${error.response.data.resultCode}) ${error.response.data.resultMessage}`);
            } else {
                logger.writeLog("error", `${logBase} 카테고리 목록 가져오기 오류 - (${error})`);
            }
            return null;
        });

        return categories;
    }

    static async getBannerFromShuket(page, rowCount, keyword) {
        const logBase = `complexM(API).service.leaflet.getBannerFromShuket: page(${page}), rowCount(${rowCount}), keyword(${keyword})`;

        const API_uri = `${SHUKET_API}/moa_back_api/api/v1/getBanner`;
        logger.writeLog("info", `${logBase} 배너 목록 가져오기`);
        let categories = await axios.post(API_uri, {
            pageNumber: page,
            pageSize: rowCount,
            searchKeyword: keyword
          }, { 
            headers: {
                "Authorization": "Bearer " + SHUKET_TOKEN
            }
        }).then(response => {
            logger.writeLog("info", `${logBase} 배너 목록 가져오기 완료`);
            // console.log(response)
            return response.data.data;
        }).catch(error => {
            // console.log(error.response.data)
            if (error.response.data.code) {
                logger.writeLog("error", `${logBase} 배너 목록 가져오기 오류 - (${error.response.data.code}) ${error.response.data.message}`);
            } else if (error.response.data.resultCode) {
                logger.writeLog("error", `${logBase} 배너 목록 가져오기 오류 - (${error.response.data.resultCode}) ${error.response.data.resultMessage}`);
            } else {
                logger.writeLog("error", `${logBase} 배너 목록 가져오기 오류 - (${error})`);
            }
            return null;
        });

        return categories;
    }
    
}