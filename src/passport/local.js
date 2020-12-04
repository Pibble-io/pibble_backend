import { Strategy } from 'passport-local';
import { User } from '../models';
import { errorResponse } from '../utils/responses';
import { validateHash } from '../utils/hash';
import { cleanUpPhone } from '../utils/format';
import { Op } from 'sequelize';

const options = {
    usernameField: 'login',
    passReqToCallback: true
};

const LocalStrategy = new Strategy(options, async (request, login, password, done) => {
    const { i18n } = request;
    let user;
    try {
        user = await User.findOne({
            where: {
                [Op.or]: [{ email: login }, { ccphone: cleanUpPhone(login) }]
            }
        });
        if (!user) {
            done({ message: i18n.__('User not found.') });
        }
        else if (!user.email_verified_at || !user.phone_verified_at) {
            return errorResponse(response, { message: i18n.__('Your account is not verified. Please login again with your account for verifying.') }, 404);
        }
        else if (user.is_banned) {
            done({ message: i18n.__('Maintenance in progress. Your account is locked.'), code: 403 });
        }
        else if (validateHash(password, user.password_hash)) {
            done(null, user);
        }
        else {
            done({ message: i18n.__('Incorrect password.') });
        }
    }
    catch (error) {
        console.log(error);
    }
});

export default LocalStrategy;