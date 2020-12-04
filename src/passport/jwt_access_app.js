import { Strategy, ExtractJwt } from 'passport-jwt';
import { GameApp, GameToken, User } from '../models';
import config from '../config';

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: config.JWT_3RD_PART_SECRET
};

const AppAccessStrategy = new Strategy(options, async ({ id, app_id, app_uuid }, done) => {
    try {
        const token = await GameToken.findOne({
            where: {
                user_id: id,
                game_app_id: app_id
            }
        });

        if (!token) {
            done({ message: 'Token not found.', code: 401 });
        }

        const app = await GameApp.findOne({
            where: { uuid: app_uuid, id: app_id },
        });

        if (!app) {
            done({ message: 'App not found.', code: 401 });
        }

        const user = await User.findOne({
            where: { id }
        });

        if (!user || !user.id) {
            done({ message: 'User not found.', code: 401 });
        }
        else if (user.is_banned) {
            done({ message: 'Maintenance in progress. Your account is locked.', code: 403 });
        }
        else {
            done(null, { app, user });
        }

    }
    catch (error) {
        done(error);
    }
});

export default AppAccessStrategy;