import { Strategy, ExtractJwt } from 'passport-jwt';
import { User } from '../models';
import config from '../config';

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: config.JWT_ACCESS_SECRET,
    passReqToCallback: true
};

const AccessStrategy = new Strategy(options, async (request, { id, uuid }, done) => {
    const { i18n } = request;
    try {
        const user = await User.findOne({
            where: { id, uuid }
        });
        if (!user || !user.id) {
            done({ message: i18n.__('User not found.'), code: 401 });
        }
        else if (user.is_banned && request.originalUrl !== '/account/auth/sign-out') {
            done({ message: i18n.__('Maintenance in progress. Your account is locked.'), code: 403 });
        }
        else {
            done(null, user);
        }
    }
    catch (error) {
        done(error);
    }
});

export default AccessStrategy;