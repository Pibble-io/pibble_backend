import express from 'express';
// import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import env from 'dotenv';
import cors from './utils/cors';
import expressLayouts from 'express-ejs-layouts';
import i18n from 'i18n-2';
import routes from './routes';
import passport from 'passport';
import AdminLocalStrategy from './passport/admin_local';
import LocalStrategy from './passport/local';
import AdminAccessStrategy from './passport/jwt_admin_access';
import AdminRefreshStrategy from './passport/jwt_admin_refresh';

import AccessStrategy from './passport/jwt_access';
import RefreshStrategy from './passport/jwt_refresh';
import OAuthAccessStrategy from './passport/jwt_access_oauth';
import DevAccessStrategy from './passport/jwt_access_dev';
import AppAccessStrategy from './passport/jwt_access_app';
import UrlAccessStrategy from './passport/jwt_access_url';
import SignUpStrategy from './passport/jwt_sign_up';
import SignUpRefreshStrategy from './passport/jwt_sign_up_refresh';

import path from 'path';
import { pick } from 'lodash';
import BitcoinMonitor from './bitcoin/monitor';
import { ChatServer } from './chat';
import * as Sentry from '@sentry/node';

env.config();
if (process.env.NODE_ENV != 'test')
    Sentry.init({ dsn: process.env.SENTRY_DSN });
const app = express();

app.use(Sentry.Handlers.requestHandler());
app.use(logger('dev'));
// app.use(fileUpload());
app.use(express.json({ extended: true, limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));
app.use(cookieParser());

//localization
i18n.expressBind(app, {
    locales: ['en','ko'],
    cookieName: 'locale',
    directory: path.join(__dirname, '/utils/locales'),
    extension: '.json'
});
app.use(function (req, res, next) {
    req.i18n.setLocaleFromCookie();
    global.i18n = req.i18n;
    next();
});

app.use(cors);

app.use(passport.initialize());

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

passport.use(LocalStrategy);

passport.use('admin_local',AdminLocalStrategy);
passport.use('jwt_admin_access',AdminAccessStrategy);
passport.use('jwt_admin_refresh',AdminRefreshStrategy);

passport.use('jwt_sign_up', SignUpStrategy);
passport.use('jwt_sign_up_refresh', SignUpRefreshStrategy);
passport.use('jwt_access', AccessStrategy);
passport.use('jwt_refresh', RefreshStrategy);
passport.use('jwt_access_dev', DevAccessStrategy);
passport.use('jwt_access_app', AppAccessStrategy);
passport.use('jwt_access_oauth', OAuthAccessStrategy);
passport.use('jwt_access_url', UrlAccessStrategy);


routes.map(route => app.use(route.path, route.router));

app.use(Sentry.Handlers.errorHandler());

ChatServer.listen(process.env.SOCKET_IO_PORT, function (err) {
    if (err) throw err;
    console.log(`Chat socket listening on port ${process.env.SOCKET_IO_PORT}`);
});

app.use(function (error, request, response, next) {
    switch (error.name) {
        case 'SequelizeValidationError':
        case 'SequelizeUniqueConstraintError':
            response.status(422).send({
                messages: error.errors.map(error => {
                    if (Array.isArray(error.message)) {
                        error.message = request.i18n.__(...error.message);
                    }else{
                        error.message = request.i18n.__(error.message);
                    }
                    return pick(error, ['message', 'path', 'value', 'type', 'validatorKey']);
                })
            });
            break;

        default: {
            console.error(error);
            response.status(500).send({
                name: error.name,
                message: Array.isArray(error.message) ? error.message : error.message.split('\n'),
                stack: error.stack.split('\n')
            });
        }
    }
});

BitcoinMonitor();

module.exports = app;
