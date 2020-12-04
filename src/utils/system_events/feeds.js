import { SystemEventEmitter } from './';
import {
    DevicesToken,
    UsersSettings,
    User,
    Feeds
} from '../../models';

SystemEventEmitter.on('tag_follow', async function (user_from, post, tag) {
    try {
        const db_data = {
            type: 'tag_follow',
            message_data: ['%s follow tag \"%s\" from <-!your!-> post', user_from.username, tag.tag],
            emitter_id: user_from.id,
            target_id: post.user_id,
            entity_type: 'post',
            entity_id: post.id
        };
        Feeds.create(db_data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('level_up', async function (user_from, level) {
    try {
        const db_data = {
            type: 'level_up',
            message_data: ['%s`s  level up: "%s"', user_from.username, user_from.level_id],
            emitter_id: user_from.id,
            entity_type: 'user',
            entity_id: user_from.id
        };
        Feeds.create(db_data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('started_new_promotion', async function (user_from, promotion) {
    try {
        const db_data = {
            type: 'started_new_promotion',
            message_data: ['%s start a new promotion: "%sPIB"', user_from.username, promotion.budget],
            emitter_id: user_from.id,
            entity_type: 'post',
            entity_id: promotion.post_id
        };
        Feeds.create(db_data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('update_profile_photo', async function (user_from) {
    try {
        const db_data = {
            type: 'update_profile_photo',
            message_data: ['%s updated profile: "photo"', user_from.username],
            emitter_id: user_from.id,
            entity_type: 'user',
            entity_id: user_from.id
        };
        Feeds.create(db_data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('update_profile_about_me', async function (user_from) {
    try {
        const db_data = {
            type: 'update_profile_about_me',
            message_data: ['%s updated profile: "About me"', user_from.username],
            emitter_id: user_from.id,
            entity_type: 'user',
            entity_id: user_from.id
        };
        Feeds.create(db_data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('update_profile_wall', async function (user_from) {
    try {
        const db_data = {
            type: 'update_profile_wall',
            message_data: ['%s updated profile: "wall"', user_from.username],
            emitter_id: user_from.id,
            entity_type: 'user',
            entity_id: user_from.id
        };
        Feeds.create(db_data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('first_post', async function (user_from, post) {
    try {
        const db_data = {
            type: 'first_post',
            message_data: ['%s`s first post on Pibble', user_from.username],
            emitter_id: user_from.id,
            entity_type: 'post',
            entity_id: post.id
        };
        Feeds.create(db_data);
    } catch (err) {
        console.log(err);
    }
});
SystemEventEmitter.on('new_digital_goods_post', async function (user_from, post, commerce) {
    try {
        const db_data = {
            type: 'new_digital_goods_post',
            message_data: ['%s posted digital goods: "%s"', user_from.username, commerce.name],
            emitter_id: user_from.id,
            entity_type: 'post',
            entity_id: post.id
        };
        Feeds.create(db_data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('new_post', async function (user_from, post) {
    try {
        const db_data = {
            type: 'new_post',
            message_data: ['%s posted on Pibble.', user_from.username],
            emitter_id: user_from.id,
            entity_type: 'post',
            entity_id: post.id
        };
        Feeds.create(db_data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('message_arrived', async function (data) {
    try {
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('system_message_arrived', async function (user_from, message) {
    try {
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('digital_goods_bought', async function (user_from, post, price) {
    try {

        const goods_title = (post && post.commerce) ? post.commerce.name : '';
        const db_data = {
            type: 'digital_goods_bought',
            message_data: ['%s purchase %s: "%sPIB"', user_from.username, goods_title, price],
            emitter_id: user_from.id,
            target_id: post.user_id,
            entity_type: 'post',
            entity_id: post.id
        };
        Feeds.create(db_data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('post_upvote', async function (user_from, target_user, post, value) {
    try {
        const db_data = {
            type: 'post_upvote',
            message_data: ['%s upvoted <-!your!-> photo "%sBrush"', user_from.username, value],
            emitter_id: user_from.id,
            target_id: target_user.id,
            entity_type: 'post',
            entity_id: post.id
        };
        Feeds.create(db_data);

    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('comment_upvote', async function (user_from, target_user, comment, value) {
    try {
        const db_data = {
            type: 'comment_upvote',
            message_data: ['%s upvoted <-!your!-> comment "%s": %sBrush', user_from.username, comment.body, value],
            emitter_id: user_from.id,
            target_id: target_user.id,
            entity_type: 'post',
            entity_id: comment.entity_id
        };
        Feeds.create(db_data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('add_comment', async function (user_from, post, comment) {
    try {

        const db_data = {
            type: 'add_comment',
            message_data: ['%s commented "%s"', user_from.username, comment.body],
            emitter_id: user_from.id,
            target_id: post.user_id,
            entity_type: 'post',
            entity_id: post.id
        };
        Feeds.create(db_data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('add_to_favorites', async function (user_from, target_user, entity_id) {
    try {
        const db_data = {
            type: 'add_to_favorites',
            message_data: ['%s saved <-!your!-> photo as favorites', user_from.username],
            emitter_id: user_from.id,
            target_id: target_user.id,
            entity_type: 'post',
            entity_id
        };
        Feeds.create(db_data);

    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('add_friend_request', async function (user_from, target_user) {
    try {
        const db_data = {
            type: 'add_friend_request',
            message_data: ['%s sent <-!you!-> a friend request', user_from.username],
            emitter_id: user_from.id,
            target_id: target_user.id,
        };
        Feeds.create(db_data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('accept_friend_request', async function (user_from, target_user) {
    try {
        const db_data = {
            type: 'accept_friend_request',
            message_data: ['%s accepted <-!your!-> friend request', user_from.username],
            emitter_id: user_from.id,
            target_id: target_user.id,
        };
        Feeds.create(db_data);

    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('add_follower', async function (user_from, target_user) {
    try {
        const db_data = {
            type: 'add_follower',
            message_data: ['%s started following <-!you!->', user_from.username],
            emitter_id: user_from.id,
            target_id: target_user.id,
        };
        Feeds.create(db_data);
    } catch (err) {
        console.log(err);
    }
});

//Doesn`t use now
// SystemEventEmitter.on('join_promoution', async function (user_from, team) {
//     try {
//         const db_data = {
//             type: 'join_promoution',
//             message_data: ['%s joined <-!your!-> promotion: "%s"', user_from.username, team.name],
//             emitter_id: user_from.id,
//             target_id: team.user_id,
//             entity_type: 'team',
//             entity_id: team.id
//         };
//         Feeds.create(db_data);
//     } catch (err) {
//         console.log(err);
//     }
// });

SystemEventEmitter.on('contribute_charity', async function (user_from, value, post_id, user_to) {
    try {
        const db_data = {
            type: 'contribute_charity',
            message_data: ['%s contributed <-!your!-> funding: "%sPIB"', user_from.username, value],
            emitter_id: user_from.id,
            target_id: user_to.id,
            entity_type: 'post',
            entity_id: post_id
        };
        Feeds.create(db_data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('pasword_changed', async function (user_from) {
    try {
        const db_data = {
            type: 'pasword_changed',
            message_data: ['Login password changed'],
            emitter_id: user_from.id,
            target_id: user_from.id,
        };
        Feeds.create(db_data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('username_changed', async function (user_from, old_username, username) {
    try {
        const db_data = {
            type: 'username_changed',
            message_data: ['Screen name changed: "%s"', old_username, username],
            emitter_id: user_from.id,
            entity_type: 'user',
            entity_id: user_from.id
        };
        Feeds.create(db_data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('withdraw_ETH', async function (user_from, value) {
    try {
        const db_data = {
            type: 'withdraw_ETH',
            message_data: ['<-!you!-> sent ETH: "%s"', value],
            emitter_id: user_from.id,
            target_id: user_from.id,
            entity_type: 'user',
            entity_id: user_from.id
        };
        Feeds.create(db_data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('withdraw_PIB', async function (user_from, value) {
    try {
        const db_data = {
            type: 'withdraw_PIB',
            message_data: ['<-!you!-> sent PIB: "%s"', value],
            emitter_id: user_from.id,
            target_id: user_from.id,
            entity_type: 'user',
            entity_id: user_from.id
        };
        Feeds.create(db_data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('withdraw_BTC', async function (user_from, value) {
    try {
        const db_data = {
            type: 'withdraw_BTC',
            message_data: ['<-!you!-> sent BTC: "%s"', value],
            emitter_id: user_from.id,
            target_id: user_from.id,
            entity_type: 'user',
            entity_id: user_from.id
        };
        Feeds.create(db_data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('deposit_ETH', async function (user_from, target_user, value) {
    try {
        const db_data = {
            type: 'deposit_ETH',
            message_data: ['<-!you!-> received ETH: "%s"', value],
            emitter_id: user_from.id,
            target_id: target_user.id,
            entity_type: 'user',
            entity_id: user_from.id
        };
        Feeds.create(db_data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('deposit_PIB', async function (user_from, target_user, value) {
    try {
        const db_data = {
            type: 'deposit_PIB',
            message_data: ['<-!you!-> received PIB: "%s"', value],
            emitter_id: user_from.id,
            target_id: target_user.id,
            entity_type: 'user',
            entity_id: user_from.id
        };
        Feeds.create(db_data);
    } catch (err) {
        console.log(err);
    }
});

SystemEventEmitter.on('deposit_BTC', async function (user_from, target_user, value) {
    try {
        const db_data = {
            type: 'deposit_BTC',
            message_data: ['<-!you!-> received BTC: "%s"', value],
            emitter_id: user_from.id,
            target_id: target_user.id,
            entity_type: 'user',
            entity_id: user_from.id
        };
        Feeds.create(db_data);
    } catch (err) {
        console.log(err);
    }
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
    });

    return tokens.map(t => t.token);
}
