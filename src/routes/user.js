import { accessGuard } from '../middlewares/guards';
import { userController } from '../controllers/UserController';
import { feedSettingsController } from '../controllers/FeedSettingsController';

const router = require('express-promise-router')();

router.get('/', accessGuard(), userController.getUsers);

router.get('/friendship-requests', accessGuard(), userController.friendshipRequests);

router.get('/muted-users', accessGuard(), userController.getMuted);

router.get('/:username', accessGuard(), userController.getUser);

router.get('/:username/friends', accessGuard(), userController.getFriends);

router.get('/:username/posts', accessGuard(), userController.getUserPosts);

router.get('/:username/winners-posts', accessGuard(), userController.getWinsPosts);

router.get('/:username/up-voted-posts', accessGuard(), userController.getUserUpVotedPosts);

router.get('/:username/up-voted-users-posts', accessGuard(), userController.getUsersUpvotedPosts);

router.get('/:username/brush-rewards-history', accessGuard(), userController.getBrushRewardsHistory);

router.get('/:username/following', accessGuard(), userController.getFollowing);

router.get('/:username/followers', accessGuard(), userController.getFollowers);

router.post('/:username/follow', accessGuard(), userController.addNewFollow);

router.post('/:username/unfollow', accessGuard(), userController.cancelFollowing);

router.post('/:username/friendship/request', accessGuard(), userController.makeFriends);

router.post('/:username/friendship/accept', accessGuard(), userController.acceptFriendship);

router.post('/:username/friendship/reject', accessGuard(), userController.rejectFriendship);

router.post('/:username/friendship/cancel', accessGuard(), userController.cancelFriendship);

router.post('/:username/up-vote', accessGuard(), userController.upVote);

router.delete('/close-account', accessGuard(), userController.closeAccount);

router.post('/:userId/feed/settings', accessGuard(), feedSettingsController.set);



module.exports = router;