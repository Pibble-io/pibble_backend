import { referralsController } from '../controllers/ReferralsController';
import { accessGuard } from '../middlewares/guards';
import { doubleRequestGuard } from '../helpers/RateLimit';

const router = require('express-promise-router')();

// router.post('/register', accessGuard(), doubleRequestGuard , referralsController.register);
router.post('/register', accessGuard(), referralsController.register);

router.get('/registered-users', accessGuard(), referralsController.getUsers);
router.get('/owner', accessGuard(), referralsController.getUserByUsedReferral);

module.exports = router;