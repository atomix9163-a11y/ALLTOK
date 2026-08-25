var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const customerController = require('../app/controllers/customerController.js');

// router.post('/apiUpdate', users.update);

router.post('/apiGetGroup', authController.verify, customerController.getGroup);

router.post('/apiGroupList', authController.verify, customerController.getGroupList);

router.post('/apiCreateGroup', authController.verify, customerController.createGroup);

router.post('/apiUpdateGroup', authController.verify, customerController.updateGroup);

router.post('/apiRemoveGroup', authController.verify, customerController.removeGroup);
router.post('/apiReviveGroup', authController.verify, customerController.reviveGroup);

router.post('/apiGroupMembers', authController.verify, customerController.getGroupMemberList);

router.post('/apiGroupMemberCount', authController.verify, customerController.groupMemberCount);

router.post('/apiAddMember', authController.verify, customerController.addMember);

router.post('/apiRemoveMember', authController.verify, customerController.removeMember);
router.post('/apiRemoveMemberSeq', authController.verify, customerController.removeMemberSeq);

// router.post('/apiRemoveAllMember', auth.verify, customers.removeAllMember);

router.post('/apiUploadExcel', authController.verify, customerController.uploadExcel);

// router.post('/apiCustomerAllCount', auth.verify, customers.customerAllCount);

module.exports = router;
