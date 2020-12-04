import { Strategy } from 'passport-local';
import { AdminUser } from '../models';
import { validateHash } from '../utils/hash';

const options = {
    usernameField: 'login',
    passReqToCallback: true
};

const AdminLocalStrategy = new Strategy(options, async (request, login, password, done) => {
    const { i18n } = request;
    let user;
    try {
        user = await AdminUser.findOne({
            where: {
                 email: login
            }
        });
        if (!user) {
            done({ message: i18n.__('User not found.') });
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

export default AdminLocalStrategy;