
import { appController, objectController, authController, requestController, profileController, userController, assetController } from '../controllers';
import { accessGuard, devAccessGuard, appAccessGuard } from '../middlewares/guards';

const router = require('express-promise-router')();

//Apps
router.get('/', [accessGuard()], appController.list);
router.post('/', [accessGuard()], appController.create);
router.patch('/:app_uuid', [accessGuard(), devAccessGuard()], appController.update);
router.delete('/', [accessGuard()], appController.destroy);

//Objects
router.get('/:app_uuid/object', [accessGuard(), devAccessGuard()], objectController.list);
router.post('/:app_uuid/object', [accessGuard(), devAccessGuard()], objectController.create);
router.patch('/:app_uuid/object/:uuid', [accessGuard(), devAccessGuard()], objectController.update);
router.delete('/:app_uuid/object', [accessGuard(), devAccessGuard()], objectController.destroy);

//Auth
router.post('/auth/request-code', authController.requestConfirmation);
router.get('/auth/send-code', authController.appVerifyCode);

//Requests
router.post('/request/', appAccessGuard(), requestController.create);
router.get('/request/:action_type', appAccessGuard(), requestController.list);
router.post('/request/:id/accept', appAccessGuard(), requestController.accept);
router.post('/request/:id/deny', appAccessGuard(), requestController.deny);
router.delete('/request/', appAccessGuard(), requestController.destroy);

//ME
router.get('/me/picture', appAccessGuard(), profileController.getAvatar);
router.get('/:id/picture', profileController.getAvatar);
router.get('/me/profile', appAccessGuard(), profileController.getShortProfile);
router.get('/me/friends', appAccessGuard(), userController.getFriendsShort);
router.get('/me/followers', appAccessGuard(), userController.getFollowersShort);
router.get('/me/requests/:action_type?', appAccessGuard(), requestController.list);

//Exchange and Assets
router.post('/assetrequest/exchange', appAccessGuard(), assetController.exchange);
router.get('/asset', appAccessGuard(), assetController.list);
router.get('/asset/exchange_rate', appAccessGuard(), assetController.exchange_rate);


module.exports = router;