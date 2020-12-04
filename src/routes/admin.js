import {
    authController,
    postController,
    userController,
    reportController,
    challengeController
} from '../controllers/admin';
import { adminSignInGuard, adminAccessGuard } from '../middlewares/guards';
import PromiseRouter from 'express-promise-router';

const Router = PromiseRouter();

Router.post('/auth/sign-in', adminSignInGuard(), authController.signIn);
Router.post('/auth/change_password', adminAccessGuard(['super_admin']), authController.changePassword);
Router.post('/account/make-admin', adminAccessGuard(['super_admin']), authController.makeAccountAsAdmin);
Router.delete('/account', adminAccessGuard(['super_admin']), authController.destroyAdmin);


Router.delete('/post', adminAccessGuard(), postController.destroy);

Router.patch('/user/post/restrict', adminAccessGuard(), userController.restrictPost);
Router.patch('/user/wallet/restrict', adminAccessGuard(), userController.restrictWallet);
Router.patch('/user/post/un-restrict', adminAccessGuard(), userController.unrestrictPost);
Router.patch('/user/wallet/un-restrict', adminAccessGuard(), userController.unrestrictWallet);
Router.get('/user/restricted-list', adminAccessGuard(), userController.restrictedList);

Router.patch('/user/ban', adminAccessGuard(), userController.ban);
Router.patch('/user/unban', adminAccessGuard(), userController.unban);
Router.get('/user/banned-list', adminAccessGuard(), userController.bannedList);

Router.get('/report/blocked', adminAccessGuard(), reportController.blockedReportList);
Router.get('/report/inappropriate/', adminAccessGuard(), reportController.inappropriateReportList);

Router.post('/challenge/challange_10min', adminSignInGuard(), challengeController.tenMinutesChallengeSwitch);
Router.post('/challenge/challange_hourly', adminSignInGuard(), challengeController.hourlyChallengeSwitch);
Router.post('/challenge/challange_daily', adminSignInGuard(), challengeController.dailyChallengeSwitch);
module.exports = Router;