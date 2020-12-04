import { Strategy, ExtractJwt } from 'passport-jwt';
import { RegistrationUser, User } from '../models';
import config from '../config';

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: config.JWT_SIGN_UP_SECRET,
    passReqToCallback: true
};

const SignUpStrategy = new Strategy(options, async (request, { id, uuid }, done) => {
    const { i18n } = request;
    try {
        const user = await RegistrationUser.findOne({
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

export default SignUpStrategy;