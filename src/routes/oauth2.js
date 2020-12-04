import OAuthServer from 'express-oauth-server';
import { oauth2Controller, authController } from '../controllers';
import _ from 'lodash';
import OAuthModel from '../utils/oauth/model';
import { oauthTokenGuard } from '../middlewares/guards';


const router = require('express-promise-router')();
const oauth = new OAuthServer({ model: OAuthModel, debug: true, continueMiddleware: true });

let authenticateHandler = {
  handle: function (request, response) {
    return request.user;
  }
};

router.get('/authorize/:type', [oauthTokenGuard(), oauth.authorize({ authenticateHandler })]);
router.post('/token', oauth.token());

//email/password Auth
router.get('/login', oauth2Controller.getLogin);
router.post('/login', oauth2Controller.postLogin);

//email auth
router.get('/email-login', oauth2Controller.getEmailLogin);
router.post('/email-login', oauth2Controller.postEmailLogin);
router.get('/verify-email', oauth2Controller.getVerifyEmail);
router.post('/verify-email', oauth2Controller.postVerifyEmail);

//phone auth
router.get('/phone-login', oauth2Controller.getPhoneLogin);
router.post('/phone-login', oauth2Controller.postPhoneLogin);
router.get('/verify-phone', oauth2Controller.getVerifyPhone);
router.post('/verify-phone', oauth2Controller.postVerifyPhone);



router.get('/secure', oauth.authenticate({ scope: ['profile','test'] }), oauth2Controller.secure);

module.exports = router;
