import { asyncRoute } from '../utils/routing';
import { User, EmailConfirmation, sequelize, PhoneConfirmation, RegistrationPhoneConfirmation, RegistrationEmailConfirmation, Media, UsersTokens } from '../models';
import { sesSendEmail, snsSendSms, s3ListObjectVersions, s3RemoveTagging } from '../utils/aws';
import { accessGuard } from "../middlewares/guards";
import { SystemEventEmitter } from '../utils/system_events';
import { Op } from 'sequelize';
import crypto from 'crypto';


import { successResponse } from '../utils/responses';
import jwt from "jsonwebtoken";
import config from "../config";

const router = require('express-promise-router')();

const dotenv = require('dotenv');
dotenv.config();
if (process.env.NODE_ENV == 'development') {

    router.all('/', asyncRoute(async (request, response) => {

        const user1 = await User.findById(1, {
            include: 'followers'
        });

        const user2 = await User.findById(2, {
            include: 'following'
        });

        successResponse(response, { user1, user2 });

    }));

    router.post('/firebase', accessGuard(), asyncRoute(async (request, response) => {
        const { user, body: data, i18n } = request;

        SystemEventEmitter.emit(data.event, user, ...data.params);

        successResponse(response, { });
    }));

    router.get('/codes', asyncRoute(async (request, response) => {
        const phoneVerifications = await RegistrationPhoneConfirmation.findAll({
            limit: 3,
            order: [
                ['id', 'DESC']
            ]
        });

        const emailVerifications = await RegistrationEmailConfirmation.findAll({
            limit: 3,
            order: [
                ['id', 'DESC']
            ]
        });

        const phoneRecover = await PhoneConfirmation.findAll({
            limit: 3,
            order: [
                ['id', 'DESC']
            ]
        });

        const emailRecover = await EmailConfirmation.findAll({
            limit: 3,
            order: [
                ['id', 'DESC']
            ]
        });

        successResponse(response, {
            registration_phone: phoneVerifications,
            registration_email: emailVerifications,
            recover_email: emailRecover,
            recover_phone: phoneRecover
        });
    }));

    router.get('/s3/revert', asyncRoute(async (request, response) => {
        const media = await Media.all({
            where: {
                // processed: false,
                created_at: { [Op.gte]: sequelize.literal('DATE_SUB(CURDATE(), INTERVAL 5 DAY)') },
                error: null
                // [Op.or]: [
                //     {
                //         error: 'MethodNotAllowed'
                //     }
                // ]
            }
        });
        let reverted = [];
        let result;
        let i = 0;
        if (media) {
            await Promise.all(media.map(async mediaItem => {
                // for (let mediaItem of media) {
                console.log('===============', i++, mediaItem.id)
                result = false;
                try {
                    result = await s3ListObjectVersions(mediaItem.s3Key_poster);

                    if (result) {
                        console.log('reverted')
                        await s3RemoveTagging(mediaItem.s3Key);

                        if (mediaItem.s3Key_thumbnail) {
                            result = await s3ListObjectVersions(mediaItem.s3Key_thumbnail);
                            await s3RemoveTagging(mediaItem.s3Key_thumbnail);
                        }
                        if (mediaItem.s3Key_poster) {
                            result = await s3ListObjectVersions(mediaItem.s3Key_poster);
                            await s3RemoveTagging(mediaItem.s3Key_poster);
                        }
                        reverted.push(mediaItem.s3Key);
                        // await mediaItem.update({ processed: true, error: null });
                    }

                } catch (error) {
                    console.log(error)
                    // if (error.code)
                    //     await mediaItem.update({ processed: false, error: error.code });
                }
            }));
        }
        console.log({ reverted, length: media.length });

        successResponse(response, { reverted, length: media.length });
    }));

    router.get('/:id/token-expire-time', asyncRoute(async (request, response) => {
        const { params: { id } } = request;
        const user = await User.findById(id);

        const userTokenData = await UsersTokens.findOne({
            where: {
                user_id: user.id,
                user_agent_hash: crypto.createHash('md5').update(request.headers['user-agent']).digest('hex')
            }
        });

        const tokenData = jwt.verify(userTokenData.token, config.JWT_SECRET);

        successResponse(response, tokenData);
    }));

}
module.exports = router;