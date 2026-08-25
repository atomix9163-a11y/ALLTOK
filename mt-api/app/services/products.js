const logger = require('../../config/logger.js');
const categoryModel = require('../models/category.js');
const productsModel = require('../models/products.js');
const shuketConnectModel = require('../models/shuketConnect.js');

module.exports = class productsService {
    static async addFromJSON(store_code, jsonData, loginId) {

        // let affiliatedStoreInfo = await affiliatedStoreModel.get(store_code);

        let result = {
            total: 0,
            success: 0,
            fail: 0,
            log: []
        }
        // 대상 목록에 대해 반복
        for (let product of jsonData) {
            // console.log(product)
            product.STORE_CODE = store_code;
            product.P_CODE = product.상품코드;
            product.P_BARCODE = product.바코드;
            product.P_NAME = product.상품명;
            product.P_CAT = (product.대분류) ? product.대분류 : "";
            product.P_MCAT = (product.중분류) ? product.중분류 : "";
            product.P_CAT_SUB = (product.소분류) ? product.소분류 : "";
            product.P_UNIT = (product.단위) ? product.단위 : "";
            product.P_LIST_PRICE = product.가격;
            product.P_SALE_PRICE = (product.할인가) ? product.할인가 : product.가격;
            product.P_TAGS = (product.태그) ? product.태그 : "";
            product.P_PROVIDER = (product.제조사) ? product.제조사 : "";
            product.P_MIN_STOCK = (product.판매최소재고) ? product.판매최소재고 : 999;
            product.P_STOCK = (product.재고) ? product.재고 : 999;
            product.P_STATUS = 'A';

            result.total++;
            // 각 항목에 대해 바코드와 api를 이용해서 이미지 정보 얻어서 데이터를 생성한다
            let IM_URI = await shuketConnectModel.getImageUriByBarcode(product.P_BARCODE);
            // console.log(IM_URI)
            if (!IM_URI) {
                IM_URI = await shuketConnectModel.getImageUriByName(product.P_NAME);
            }
            product.P_IMG = JSON.stringify([
                {
                    "sv_key": "sv1",
                    "items":[
                        {
                            "key":"thumb",
                            "value": IM_URI
                        }
                    ],
                    "main":"1",
                    "priority":"1"
                }
            ]);

            //카테고리 값으로부터 카테고리 코드를 얻어온다
            // product.P_CAT_CODE
            // product.P_MCAT_CODE
            // product.P_CAT_SUB
            let P_CAT_CODE = await categoryModel.find(store_code, product.P_CAT, 0, 0, 0)
            product.P_CAT_SEQNO = P_CAT_CODE.CTGRY_SEQNO; 
            product.P_CAT_CODE = P_CAT_CODE.CTGRY_CODE;
            if (product.P_CAT_CODE) {
                let P_MCAT_CODE = await categoryModel.find(store_code, product.P_MCAT, 1, product.P_CAT_CODE, 0)
                if (P_MCAT_CODE.CTGRY_CODE != 0) {
                    product.P_CAT_SEQNO = P_MCAT_CODE.CTGRY_SEQNO; 
                    product.P_MCAT_CODE = P_MCAT_CODE.CTGRY_CODE;                  
                    let P_CAT_SUB = await categoryModel.find(store_code, product.P_CAT_SUB, 2, product.P_CAT_CODE, product.P_MCAT_CODE);
                    if (P_CAT_SUB.CTGRY_CODE != 0) {
                        product.P_CAT_SEQNO = P_MCAT_CODE.CTGRY_SEQNO; 
                    }
                }
            }
            product.P_TAGS = `${product.P_CODE}#${product.P_NAME.split(" ").join("#")}${(product.P_PROVIDER != "") ? `#${product.P_PROVIDER}` : ""}`;

            // 데이터를 추가한다
            // let createResult = {
            //     P_CODE: product.P_CODE,
            //     P_NAME: product.P_NAME
            // }

            let productInfo = (product.P_CODE != "") ? await productsModel.getByCode(product.P_CODE, 'A') : null;
            
            // console.log("productInfo", product.P_CODE, productInfo)

            let logBase = `services/productsService.addFromJSON: store_code(${store_code})`;
            let db_result;
            if (productInfo == null) {
                logger.writeLog("info", `${logBase} 신규 상품 추가`);
                db_result = await productsModel.create(store_code, product, loginId);
                if (db_result) {
                    result.success++;
                    db_result.RESULT = "OK";
                } else {
                    result.fail++;
                    db_result.RESULT = "DB ERROR";
                }
            } else {
                logger.writeLog("info", `${logBase} ${product.P_CODE} 상품 변경`);
                db_result = await productsModel.update(product, loginId);
                if (db_result) {
                    result.success++;
                    db_result.RESULT = "OK";
                } else {
                    result.fail++;
                    db_result.RESULT = "DB ERROR";
                }
                // db_result = {
                //     STORE_CODE: store_code,
                //     P_CODE: product.P_CODE,
                //     P_NAME: product.P_NAME,
                // }
                // result.fail++;
                // db_result.RESULT = "DUPLICATE";
            }

            result.log.push(db_result);
            // console.log(product)
        }
        return result;
    }

}