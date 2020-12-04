import { Strategy, ExtractJwt } from 'passport-jwt';
import { GameApp } from '../models';
import config from '../config';

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: config.JWT_ACCESS_SECRET
};

const DevAccessStrategy = new Strategy(options, async ({ id }, done) => {
    try {
        const apps = await GameApp.findAll({
            where: { user_id: id },
            attributes: ['uuid'],
            raw: true
        });

        done(null, apps.map(item => item.uuid));
    }
    catch (error) {
        done(error);
    }
});

export default DevAccessStrategy;