const refuseModel = require('../models/refuseModel.js');
const shuketService = require('../services/shuketService.js');

module.exports = {

    async smsdisagree(req, res, next) {
        let phone = req.body.deniedphoneno;
        let comment = "수신거부 자동 등록";

        let data = await refuseModel.add(null, phone, comment);
        await shuketService.addRefuse(phone, comment);

        res.send("RCV_OK");
    },

    async add(req, res, next) {
        let storeCode = req.body.storeCode;
        let phone = req.body.phone;
        let comment = "수동 입력";

        let data = await refuseModel.add(storeCode, phone, comment);

        res.status(200).json({
            result: true,
            data: data
        });
    },

    async remove(req, res, next) {
        let seq = req.body.seq;

        let data = await refuseModel.remove(seq);

        res.status(200).json({
            result: true,
            data: data
        });
    },

    async list(req, res, next) {
        let storeCode = req.body.storeCode;
        let phone = req.body.phone;
        let page = req.body.page;
        let rowCount = req.body.rowCount;

        let data = await refuseModel.list(storeCode, phone, page, rowCount);

        res.status(200).json({
            result: true,
            data: data
        });
    },

    async uploadExcel(req, res, next) {
        const xlsx = require( "xlsx" );       
        let storeCode = req.body.storeCode;
        let file = req.body.file;
        let path = req.body.path;
        const C_ID = req.user.loginId;

        const excelFile = xlsx.readFile(path);
        const jsonData = xlsx.utils.sheet_to_json( excelFile.Sheets[excelFile.SheetNames[0]], { defval : "" } );        

        let phoneList = [];
        jsonData.forEach((item, idx)=>{
            let phone = (item.번호).toString();            
            phone = phone.replace(/-/g, '');
            if (phone.length > 1) {
                let fistChar =  phone.substring(0, 1);
                if (fistChar != "0") phone = "0" + phone;
                phoneList.push(phone);
            }
        });

        // console.log(phoneList)
        // console.log(group_seq, file, path)
        if (phoneList.length > 0) refuseModel.addCustomersFromFile(storeCode, phoneList, C_ID);

        res.status(200).json({
            result: true,
            data: phoneList.length
        });
    },
}