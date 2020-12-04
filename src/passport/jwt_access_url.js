import { Strategy, ExtractJwt } from 'passport-jwt';
import { User } from '../models';
import config from '../config';

const options = {
    jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
    ignoreExpiration: false,
    secretOrKey: config.JWT_ACCESS_SECRET
};

const UrlAccessStrategy = new Strategy(options, async ({ id, uuid }, done) => {
    try {
        const user = await User.findOne({
            where: { id, uuid }
        });

        if (!user || !user.id) {
            done({ message: 'User not found.', code: 401 });
        }
        else if (user.is_banned) {
            done({ message: 'Maintenance in progress. Your account is locked.', code: 403 });
        }
        else {
            done(null, user);
        }
    }
    catch (error) {
        done(error);
    }
});

export default UrlAccessStrategy;