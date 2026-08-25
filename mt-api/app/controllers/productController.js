const shuketConnectModel = require('../models/shuketConnect.js');
const productModel = require('../models/productModel.js');
// const productsService = require('../services/products.js');

module.exports = {
    // async get(req, res, next) {
    //     let SEQ = req.body.SEQ;

    //     let data = await productsModel.get(SEQ);

    //     // console.log(data)
    //     res.status(200).json({
    //         result: true,
    //         data: data
    //     });
    // },

    // async getProductCode(req, res, next) {
    //     let P_CODE = req.body.P_CODE;
    //     let P_STATUS = req.body.P_STATUS;

    //     let data = await productsModel.getByCode(P_CODE, P_STATUS);

    //     // console.log(data)
    //     res.status(200).json({
    //         result: true,
    //         data: data
    //     });
    // },

    // async getProductListCode(req, res, next) {
    //     let P_CODES = req.body.P_CODES;
    //     let P_STATUS = req.body.P_STATUS;

    //     let data = await productsModel.getByCodes(P_CODES, P_STATUS);

    //     // console.log(data)
    //     res.status(200).json({
    //         result: true,
    //         data: data
    //     });
    // },

    
    // async getForMobile(req, res, next) {
    //     let store_code = req.body.store_code;
    //     let p_code = req.body.p_code;
    //     let p_barcode = req.body.p_barcode;
    //     let productId = req.body.productId;
    //     let count = req.body.count;
        
    //     let data = await productsModel.getForMobile(store_code, p_code, p_barcode, productId, count);

    //     // console.log(data)
    //     res.status(200).json({
    //         result: true,
    //         data: data
    //     });
    // },

    // async list(req, res, next) {
    //     let store_code = req.body.store_code;
    //     let searchType = req.body.searchType;
    //     let searchValue = req.body.searchValue;
    //     let status = req.body.status;
    //     let CTGRY_LARGE_NO = req.body.CTGRY_LARGE_NO;
    //     let CTGRY_MEDIUM_NO = req.body.CTGRY_MEDIUM_NO;
    //     let CTGRY_SMALL_NO = req.body.CTGRY_SMALL_NO;
    //     let startDate = req.body.startDate;
    //     let endDate = req.body.endDate;
    //     let page = req.body.page;
    //     let rowCount = req.body.rowCount;

    //     // console.log(store_code, searchType, searchValue, status, CTGRY_LARGE_NO, CTGRY_MEDIUM_NO, CTGRY_SMALL_NO, startDate, endDate, page, rowCount)

    //     let data = await productsModel.list(store_code, searchType, searchValue, status, CTGRY_LARGE_NO, CTGRY_MEDIUM_NO, CTGRY_SMALL_NO, startDate, endDate, page, rowCount);

    //     // console.log(data)
    //     res.status(200).json({
    //         result: true,
    //         data: data
    //     });
    // },

    // async listSelected(req, res, next) {
    //     let SEQs = req.body.SEQs;

    //     let data = await productsModel.listSelected(SEQs);

    //     // console.log(data)
    //     res.status(200).json({
    //         result: true,
    //         data: data
    //     });
    // },   

    // async listForMobile(req, res, next) {
    //     let store_code = req.body.store_code;
    //     let searchValue = req.body.searchValue;
    //     let category1st = req.body.category1st;
    //     let category2nd = req.body.category2nd;
    //     let category3rd = req.body.category3rd;
    //     let order = req.body.order;
    //     let page = req.body.page;
    //     let rowCount = req.body.rowCount;

    //     let data = await productsModel.listForMobile(store_code, searchValue, category1st, category2nd, category3rd, order, page, rowCount);

    //     // console.log(data)
    //     res.status(200).json({
    //         result: true,
    //         data: data
    //     });
    // },

    // async setStatus(req, res, next) {
    //     let SEQ = req.body.SEQ;
    //     let P_STATUS = req.body.P_STATUS;

    //     let data = await productsModel.setStatus(SEQ, P_STATUS);

    //     // console.log(data)
    //     res.status(200).json({
    //         result: true,
    //         data: data
    //     });
    // },

    // async setStatusMulti(req, res, next) {
    //     let SEQs = req.body.SEQs;
    //     let P_STATUS = req.body.P_STATUS;

    //     let data = await productsModel.setStatusMulti(SEQs, P_STATUS);

    //     // console.log(data)
    //     res.status(200).json({
    //         result: true,
    //         data: data
    //     });
    // },
    

    // async uploadExcel(req, res, next) {
    //     const xlsx = require( "xlsx" );       
    //     let store_code = req.body.store_code;
    //     let file = req.body.file;
    //     let path = req.body.path;
    //     // console.log(req.user)

    //     const excelFile = xlsx.readFile(path);
    //     const jsonData = xlsx.utils.sheet_to_json(excelFile.Sheets[excelFile.SheetNames[0]], { defval : "" } );

    //     // let result = await productsService.addFromJSON(store_code, jsonData, req.user.loginId)
    //     let result = await productsService.addFromJSON(store_code, jsonData, "test")
    //     // console.log(result);

    //     res.status(200).json({
    //         result: true,
    //         data: result
    //     });
    // },

    async findPhoto(req, res, next) {
        let existBarCode = req.body.existBarCode;
        let keyword = req.body.keyword;
        let page = req.body.page;
        let rowCount = req.body.rowCount;

        let data = await shuketConnectModel.findPhotoShuketByName(existBarCode, keyword, page, rowCount);

        res.status(200).json({
            result: true,
            data: data
        });
    },

    async changePhoto(req, res, next) {
        let productCode = req.body.productCode;
        let IM_URI = req.body.IM_URI;
        // console.log(IM_URI)

        let P_IMG = JSON.stringify([
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

        // console.log(SEQ, P_IMG)
        let data = await productModel.updatePhoto(productCode, P_IMG);

        res.status(200).json({
            result: true,
            data: data
        });
    },

    // async find(req, res, next) {
    //     const P_BARCODE = (req.body.P_BARCODE) ? req.body.P_BARCODE : "";

    //     // 동일한 바코드(P_BARCODE) 또는 상품코드(P_CODE)의 상품이 있는지 검색한다
    //     let productInfo = (P_BARCODE.length == 0) ? null : await productsModel.find(P_BARCODE);

    //     res.status(200).json({
    //         result: true,
    //         data: productInfo
    //     });
    // },

    // async create(req, res, next) {
    //     let product = {
    //         SEQ: 0,
    //         STORE_CODE: "",
    //         P_CODE: "",
    //         P_NAME: "",
    //         P_CAT_CODE: "",
    //         P_CAT: "",
    //         P_MCAT_CODE: "",
    //         P_MCAT: "",
    //         P_CAT_SEQNO: "",
    //         P_CAT_SUB: "",
    //         P_UNIT: "",
    //         P_BARCODE: "",
    //         P_LIST_PRICE: "",
    //         P_PROVIDER: "",
    //         P_SALE_PRICE: "",
    //         P_IMG: "",
    //         P_TAGS: "",
    //         P_MIN_STOCK: "",
    //         P_STOCK: "",
    //         P_STATUS: ""
    //     }
    //     product.STORE_CODE = req.user.storeCode;
    //     product.P_CODE = req.body.P_CODE;
    //     product.P_BARCODE = req.body.P_BARCODE;
    //     product.P_PROVIDER = req.body.P_PROVIDER;
    //     product.P_NAME = req.body.P_NAME;
    //     product.P_UNIT = req.body.P_UNIT;
    //     product.P_CAT_CODE = (req.body.P_CAT_CODE) ? parseInt(req.body.P_CAT_CODE) : 0;
    //     product.P_CAT = req.body.P_CAT;
    //     product.P_MCAT_CODE = (req.body.P_MCAT_CODE) ? parseInt(req.body.P_MCAT_CODE) : 0;
    //     product.P_MCAT = req.body.P_MCAT;
    //     product.P_CAT_SUB = req.body.P_CAT_SUB;
    //     product.P_CAT_SEQNO = (req.body.P_CAT_SEQNO) ? parseInt(req.body.P_CAT_SEQNO) : 0;
    //     product.P_LIST_PRICE = (req.body.P_LIST_PRICE) ? parseInt(req.body.P_LIST_PRICE) : 0;
    //     product.P_SALE_PRICE = (req.body.P_SALE_PRICE) ? parseInt(req.body.P_SALE_PRICE) : 0;
    //     product.P_STATUS = req.body.P_STATUS;
    //     product.P_STOCK = (req.body.P_STOCK) ? parseInt(req.body.P_STOCK) : 0;
    //     product.P_MIN_STOCK = (req.body.P_MIN_STOCK) ? parseInt(req.body.P_MIN_STOCK) : 0;
    //     product.P_TAGS = req.body.P_TAGS;

    //     // 바코드에서 이미지를 얻어서 세팅
    //     if (product.P_BARCODE != "") {
    //         let IM_URI = await shuketConnectModel.getImageUriByBarcode(product.P_BARCODE);
        
    //         if (!IM_URI) {
    //             IM_URI = await shuketConnectModel.getImageUriByName(product.P_NAME);
    //         }
    //         product.P_IMG = JSON.stringify([
    //             {
    //                 "sv_key": "sv1",
    //                 "items":[
    //                     {
    //                         "key":"thumb",
    //                         "value": IM_URI
    //                     }
    //                 ],
    //                 "main":"1",
    //                 "priority":"1"
    //             }
    //         ]);
    //     } else {
    //         product.P_IMG = '[{"sv_key":"sv1","items":[{"key":"thumb","value":null}],"main":"1","priority":"1"}]';
    //     }
        
    //     let data = await productsModel.createSingle(product, req.user.loginId);

    //     res.status(200).json({
    //         result: true,
    //         data: data
    //     });
    // },

    // async update(req, res, next) {
    //     let product = {
    //         SEQ: 0,
    //         STORE_CODE: req.user.storeCode,
    //         P_CODE: "",
    //         P_NAME: "",
    //         P_CAT_CODE: "",
    //         P_CAT: "",
    //         P_MCAT_CODE: "",
    //         P_MCAT: "",
    //         P_CAT_SEQNO: "",
    //         P_CAT_SUB: "",
    //         P_UNIT: "",
    //         P_BARCODE: "",
    //         P_LIST_PRICE: "",
    //         P_PROVIDER: "",
    //         P_SALE_PRICE: "",
    //         P_IMG: "",
    //         P_TAGS: "",
    //         P_MIN_STOCK: "",
    //         P_STOCK: "",
    //         P_STATUS: ""
    //     }
    //     product.SEQ = req.body.SEQ;
    //     product.P_CODE = req.body.P_CODE;
    //     product.P_BARCODE = req.body.P_BARCODE;
    //     product.P_PROVIDER = req.body.P_PROVIDER;
    //     product.P_NAME = req.body.P_NAME;
    //     product.P_UNIT = req.body.P_UNIT;
    //     product.P_CAT_CODE = (req.body.P_CAT_CODE) ? parseInt(req.body.P_CAT_CODE) : 0;
    //     product.P_CAT = req.body.P_CAT;
    //     product.P_MCAT_CODE = (req.body.P_MCAT_CODE) ? parseInt(req.body.P_MCAT_CODE) : 0;
    //     product.P_MCAT = req.body.P_MCAT;
    //     product.P_CAT_SUB = req.body.P_CAT_SUB;
    //     product.P_CAT_SEQNO = (req.body.P_CAT_SEQNO) ? parseInt(req.body.P_CAT_SEQNO) : 0;
    //     product.P_LIST_PRICE = (req.body.P_LIST_PRICE) ? parseInt(req.body.P_LIST_PRICE) : 0;
    //     product.P_SALE_PRICE = (req.body.P_SALE_PRICE) ? parseInt(req.body.P_SALE_PRICE) : 0;
    //     product.P_STATUS = req.body.P_STATUS;
    //     product.P_STOCK = (req.body.P_STOCK) ? parseInt(req.body.P_STOCK) : 0;
    //     product.P_MIN_STOCK = (req.body.P_MIN_STOCK) ? parseInt(req.body.P_MIN_STOCK) : 0;
    //     product.P_TAGS = req.body.P_TAGS;
        
    //     const info = await productsModel.getByCode(product.P_CODE, product.P_STATUS);
    //     // 바코드에서 이미지를 얻어서 세팅
    //     if (product.P_BARCODE != "") {
    //         let IM_URI = await shuketConnectModel.getImageUriByBarcode(product.P_BARCODE);
        
    //         if (!IM_URI) {
    //             IM_URI = await shuketConnectModel.getImageUriByName(product.P_NAME);
    //         }
    //         product.P_IMG = JSON.stringify([
    //             {
    //                 "sv_key": "sv1",
    //                 "items":[
    //                     {
    //                         "key":"thumb",
    //                         "value": IM_URI
    //                     }
    //                 ],
    //                 "main":"1",
    //                 "priority":"1"
    //             }
    //         ]);
    //     } else {
    //         product.P_IMG = info.P_IMG;
    //     }

    //     // console.log(product.P_BARCODE, product.P_IMG);
        
    //     // let data = await productsModel.update(product, req.user.loginId);
    //     let data = await productsModel.update(product, req.user.loginId);

    //     res.status(200).json({
    //         result: true,
    //         data: data
    //     });
    // },

}