import express from 'express';
// import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import env from 'dotenv';
import cors from './utils/cors';
import i18n from 'i18n-2';
import routes from './routes/metric_server';
import passport from 'passport';
import LocalStrategy from './passport/local';
import AccessStrategy from './passport/jwt_access';
import RefreshStrategy from './passport/jwt_refresh';

import path from 'path';
import { pick } from 'lodash';
import * as Sentry from '@sentry/node';

env.config();
// if (process.env.NODE_ENV != 'test')
//     Sentry.init({ dsn: process.env.SENTRY_DSN });
const app = express();

// app.use(Sentry.Handlers.requestHandler());
app.use(logger('dev'));
// app.use(fileUpload());
app.use(express.json({ extended: true, limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));
app.use(cookieParser());

//localization
i18n.expressBind(app, {
    locales: ['en', 'ko'],
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

passport.use(LocalStrategy);

passport.use('jwt_access', AccessStrategy);
passport.use('jwt_refresh', RefreshStrategy);


routes.map(route => app.use(route.path, route.router));

// app.use(Sentry.Handlers.errorHandler());

app.use(function (error, request, response, next) {
    switch (error.name) {
        case 'SequelizeValidationError':
        case 'SequelizeUniqueConstraintError':
            response.status(422).send({
                messages: error.errors.map(error => {
                    if (Array.isArray(error.message)) {
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

module.exports = app;
