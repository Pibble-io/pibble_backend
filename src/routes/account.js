import {
    signInGuard,
    refreshGuard,
    accessGuard,
    signUpGuard,
    refreshSignUpGuard,
    versionControlGuard,
} from '../middlewares/guards';
import {
    uploader
} from '../middlewares/uploader';
import PromiseRouter from 'express-promise-router';
import {
    accountController,
    authController,
    settingsController,
    profileController,
    walletController,
    hybridWalletController,
    confirmationController
} from '../controllers';
import {
    promotionController
} from '../controllers/PromotionController';

import { withdrawLimit, doubleRequestGuard } from '../helpers/RateLimit';

const accessMiddleware = accessGuard();
const Router = PromiseRouter();

Router.post('/auth/sign-in', signInGuard(), authController.signIn);
Router.post('/auth/sign-up', doubleRequestGuard, authController.signUp);
Router.post('/auth/sign-out', accessGuard(), authController.signOut);

Router.post('/auth/refresh-tokens', refreshGuard(), authController.refreshTokens);
Router.post('/auth/refresh-sign-up-tokens', refreshSignUpGuard(), authController.refreshSignUpTokens);


Router.post('/auth/confirmation', authController.requestConfirmation);
Router.get('/auth/confirmation', authController.verifyConfirmation);
Router.post('/auth/password-restore', authController.restorePassword);


Router.post('/confirmation', signUpGuard(), confirmationController.send);
Router.get('/confirmation', signUpGuard(), confirmationController.verify);
Router.post('/create', signUpGuard(), accountController.create);

Router.use(accessMiddleware);

// Router.put('/phone', accountController.addPhone);
// Router.put('/email', accountController.addEmail);

Router.patch('/password', accountController.changePassword);
Router.patch('/email', accountController.changeEmail);
Router.patch('/phone', accountController.changePhone);
Router.patch('/username', accountController.changeUsername);

Router.get('/settings', settingsController.getSettings);
Router.patch('/settings', settingsController.updateSettings);

Router.get('/invite-friends', accountController.inviteFriends);

Router.get('/wallet', walletController.getWallet);
Router.get('/wallet/activity', walletController.getActivity);
Router.post('/wallet/transfer', walletController.transfer);
Router.get('/wallet/gasprice', hybridWalletController.gasPrice);
Router.post('/wallet/transferTxFee', hybridWalletController.transferTxFee);
Router.post('/wallet/sendRawTransaction', hybridWalletController.sendRawTransaction);
Router.get('/wallet/nonce/:address', hybridWalletController.getNonce);
Router.get('/wallet/blockchain/balance/:address', hybridWalletController.getBalance);
Router.post('/wallet/withdraw', withdrawLimit, walletController.withdraw);
Router.post('/wallet/exchange', doubleRequestGuard, walletController.exchange);
Router.get('/wallet/invoice', walletController.getInvoices);
Router.put('/wallet/invoice', walletController.createInvoiceRequest);
Router.post('/wallet/invoice/accept', doubleRequestGuard, walletController.acceptInvoiceRequest);
Router.post('/wallet/invoice/reject', doubleRequestGuard, walletController.rejectInvoiceRequest);
Router.get('/wallet/transactions', walletController.getTransactions);
Router.get('/wallet/balance',versionControlGuard({ android: '1.02', ios: '1.0' }), walletController.balance);
Router.put('/wallet/pin-code', walletController.addPinCode);
Router.patch('/wallet/pin-code', walletController.updatePinCode);
Router.post('/wallet/pin-code',versionControlGuard({ android: '1.02', ios: '1.0' }), walletController.checkPinCode);
Router.get('/wallet/recent-sent-transactions-users', walletController.recentSentTransactionsUsers);
Router.get('/wallet/exchange-rate', walletController.exchangeRate);
Router.post('/wallet/pin-code-restore', walletController.restorePinCode);

Router.get('/profile', profileController.getProfile);
Router.post('/profile', profileController.updateProfile);
Router.post('/profile/name', profileController.updateName);
Router.post('/profile/description', profileController.updateDescription);
Router.post('/profile/place', profileController.updatePlace);
Router.post('/profile/currency', profileController.updateCurrency);
Router.post('/profile/avatar', uploader.single('avatar'), profileController.updateAvatar);
Router.post('/profile/wall-cover', uploader.single('wall_cover'), profileController.updateWallCover);
Router.get('/profile/up-vote-limits', profileController.upVoteLimits);

// Router.put('/profile/promotion', promotionController.create);
// Router.get('/profile/promotion/:promotionId', promotionController.show);
// Router.patch('/profile/promotion/:promotionId', promotionController.update);
// Router.delete('/profile/promotion/:promotionId', promotionController.delete);

module.exports = Router;