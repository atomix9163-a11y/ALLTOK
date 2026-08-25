var express = require('express');
var router = express.Router();
const storeController = require('../app/controllers/storeController.js');
const authController = require('../app/controllers/authController.js');

// router.post('/apiUpdateStore', auth.verify, affiliatedStore.updateStore);

// router.post('/apiCount', auth.verify, affiliatedStore.count);

// router.post('/apiList', auth.verify, affiliatedStore.list);

// router.post('/apiGetCode', auth.verify, storeController.getCode);

// router.get('/apiGetByMCODE', auth.verify, storeController.getByMCODE);

// router.get('/apiFindStore', storeController.findStore);

// router.post('/apiCreate', auth.verify, storeController.create);

// router.post('/apiUpdate', auth.verify, storeController.update);


router.post('/apiCount', authController.verify, storeController.count);
router.post('/apiList', authController.verify, storeController.list);
router.post('/apiCreate', authController.verify, storeController.create);

router.post('/apiUpdate', authController.verify, storeController.update);
router.post('/apiUpdateByFront', authController.verify, storeController.updateByFront);
router.post('/apiUpdateStorePhoto', authController.verify, storeController.updateStorePhoto);

router.post('/apiGet', storeController.get);
router.post('/apiGetService', storeController.getService);
router.post('/apiSaveService', authController.verify, storeController.saveService);
router.post('/apiGetVirtualAccount', authController.verify, storeController.apiGetVirtualAccount);


// router.post('/apiGetDeepLink', storeController.getDeepLink);

// router.post('/apiSaveDeepLink', auth.verify, storeController.saveDeepLink);

router.post('/apiSMSAdminList', authController.verify, storeController.listSMSAdmin);
router.post('/apiSMSAdminCreate', authController.verify, storeController.createSMSAdmin);
router.post('/apiSMSAdminDelete', authController.verify, storeController.deleteSMSAdmin);

// router.post('/apiUseHideSMSUpdate', auth.verify, storeController.useHideSMSUpdate);

// router.post('/apiGetMCode', storeController.apiGetMCode);

// router.post('/apiGetDeepLinkMCode', storeController.apiGetDeepLinkMCode);

module.exports = router;
