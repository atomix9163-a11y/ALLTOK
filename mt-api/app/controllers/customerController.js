const storeModel = require('../models/storeModel.js');
const customerModel = require('../models/customerModel.js');

module.exports = {

    async getGroup(req, res, next) {
        let groupCode = req.body.groupCode;

        const data = await customerModel.getGroup(groupCode);

        res.status(200).json({
            result: true,
            data: data
        });
    },

    async getGroupList(req, res, next) {
        const storeCode = req.body.storeCode;
        const showDeleted = req.body.showDeleted;

        const data = await customerModel.groupList(storeCode, showDeleted);

        res.status(200).json({
            result: true,
            data: data
        });
    },

    async createGroup(req, res, next) {
        const storeCode = req.body.storeCode;
        const name = req.body.name;        
        const userId = req.user.loginId;

        const data = await customerModel.createGroup(storeCode, name, userId);

        res.status(200).json({
            result: true,
            data: data
        });
    },

    async updateGroup(req, res, next) {
        const groupCode = req.body.groupCode;
        const name = req.body.name;
        const userId = req.user.loginId;

        const data = await customerModel.updateGroup(groupCode, name, userId);

        res.status(200).json({
            result: true,
            data: data
        });
    },

    async removeGroup(req, res, next) {
        const groupCode = req.body.groupCode;
        const userId = req.user.loginId;

        const data = await customerModel.removeGroup(groupCode, userId);

        res.status(200).json({
            result: true,
            data: data
        });
    },

    async reviveGroup(req, res, next) {
        const groupCode = req.body.groupCode;
        const userId = req.user.loginId;

        const data = await customerModel.reviveGroup(groupCode, userId);

        res.status(200).json({
            result: true,
            data: data
        });
    },
    
    async groupMemberCount(req, res, next) {
        const groupCode = req.body.groupCode;

        const data = await customerModel.groupMemberCount(groupCode);

        res.status(200).json({
            result: true,
            data: data
        });
    },    

    async getGroupMemberList(req, res, next) {
        const groupCode = req.body.groupCode;
        const phone = (req.body.phone) ? req.body.phone : "";
        const page = req.body.page;
        const rowCount = req.body.rowCount;

        const data = await customerModel.groupMemberList(groupCode, phone, page, rowCount);

        res.status(200).json({
            result: true,
            data: data
        });
    },

    async addMember(req, res, next) {
        const storeCode = req.body.storeCode;
        const groupCode = req.body.groupCode;
        const phone = req.body.phone;
        const userId = req.user.loginId;

        const returnCode = await customerModel.addGroupMember(groupCode, storeCode, phone, userId);

        res.status(200).json({
            result: true,
            data: returnCode
        });
    },

    async removeMember(req, res, next) {
        let groupCode = req.body.groupCode;
        let phone = req.body.phone;

        const returnCode = await customerModel.removeGroupMember(groupCode, phone);

        res.status(200).json({
            result: true,
            data: returnCode
        });
    },

    async removeMemberSeq(req, res, next) {
        let groupCode = req.body.groupCode;
        let seq = req.body.seq;

        const returnCode = await customerModel.removeGroupMemberSeq(groupCode, seq);

        res.status(200).json({
            result: true,
            data: returnCode
        });
    },


    // async removeAllMember(req, res, next) {
    //     let group_code = req.body.group_code;

    //     let returnCode = await customersModel.removeAllGroupMember(group_code);

    //     res.status(200).json({
    //         result: true,
    //         data: returnCode
    //     });
    // },


    async uploadExcel(req, res, next) {
        const xlsx = require( "xlsx" );       
        let storeCode = req.body.storeCode;
        let groupCode = req.body.groupCode;
        let file = req.body.file;
        let path = req.body.path;

        const excelFile = xlsx.readFile(path);
        const jsonData = xlsx.utils.sheet_to_json( excelFile.Sheets[excelFile.SheetNames[0]], { defval : "" } );        

        try {
            let phoneList = [];
            jsonData.forEach((item, idx)=>{
                let phone = (item.번호).toString();            
                phone = phone.replace(/-/g, '');
                if (phone.length > 1) {
                    let fistChar =  phone.substring(0, 1);
                    if (fistChar != "0") phone = "0" + phone;
                    if (phone.length <= 15) {
                        phoneList.push(phone);
                    }
                }
            });
            if (phoneList.length > 0) customerModel.addCustomersFromFile(groupCode, storeCode, phoneList);

            res.status(200).json({
                result: true,
                data: phoneList.length
            });
        } catch {
            res.status(200).json({
                result: false,
                data: 0
            });
        }

        // console.log(phoneList)
        // console.log(group_seq, file, path)
    },

    // // 해당 가맹점의 총 고객 숫자 (그룹 구분 없음)
    // async customerAllCount(req, res, next) {
    //     const store_code = req.body.store_code;

    //     let count = await customersModel.customerAllCount(store_code);

    //     res.status(200).json({
    //         result: true,
    //         data: count
    //     });
    // },
}