import { locationController } from '../controllers/LocationController';

const router = require('express-promise-router')();

router.get('/suggest/default', locationController.defaultLocation);
router.get('/', locationController.getLocations);
router.post('/', locationController.create);

module.exports = router;