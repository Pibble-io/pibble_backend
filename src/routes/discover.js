import { discoverController } from '../controllers/DiscoverController';
import {accessGuard} from "../middlewares/guards";

const router = require('express-promise-router')();

router.get('/', accessGuard(), discoverController.index);
router.get('/suggest', accessGuard(), discoverController.getSuggest);
router.get('/top', accessGuard(), discoverController.getTop);

module.exports = router;