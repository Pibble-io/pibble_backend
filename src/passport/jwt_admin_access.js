import { Strategy, ExtractJwt } from 'passport-jwt';
import { AdminUser } from '../models';
import config from '../config';

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: config.JWT_ADMIN_SECRET,
    passReqToCallback: true
};

const AdminAccessStrategy = new Strategy(options, async (request, { id, uuid, roles }, done) => {
    console.log('________________________________________');
    const { i18n } = request;
    try {
        const user = await AdminUser.findOne({
            where: { id, uuid }
        });
        if (!user || !user.id) {
            done({ message: i18n.__('User not found.'), code: 401 });
        }
        else {
            done(null, {user, roles});
        }
    }
    catch (error) {
        done(error);
    }
});

export default AdminAccessStrategy;