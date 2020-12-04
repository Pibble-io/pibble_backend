import { topGroupsController } from '../controllers/TopGroupsController';
import { accessGuard } from '../middlewares/guards';

const router = require('express-promise-router')();

router.get('/news', accessGuard(), topGroupsController.getNews);
router.get('/coin', accessGuard(), topGroupsController.getCoin);
router.get('/webtoon', accessGuard(), topGroupsController.getWebtoon);
router.get('/newbie', accessGuard(), topGroupsController.getNewbie);
router.get('/funding', accessGuard(), topGroupsController.getFunding);
router.get('/promoted', accessGuard(), topGroupsController.getPromoted);
router.get('/shop', accessGuard(), topGroupsController.getShop);
router.get('/hot', accessGuard(), topGroupsController.getHot);
router.get('/leaderbourd', accessGuard(), topGroupsController.getLeaderbourd);
router.get('/timer', accessGuard(), topGroupsController.getDailyTimer);

module.exports = router;