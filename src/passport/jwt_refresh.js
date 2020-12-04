import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersTokens } from '../models';
import config from '../config';

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: config.JWT_REFRESH_SECRET,
    passReqToCallback: true
};

const RefreshStrategy = new Strategy(options, async (request, { user_id, user_agent }, done) => {
    const { i18n } = request;
    try {
        if (request.headers['user-agent'] !== user_agent) {
            return done({ message: i18n.__('Token invalid.'), code: 401 });
        }

        const refresh_token = options.jwtFromRequest(request);

        const userTokenInfo = await UsersTokens.findOne({
            where: { user_id, user_agent, refresh_token },
            include: ['user']
        });

        if (!userTokenInfo) {
            done({ message: i18n.__('Token not found.'), code: 401 });
        }
        else if (!userTokenInfo.user || userTokenInfo.user.is_banned) {
            done({ message: i18n.__('You are banned.'), code: 403 });
        }
        else {
            done(null, userTokenInfo.user);
        }
    }
    catch (error) {
        done(error);
    }
});

export default RefreshStrategy;