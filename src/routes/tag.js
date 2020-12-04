import { tagController } from '../controllers/TagController';
import { accessGuard } from '../middlewares/guards';

const router = require('express-promise-router')();

// GET: Categories list
router.get('/', tagController.getTags);
router.get('/:username/followed', accessGuard(), tagController.getFollowedTags);
router.get('/:id/posts', accessGuard(), tagController.getPosts);
router.get('/by_name/:tag_name/posts', accessGuard(), tagController.getPostsByName);
router.post('/:id/follow', accessGuard(), tagController.follow);
router.post('/:id/unfollow', accessGuard(), tagController.unfollow);

module.exports = router;