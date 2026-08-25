var express = require('express');
var router = express.Router();
const apiController = require('../app/controllers/apiController.js');
const authController = require('../app/controllers/authController.js');

// login
router.post('/auth/loginProcess', apiController.authLogin);
// stores
router.post('/store/list', authController.verify, apiController.storeList);
router.post('/store/get', authController.verify, apiController.storeGet);
router.post('/store/create', authController.verify, apiController.storeCreate);
router.post('/store/update', authController.verify, apiController.storeUpdate);
router.post('/store/service/get', authController.verify, apiController.storeServiceGet);
router.post('/store/service/save', authController.verify, apiController.storeServiceSave);

// store cash
router.post('/store/cash/history', authController.verify, apiController.storeCashHistory);
router.post('/store/cash/add', authController.verify, apiController.storeCashAdd);

// virtual bank account
router.post('/account/list', authController.verify, apiController.accountList);
router.post('/account/link', authController.verify, apiController.accountLink);
router.post('/account/historyList', authController.verify, apiController.accountHistory);
router.post('/account/historyListMonth', authController.verify, apiController.accountHistoryMonth);
router.post('/account/historyListMonthERP', authController.verify, apiController.accountHistoryMonthERP);

// verifyphone
router.post('/phone/list', authController.verify, apiController.phoneList);
router.post('/phone/create', authController.verify, apiController.phoneCreate);
router.post('/phone/remove', authController.verify, apiController.phoneRemove);

// users
router.post('/user/list', authController.verify, apiController.userList);
router.post('/user/get', authController.verify, apiController.userGet);
router.post('/user/create', authController.verify, apiController.userCreate);
router.post('/user/update', authController.verify, apiController.userUpdate);

// system
router.post('/systemGet', authController.verify, apiController.systemGet);

// kakao
router.post('/profile/list', authController.verify, apiController.profileList);
router.post('/profile/categoryList', authController.verify, apiController.categoryList);
router.post('/profile/sendToken', authController.verify, apiController.sendToken);
router.post('/profile/add', authController.verify, apiController.profileAdd);
router.post('/profile/remove', authController.verify, apiController.profileRemove);

router.post('/template/list', authController.verify, apiController.templateList);
router.post('/template/add', authController.verify, apiController.templateAdd);
router.post('/template/update', authController.verify, apiController.templateUpdate);

module.exports = router;

