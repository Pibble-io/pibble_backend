import { postController } from '../controllers/PostController';
import { commentController } from '../controllers/CommentController';
import { promotionController } from '../controllers/PromotionController';
import { goodsRateController } from '../controllers/GoodsRateController';

import { accessGuard, reportBlockingGuard } from '../middlewares/guards';
import { doubleRequestGuard } from '../helpers/RateLimit';

const router = require('express-promise-router')();

//Feedback
router.put('/:id/feedback', accessGuard(), goodsRateController.create);
router.get('/feedback', accessGuard(), goodsRateController.show);

// Posts
router.get('/testping', postController.getTestPing);

router.get('/uuid', accessGuard(), postController.getUuid);

router.get('/', accessGuard(), postController.index);
router.get('/new/', accessGuard(), postController.new_index);

router.put('/', [accessGuard(), reportBlockingGuard()], postController.create);

router.get('/favorites', accessGuard(), postController.getFavorites);

router.get('/purchased-commerce', accessGuard(), postController.myPurchased);
router.get('/my-commerce', accessGuard(), postController.myCommerce);

router.get('/share/:uuid', postController.publicShare);
router.get('/:id', accessGuard(), postController.show);

router.patch('/:id', [accessGuard(), reportBlockingGuard()], postController.update);

router.delete('/', accessGuard(), postController.destroy);

// router.post('/:id/up-vote', accessGuard(), doubleRequestGuard, postController.upVote);
router.post('/:id/up-vote', accessGuard(), postController.upVote);

router.get('/:id/engage', accessGuard(), postController.getEngage);

router.get('/:id/up-votes', accessGuard(), postController.upVotes);

router.post('/:id/favorites', accessGuard(), postController.addToFavorites);

router.delete('/:id/favorites', accessGuard(), postController.deleteFromFavorites);

// router.post('/:id/donate', accessGuard(), doubleRequestGuard, postController.donate);
router.post('/:id/donate', accessGuard(), postController.donate);

router.post('/:id/like', accessGuard(), postController.like);

router.post('/:id/share', accessGuard(), postController.share);

router.post('/:id/spam', accessGuard(), postController.spam);

// Comments
router.get('/:id/comment', accessGuard(), commentController.index);

// router.put('/:id/comment', [accessGuard(), reportBlockingGuard()], doubleRequestGuard, commentController.create);
router.put('/:id/comment', [accessGuard(), reportBlockingGuard()], commentController.create);

router.get('/:postId/comment/:commentId', accessGuard(), commentController.show);

// router.patch('/:postId/comment/:commentId', [accessGuard(), reportBlockingGuard()], doubleRequestGuard, commentController.update);
router.patch('/:postId/comment/:commentId', [accessGuard(), reportBlockingGuard()], commentController.update);

router.delete('/:postId/comment/:commentId', accessGuard(), commentController.destroy);

// router.post('/:postId/comment/:commentId/reply', [accessGuard(), reportBlockingGuard()], doubleRequestGuard, commentController.reply);
router.post('/:postId/comment/:commentId/reply', [accessGuard(), reportBlockingGuard()], commentController.reply);

// router.post('/:postId/comment/:commentId/up-vote', accessGuard(), doubleRequestGuard, commentController.upVote);
router.post('/:postId/comment/:commentId/up-vote', accessGuard(), commentController.upVote);

// Promotion

router.put('/:postId/promotion', accessGuard(), promotionController.create);

router.put('/promotion/:promotionId/change_pause', accessGuard(), promotionController.pause);

router.get('/promotion/list/:type', accessGuard(), promotionController.getPromotions);

router.get('/promotion/action-buttons-list', accessGuard(), promotionController.getActionButtonsList);

router.get('/promotion/statistic/:promotionId', accessGuard(), promotionController.getStatistic);

router.get('/promotion/:promotionId', accessGuard(), promotionController.show);


router.patch('/promotion/:promotionId', accessGuard(), promotionController.update);

router.delete('/promotion/:promotionId', accessGuard(), promotionController.close);

module.exports = router;