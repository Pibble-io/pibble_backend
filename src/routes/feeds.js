import { feedsController } from '../controllers/FeedsController';
import { accessGuard } from '../middlewares/guards';

const router = require('express-promise-router')();

router.get('/my', accessGuard(), feedsController.getMyFeeds);
router.get('/friends', accessGuard(), feedsController.getFriendsFeeds);

module.exports = router;