import { reportController } from '../controllers/ReportController';
import { accessGuard } from '../middlewares/guards';

import { doubleRequestGuard } from '../helpers/RateLimit';

const router = require('express-promise-router')();

router.get('/inappropriate/reasons', accessGuard(), doubleRequestGuard, reportController.inappropriateReasons);
router.post('/block/:post_id', accessGuard(), reportController.blockReport);
router.post('/inappropriate/:post_id/:reason_id', accessGuard(), doubleRequestGuard, reportController.inappropriateReport);

module.exports = router;