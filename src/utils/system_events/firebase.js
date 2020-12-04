import env from 'dotenv';
env.config();

import {
    DevicesToken,
    UsersSettings,
    User
} from '../../models';
import { SystemEventEmitter } from './';

var serviceAccount = require('../../config/firebase.json');
var admin = require('firebase-admin');

SystemEventEmitter.on('tag_follow', async function (user_from, post, tag) {
    try {
        const body = global.i18n.__('%s follow tag "%s" from your post', user_from.username, tag.tag);
        const sendTo = [post.user_id];
        const data = { id: post.id, type: 'post' };

        const tokens = await _getUsersTokensByIds(sendTo, ['allow_push_notification_followed']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('level_up', async function (user_from, level) {
    try {
        const body = global.i18n.__('%s`s  level up: "%s"', user_from.username, level.humanly);
        const data = { id: user_from.id, type: 'user', username: user_from.username };

        const tokens = await _getFollowersAndFriends(user_from, ['allow_push_notification_profile_level_up']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('started_new_promotion', async function (user_from, promotion) {
    try {
        const body = global.i18n.__('%s start a new promotion: "%sPIB"', user_from.username, promotion.budget);
        const data = { id: promotion.post_id, type: 'post' };

        const tokens = await _getFollowersAndFriends(user_from, ['allow_push_notification_new_promotion']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('update_profile_photo', async function (user_from, data = {}) {
    try {
        const body = global.i18n.__('%s updated profile: "photo"', user_from.username);
        const data = { id: user_from.id, type: 'user', username: user_from.username };

        const tokens = await _getFollowersAndFriends(user_from, ['allow_push_notification_profile_updated']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('update_profile_about_me', async function (user_from, data = {}) {
    try {
        const body = global.i18n.__('%s updated profile: "About me"', user_from.username);
        const data = { id: user_from.id, type: 'user', username: user_from.username };

        const tokens = await _getFollowersAndFriends(user_from, ['allow_push_notification_profile_updated']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('update_profile_wall', async function (user_from) {
    try {
        const body = global.i18n.__('%s updated profile: "wall"', user_from.username);
        const data = { id: user_from.id, type: 'user', username: user_from.username };

        const tokens = await _getFollowersAndFriends(user_from, ['allow_push_notification_profile_updated']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('first_post', async function (user_from, post) {
    try {
        const body = global.i18n.__('%s`s first post on Pibble', user_from.username);
        const data = { id: post.id, type: 'post' };

        const tokens = await _getFollowersAndFriends(user_from, ['allow_push_notification_created_first_post']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});
SystemEventEmitter.on('new_digital_goods_post', async function (user_from, post, commerce) {
    try {
        const body = global.i18n.__('%s posted digital goods: "%s"', user_from.username, commerce.name);
        const data = { id: post.id, type: 'post' };

        const tokens = await _getFollowersAndFriends(user_from, ['allow_push_notification_created_digital_post']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('new_goods_post', async function (user_from, post, goods) {
    try {
        const body = global.i18n.__('%s posted goods Item: "%s"', user_from.username, goods.title);
        const data = { id: post.id, type: 'post' };

        const tokens = await _getFollowersAndFriends(user_from, ['allow_push_notification_created_shop_post']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('new_post', async function (user_from, post) {
    try {
        const body = global.i18n.__('%s posted on Pibble.', user_from.username);
        const data = { id: post.id, type: 'post' };

        const tokens = await _getFollowersAndFriends(user_from, ['allow_push_notification_created_post']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('message_arrived', async function (user_from, message, sendTo) {
    try {
        const body = `${user_from.username}: "${message.message.text}"`;
        const data = { type: 'home' };

        const tokens = await _getUsersTokensByIds(sendTo, ['allow_push_notification_chat_new_message']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('system_message_arrived', async function (user_from, message, sendTo) {
    try {
        const body = `${user_from.username}: "${message.message.text}"`;
        const data = { id: message.room_id, type: 'room' };

        const tokens = await _getUsersTokensByIds(sendTo, ['allow_push_notification_chat_new_message']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('digital_goods_bought', async function (user_from, post, price) {
    try {

        const goods_title = (post && post.commerce) ? post.commerce.name : '';
        const body = global.i18n.__('%s purchase %s: "%sPIB"', user_from.username, goods_title, price);
        const sendTo = [post.user_id];
        const data = { id: post.id, type: 'post' };

        const tokens = await _getUsersTokensByIds(sendTo, ['allow_push_notification_chat_new_message']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('no_digital_goods_bought', async function (user_from, post, price) {
    try {

        const goods_title = (post && post.good) ? post.good.title : '';
        const body = global.i18n.__('%s purchase %s: "%sPIB"', user_from.username, goods_title, price);
        const sendTo = [post.user_id];
        const data = { id: post.id, type: 'post' };

        const tokens = await _getUsersTokensByIds(sendTo, ['allow_push_notification_chat_new_message']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('post_upvote', async function (user_from, target_user, post, value) {
    try {
        const body = global.i18n.__('%s upvoted your photo "%sBrush"', user_from.username, value);
        const sendTo = [target_user.id];
        const data = { id: post.id, type: 'post' };

        const tokens = await _getUsersTokensByIds(sendTo, ['allow_push_notification_upvoted_post']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('comment_upvote', async function (user_from, target_user, comment, value) {
    try {
        const body = global.i18n.__('%s upvoted your comment "%s": %sBrush', user_from.username, comment.body, value);
        const sendTo = [target_user.id];
        const data = { id: comment.entity_id, type: 'post' };

        const tokens = await _getUsersTokensByIds(sendTo, ['allow_push_notification_upvoted_comment']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('add_comment', async function (user_from, post, comment) {
    try {
        const body = global.i18n.__('%s commented "%s"', user_from.username, comment.body);
        const sendTo = [post.user_id];
        const data = { id: post.id, type: 'post' };

        const tokens = await _getUsersTokensByIds(sendTo, ['allow_push_notification_commented']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('add_to_favorites', async function (user_from, target_user, entity_id) {
    try {
        const body = global.i18n.__('%s saved your photo as favorites', user_from.username);
        const sendTo = [target_user.id];
        const data = { id: entity_id, type: 'post' };

        const tokens = await _getUsersTokensByIds(sendTo, ['allow_push_notification_followed']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('add_friend_request', async function (user_from, target_user) {
    try {
        const body = global.i18n.__('%s sent you a friend request', user_from.username);
        const sendTo = [target_user.id];
        const data = { id: user_from.id, type: 'user', username: user_from.username };

        const tokens = await _getUsersTokensByIds(sendTo, ['allow_push_notification_friend_request_arrived']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('accept_friend_request', async function (user_from, target_user) {
    try {
        const body = global.i18n.__('%s accepted your friend request', user_from.username);
        const sendTo = [target_user.id];
        const data = { id: user_from.id, type: 'user', username: user_from.username };

        const tokens = await _getUsersTokensByIds(sendTo, ['allow_push_notification_friend_request_accepted']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('add_follower', async function (user_from, target_user) {
    try {
        const body = global.i18n.__('%s started following you', user_from.username);
        const sendTo = [target_user.id];
        const data = { id: user_from.id, type: 'user', username: user_from.username };

        const tokens = await _getUsersTokensByIds(sendTo, ['allow_push_notification_new_follower']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

//Doesn`t use now
// SystemEventEmitter.on('join_promoution', async function (user_from, team) {
//     try {

//         const body = global.i18n.__('%s joined your promotion: "%s"', user_from.username, team.name);
//         const sendTo = [team.user_id];

//         const tokens = await _getUsersTokensByIds(sendTo, ['allow_push_notification_promotion_joined']);
//         _sendPushNotification(tokens, '', body);
//     } catch (err) {
//         console.log(err);
//     }
// });

SystemEventEmitter.on('new_funding', async function (user_from, campaign, post) {
    try {
        const body = global.i18n.__('%s start a funding: "%s"', user_from.username, campaign.hard_cap);
        const data = { id: post.id, type: 'post' };

        const tokens = await _getFollowersAndFriends(user_from, ['allow_push_notification_new_funding']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('new_charity_funding', async function (user_from, campaign, post) {
    try {
        const body = global.i18n.__('%s start a charity funding: "%s"', user_from.username, campaign.hard_cap);
        const data = { id: post.id, type: 'post' };

        const tokens = await _getFollowersAndFriends(user_from, ['allow_push_notification_new_charity_funding']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('contribute_charity', async function (user_from, value, post_id, user_to) {
    try {
        const data = { id: post_id, type: 'post' };
        const body = global.i18n.__('%s contributed your funding: "%sPIB"', user_from.username, value);
        const sendTo = [user_to.id];

        const tokens = await _getUsersTokensByIds(sendTo, ['allow_push_notification_funding_contributed']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('pasword_changed', async function (user) {
    try {
        const body = global.i18n.__('Login password changed');
        const data = { id: user.id, type: 'user', username: user.username };
        const sendTo = [user.id];

        const tokens = await _getUsersTokensByIds(sendTo, ['allow_push_notification_account_password_changed']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('username_changed', async function (user, old_username, username) {
    try {
        const body = global.i18n.__('Screen name changed: "%s"', old_username, username);
        const data = { id: user.id, type: 'user', username };

        const tokens = await _getFollowersAndFriends(user, ['allow_push_notification_account_username_changed']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('change_pincode', async function (user) {
    try {
        const body = global.i18n.__('Pin code changed');
        const data = { type: 'home' };
        const sendTo = [user.id];

        const tokens = await _getUsersTokensByIds(sendTo, ['allow_push_notification_wallet_pincode_changed']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('withdraw_ETH', async function (user_from, value) {
    try {
        const body = global.i18n.__('You sent ETH: "%s"', value);
        const data = { type: 'home' };
        const sendTo = [user_from.id];

        const tokens = await _getUsersTokensByIds(sendTo, ['allow_push_notification_wallet_withdraw']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('withdraw_PIB', async function (user_from, value) {
    try {
        const body = global.i18n.__('You sent PIB: "%s"', value);
        const data = { type: 'home' };
        const sendTo = [user_from.id];

        const tokens = await _getUsersTokensByIds(sendTo, ['allow_push_notification_wallet_withdraw']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('withdraw_BTC', async function (user_from, value) {
    try {
        const body = global.i18n.__('You sent BTC: "%s"', value);
        const data = { type: 'home' };
        const sendTo = [user_from.id];

        const tokens = await _getUsersTokensByIds(sendTo, ['allow_push_notification_wallet_withdraw']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('deposit_ETH', async function (user_from, target_user, value) {
    try {
        const body = global.i18n.__('You received ETH: "%s"', value);
        const data = { type: 'home' };
        const sendTo = [target_user.id];

        const tokens = await _getUsersTokensByIds(sendTo, ['allow_push_notification_wallet_deposit']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('deposit_PIB', async function (user_from, target_user, value) {
    try {
        const body = global.i18n.__('You received PIB: "%s"', value);
        const data = { type: 'home' };
        const sendTo = [target_user.id];

        const tokens = await _getUsersTokensByIds(sendTo, ['allow_push_notification_wallet_deposit']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('deposit_BTC', async function (user_from, target_user, value) {
    try {
        const body = global.i18n.__('You received BTC: "%s"', value);
        const data = { type: 'home' };
        const sendTo = [target_user.id];

        const tokens = await _getUsersTokensByIds(sendTo, ['allow_push_notification_wallet_deposit']);
        _sendPushNotification(tokens, '', body, data);
    } catch (err) {
        console.log(err);
    }
});

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://pibble-project.firebaseio.com'
});

async function _getFollowersAndFriends(user_from, permission_names) {

    //Check Notification Permissions
    let wherePermisionAllow = {
        allow_push_notification: true
    };
    permission_names.map(permission_name => wherePermisionAllow[`${permission_name}`] = 'friends_and_following');

    const followers = await user_from.getFollowing({
        attributes: ['id'],
        include: [
            {
                model: UsersSettings,
                as: 'usersSettings',
                attributes: permission_names,
                where: wherePermisionAllow
            }
        ]
    });

    const imFriend = await user_from.getImFriend({
        attributes: ['id'],
        include: [
            {
                model: UsersSettings,
                as: 'usersSettings',
                attributes: permission_names,
                where: wherePermisionAllow
            }
        ]
    });

    wherePermisionAllow = {
        allow_push_notification: true
    };
    permission_names.map(permission_name => wherePermisionAllow[`${permission_name}`] = 'everyone');
    const everyone = await User.findAll({
        attributes: ['id'],
        include: [
            {
                model: UsersSettings,
                as: 'usersSettings',
                attributes: permission_names,
                where: wherePermisionAllow
            }
        ]
    });

    const unique_users_ids = [...followers.map(u => u.id), ...imFriend.map(u => u.id), ...everyone.map(u => u.id)]
        .filter((value, index, self) => { return self.indexOf(value) === index; });

    const tokens = await DevicesToken.findAll({
        where: {
            user_id: unique_users_ids
        },
        raw: true
    });

    return tokens;
    // return tokens.map(t => t.token);
}


async function _getUsersTokensByIds(user_ids, permission_names) {
    if (!user_ids.length) {
        return [];
    }

    //Check Notification Permissions
    let wherePermisionAllow = {
        allow_push_notification: true
    };
    permission_names.map(permission_name => wherePermisionAllow[`${permission_name}`] = true);

    const tokens = await DevicesToken.findAll({
        where: {
            user_id: user_ids
        },
        include: [
            {
                model: User,
                attributes: ['id'],
                required: true,
                include:
                {
                    model: UsersSettings,
                    as: 'usersSettings',
                    attributes: permission_names,
                    where: wherePermisionAllow
                }
            },

        ]
    });
    return tokens;
    return tokens.map(t => t.token);
}


//All data-object values should be String
function _toString(o) {
    Object.keys(o).forEach(k => {
        if (typeof o[k] === 'object') {
            return toString(o[k]);
        }

        o[k] = '' + o[k];
    });

    return o;
}

async function _sendToAndroid(_tokens, message) {
    const tokens = [];
    _tokens.map(t => (t.platform === 'android') ? tokens.push(t.token) : null);
    if (tokens.length)
        admin.messaging().sendToDevice(tokens, message)
            .then((response) => {
                const tokensToRemove = [];
                response.results.forEach((result, index) => {
                    const error = result.error;
                    if (error) {
                        console.error('Failure sending notification to', tokens[index], error);
                        // Cleanup the tokens who are not registered anymore.
                        if (error.code === 'messaging/invalid-registration-token' ||
                            error.code === 'messaging/registration-token-not-registered') {
                            tokensToRemove.push(tokens[index]);
                        }
                    }
                });
                DevicesToken.destroy({ where: { token: tokensToRemove } });
                // Response is a message ID string.
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });
}

async function _sendToIOS(_tokens, message) {
    const tokens = [];

    _tokens.map(t => (t.platform === 'ios') ? tokens.push(t.token) : null);
    if (tokens.length)
        admin.messaging().sendToDevice(tokens, message)
            .then((response) => {
                const tokensToRemove = [];
                response.results.forEach((result, index) => {
                    const error = result.error;
                    if (error) {
                        console.error('Failure sending notification to', tokens[index], error);
                        // Cleanup the tokens who are not registered anymore.
                        if (error.code === 'messaging/invalid-registration-token' ||
                            error.code === 'messaging/registration-token-not-registered') {
                            tokensToRemove.push(tokens[index]);
                        }
                    }
                });
                DevicesToken.destroy({ where: { token: tokensToRemove } });
                // Response is a message ID string.
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });
}

async function _sendPushNotification(tokens, title, body, data = {}) {
    if (!tokens.length || process.env.SILENT_MODE == 'true') {
        return true;
    }

    var defaultData = {
        'title': title || '',
        'body': body || ''
    };
    data = Object.assign(defaultData, data);

    var ios_message = {
        'notification': {
            'title': title || '',
            'body': body || ''
        },
        data: _toString(data) || defaultData
    };

    var android_message = {
        data: _toString(data) || defaultData
    };

    // Send a message to the device corresponding to the provided
    // registration token.
    _sendToAndroid(tokens, android_message);
    _sendToIOS(tokens, ios_message);

}