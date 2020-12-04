import passport from 'passport';
import util from 'util';
import { errorResponse } from '../utils/responses';
import { GameApp } from '../models';


export const signUpGuard = () => (request, response, next) => {
    return passport.authenticate('jwt_sign_up', { session: false }, function (error, user, info) {
        if (info && info.expiredAt) {
            return errorResponse(response, info, 401);
        }

        if (info) {
            return errorResponse(response, info, 422);
        }

        if (error) {
            if (error.code && error.code === 404) {
                return errorResponse(response, error, 401);
            }
            else {
                return errorResponse(response, error, 500);
            }
        }

        request.user = user;

        return next();
    })(request, response, next);
};

export const refreshSignUpGuard = () => (request, response, next) => {
    return passport.authenticate('jwt_sign_up_refresh', { session: false }, function (error, user, info) {
        if (info && info.expiredAt) {
            return errorResponse(response, info, 401);
        }

        if (info) {
            return errorResponse(response, info, 422);
        }

        if (error) {
            if (error.code && error.code === 404) {
                return errorResponse(response, error, 401);
            }
            else {
                return errorResponse(response, error, 500);
            }
        }

        request.user = user;

        return next();
    })(request, response, next);
};


export const accessGuard = () => (request, response, next) => {
    return passport.authenticate('jwt_access', { session: false }, function (error, user, info) {
        if (info && info.expiredAt) {
            return errorResponse(response, info, 401);
        }

        if (info) {
            return errorResponse(response, info, 422);
        }

        if (error) {
            if (error.code && error.code === 404) {
                return errorResponse(response, error, 401);
            }
            else {
                return errorResponse(response, error, 500);
            }
        }

        request.user = user;

        return next();
    })(request, response, next);
};

export const reportBlockingGuard = () => (request, response, next) => {
    return passport.authenticate('jwt_access', { session: false }, function (error, user, info) {

        let left_hr, left_min = 0;
        const now = new Date();
        left_hr = Math.floor((user.report_end_of_restriction_time - now) / 3600000);
        left_min = parseInt(((user.report_end_of_restriction_time - now) - (left_hr * 3600000)) / 60000);

        const left_time = (left_hr >= 1) ? `${left_hr} hr(s)` : `${left_min} min(s)`;

        if (user.report_end_of_restriction_time > now) {
            return errorResponse(response, {
                message: `Your account has been temporarily blocked from this action. This block will expire in ${left_time}. Tell us if you think we made a mistake. `
            }, 422);
        }

        return next();
    })(request, response, next);
};

export const urlAccessGuard = () => (request, response, next) => {
    return passport.authenticate('jwt_access_url', { session: false }, function (error, user, info) {
        if (info && info.expiredAt) {
            return errorResponse(response, info, 401);
        }

        if (info) {
            return errorResponse(response, info, 422);
        }

        if (error) {
            if (error.code && error.code === 404) {
                return errorResponse(response, error, 401);
            }
            else {
                return errorResponse(response, error, 500);
            }
        }

        request.user = user;

        return next();
    })(request, response, next);
};

export const devAccessGuard = () => (request, response, next) => {
    return passport.authenticate('jwt_access_dev', { session: false }, async function (error, apps, info) {
        const { params: { app_uuid } } = request;

        if (app_uuid && !apps.includes(app_uuid)) {
            return errorResponse(response, { message: 'No data' }, 404)
        } else {
            const app = await GameApp.findOne({
                where: {
                    uuid: app_uuid
                }
            });

            request.gameApp = app;
        }

        if (info && info.expiredAt) {
            return errorResponse(response, info, 401);
        }

        if (info) {
            return errorResponse(response, info, 422);
        }

        if (error) {
            if (error.code && error.code === 404) {
                return errorResponse(response, error, 401);
            }
            else {
                return errorResponse(response, error, 500);
            }
        }

        request.apps = apps;

        return next();
    })(request, response, next);
};

export const appAccessGuard = () => (request, response, next) => {
    return passport.authenticate('jwt_access_app', { session: false }, function (error, data, info) {
        if (info) {
            return errorResponse(response, info, 422);
        }

        if (error) {
            if (error.code && error.code === 404) {
                return errorResponse(response, error, 401);
            }
            else {
                return errorResponse(response, error, 500);
            }
        }

        request.gameApp = data.app;
        request.user = data.user;

        return next();
    })(request, response, next);
};


