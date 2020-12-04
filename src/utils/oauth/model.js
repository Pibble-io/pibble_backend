import {
  User,
  OAuthClient,
  OAuthAccessToken,
  OAuthAuthorizationCode,
  OAuthRefreshToken,
  OAuthScope
} from '../../models';
import {validateHash} from "../hash";

module.exports.getClient = OAuthClient.getClient;
module.exports.getAccessToken = OAuthAccessToken.getAccessToken;
module.exports.saveToken = OAuthAccessToken.saveToken;
module.exports.revokeAuthorizationCode = OAuthAuthorizationCode.revokeAuthorizationCode;
module.exports.revokeToken = OAuthAuthorizationCode.revokeToken;
module.exports.getAuthorizationCode = OAuthAuthorizationCode.getAuthorizationCode;
module.exports.saveAuthorizationCode = OAuthAuthorizationCode.saveAuthorizationCode;
module.exports.getRefreshToken = OAuthRefreshToken.getRefreshToken;
module.exports.validateScope = OAuthScope.validateScope;
module.exports.verifyScope = OAuthScope.verifyScope;
module.exports.getUserFromClient = OAuthClient.getUserFromClient;
module.exports.getUser = async (username, password) => {
  try {
    const user = await User.findOne({
      where: { email: username },
      attributes: ['id', 'username', 'password_hash'],
    });

    return validateHash(password, user.password_hash) ? user.toJSON() : false;
  } catch (e) {
    // TODO: need be remove after testing
    console.log("getUser - Error: ", e)
  }
};
