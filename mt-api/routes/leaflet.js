var express = require('express');
var router = express.Router();
const authController = require('../app/controllers/authController.js');
const leafletController = require('../app/controllers/leafletController.js');

// router.get('/apiAddAuto', refuse.smsdisagree);

// router.post('/apiGetCategory', auth.verify, leaflet.getCategory);

// router.post('/apiGetCountOption', auth.verify, leaflet.getCountOption);

router.post('/apiList', authController.verify, leafletController.list);
router.post('/apiSearchTemplate', authController.verify, leafletController.searchTemplate);
router.post('/apiCreate', authController.verify, leafletController.create);
router.post('/apiMoveUp', authController.verify, leafletController.moveUp);
router.post('/apiMoveDown', authController.verify, leafletController.moveDown);
router.post('/apiToggleActive', authController.verify, leafletController.toggleActive);
router.post('/apiRemove', authController.verify, leafletController.remove);
router.post('/apiCopy', authController.verify, leafletController.copy);
router.post('/apiGet', authController.verify, leafletController.get);
router.post('/apiModifyUseTime', authController.verify, leafletController.modifyUseTime);
router.post('/apiUpdateDataJSON', authController.verify, leafletController.updateDataJSON);
router.post('/apiUpdateTemplate', authController.verify, leafletController.updateTemplate);

// router.post('/apiGetBanner', auth.verify, leaflet.getBanner);

router.post('/apiGetUseLeaflet', leafletController.getUseLeaflet);


// router.post('/apiUpdateLeafletImage', auth.verify, leaflet.updateLeafletImage);


module.exports = router;