export const refreshGuard = () => (request, response, next) => {
    return passport.authenticate('jwt_refresh', { session: false }, function (error, user, info) {
        if (info && info.expiredAt) {
            return errorResponse(response, info, 401);
        }

        if (info) {
            return errorResponse(response, info, 422);
        }

        if (error) {
            if (error.code && error.code === 404) {
                return errorResponse(response, error, 401);
            }
            else {
                return errorResponse(response, error, 500);
            }
        }

        request.user = user;

        return next();
    })(request, response, next);
};

export const signInGuard = () => (request, response, next) => {
    passport.authenticate('local', async function (error, user, info) {
        if (error) {
            return errorResponse(response, error, 422);
        } else {
            request.user = user;

            return next();
        }
    })(request, response, next);
};

export const adminSignInGuard = () => (request, response, next) => {
    passport.authenticate('admin_local', async function (error, user, info) {
        if (error) {
            return errorResponse(response, error, 422);
        } else {
            request.user = user;

            return next();
        }
    })(request, response, next);
};

export const adminAccessGuard = (allowRoles = null) => (request, response, next) => {
    return passport.authenticate('jwt_admin_access', { session: false }, function (error, data, info) {
        const { user, roles } = data;

        if (info && info.expiredAt) {
            return errorResponse(response, info, 401);
        }

        if (info) {
            return errorResponse(response, info, 422);
        }

        if (error) {
            if (error.code && error.code === 404) {
                return errorResponse(response, error, 401);
            }
            else {
                return errorResponse(response, error, 500);
            }
        }

        if (allowRoles) {
            allowRoles.push('super_admin');
            if (!roles.some(role => allowRoles.indexOf(role) >= 0)) {
                return errorResponse(response, { message: 'You don`t have access', code: 401 }, 401);
            }
        }

        request.user = user;

        return next();
    })(request, response, next);
};

export const oauthTokenGuard = () => (request, response, next) => {
    const { params: { type } } = request;

    return passport.authenticate('jwt_access_oauth', { session: false }, function (error, user, info) {

        if (!user || !user.id) {
            switch (type) {
                case 'email':
                    response.redirect(util.format('/oauth2/email-login?client_id=%s&redirect_uri=%s&scope=%s&response_type=%s&state=%s', request.query.client_id, request.query.redirect_uri, request.query.scope, request.query.response_type, request.query.state));
                    break;
                case 'phone':
                    response.redirect(util.format('/oauth2/phone-login?client_id=%s&redirect_uri=%s&scope=%s&response_type=%s&state=%s', request.query.client_id, request.query.redirect_uri, request.query.scope, request.query.response_type, request.query.state));
                    break;

                default:
                    response.redirect(util.format('/oauth2/login?client_id=%s&redirect_uri=%s&scope=%s&response_type=%s&state=%s', request.query.client_id, request.query.redirect_uri, request.query.scope, request.query.response_type, request.query.state));
                    break;
            }
        } else {
            request.user = user;

            return next();
        }
    })(request, response, next);
};
export const oauthGuard = () => (request, response, next) => {
    request.user = response.locals.oauth.token.user;
    request.client = response.locals.oauth.token.client;
    return next();
};

export const versionControlGuard = (minVersion) => (request, response, next) => {
    const { headers: { 'app-version': app_version }, i18n } = request;

    if (!app_version) {
        // return next();
        return errorResponse(response, {
            message: i18n.__('Pibble app has been updated to the new version. This update has an important item so that you must update to continue using. Please update Pibble app now.')
        }, 423);
    }

    function compareVersion(v1, v2) {
        if (typeof v1 !== 'string') return false;
        if (typeof v2 !== 'string') return false;
        v1 = v1.split('.');
        v2 = v2.split('.');
        const k = Math.min(v1.length, v2.length);
        for (let i = 0; i < k; ++i) {
            v1[i] = parseInt(v1[i], 10);
            v2[i] = parseInt(v2[i], 10);
            if (v1[i] > v2[i]) return 1;
            if (v1[i] < v2[i]) return -1;
        }
        return v1.length == v2.length ? 0 : (v1.length < v2.length ? -1 : 1);
    }

    const allowClients = ['ios', 'android'];


    const app_version_array = app_version.split('/');
    const appOS = app_version_array[0].toLowerCase();
    const appVersion = app_version_array[1]

    if (app_version_array.length !== 2 || allowClients.indexOf(appOS) < 0) {
        return errorResponse(response, {
            message: i18n.__('Pibble app has been updated to the new version. This update has an important item so that you must update to continue using. Please update Pibble app now.')
        }, 423);
    }

    if (compareVersion(appVersion, minVersion[appOS] || -1) < 0 && appOS != 'android') {
        return errorResponse(response, {
            message: i18n.__('Pibble app has been updated to the new version. This update has an important item so that you must update to continue using. Please update Pibble app now.')
        }, 423);
    }
    return next();
};