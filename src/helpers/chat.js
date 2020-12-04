import {
    ChatRoom,
    ChatRoomUser,
    ChatMessage,
    ChatMessageStatus,
    ChatRoomSettings,
    ChatRoomGroup,
    Post,
    User,
    sequelize
} from '../models';
import { chatIO, joinUserToRoom, leaveUserFromRoom } from '../chat'
import { SystemEventEmitter } from '../utils/system_events';
import LocalizationError from '../utils/localizationError';

export async function getRoom(usersList, post_id = null, goods_order_id = null) {
    const room_type = post_id ? 'goods' : 'normal';
    usersList = usersList.filter((value, index, self) => { return self.indexOf(value) === index; });
    if (usersList.length < 2) {
        throw new LocalizationError('You can not create chat with only one user.');
    }
    const roomName = usersList.sort().join('-');
    let room, group, isNewRoom, isNewGroup;
    let tx = await sequelize.transaction();
    try {
        //create or get existed Group for DigitalGoods Rooms
        if (post_id) {
            const post = await Post.findById(post_id);
            [group, isNewGroup] = await ChatRoomGroup.findOrCreate({
                where: { post_id: post.id },
                defaults: { post_id: post.id, owner: post.user_id },
                transaction: tx
            });
        }

        [room, isNewRoom] = await ChatRoom.findOrCreate({
            where: { title: roomName, type: room_type, group_id: (group ? group.id : null) },
            include: { model: User, as: 'members' },
            defaults: { title: roomName, type: room_type, post_id: post_id || null, goods_order_id: goods_order_id || null },
            transaction: tx
        });

        if (room.type === 'goods' && goods_order_id && (!room.goods_order_id || goods_order_id != room.goods_order_id)) {
            room.goods_order_id = goods_order_id;
            room.save();
        }

        if (isNewRoom) {
            //Added group to room if it is DigitalGoods Room
            if (group) {
                room.group_id = group.id;
                room.save();
            }
            //Add Users ti the Room if it is new Room
            await Promise.all(usersList.map(async user_id => {
                let user = await User.find({ where: { id: user_id } });
                if (user) {
                    await room.addUser(user, {
                        transaction: tx
                    });
                }
            }));
        }

        //Connect user to the room in socketIO
        await Promise.all(usersList.map(async user_id => {
            joinUserToRoom(user_id, room.id);
            ChatRoomSettings.update({ is_left: 0 }, { where: { user_id, room_id: room.id, is_left: 1 } });
        }));

        await tx.commit();
    } catch (err) {
        console.log(err);
        await tx.rollback();
        throw new LocalizationError(err.message);
    }

    return await room.reload();
}

export async function leaveRoom(user_id, room_id) {
    leaveUserFromRoom(user_id, room_id)
    ChatMessageStatus.update({ status: 1 }, { where: { user_id, room_id, status: 0 } });
}

export async function createGoodsRoom(post_id, fromUserId) {
    const post = await Post.findById(post_id);
    if (!post) {
        throw new LocalizationError('Post Not found.');
    }
    if (post.type !== 'goods') {
        throw new LocalizationError('It is not goods post.');
    }

    const usersList = [post.user_id, fromUserId];
    const room = await getRoom(usersList, post_id);

    chatIO.in(room.id).emit('new_room', { message: room });

    return room;
}

export async function createDigitalGoodsRoom(post_id, fromUserId) {
    const post = await Post.findById(post_id);
    if (!post) {
        throw new LocalizationError('Post Not found.');
    }
    if (post.type !== 'digital_goods') {
        throw new LocalizationError('It is not digital goods post.');
    }

    const usersList = [post.user_id, fromUserId];
    const room = await getRoom(usersList, post_id);

    chatIO.in(room.id).emit('new_room', { message: room });

    return room;
}

export async function createDigitalGoodsPostMessage(post_id, fromUserId) {
    const post = await Post.findById(post_id);
    if (!post) {
        throw new LocalizationError('Post Not found.');
    }
    if (post.type !== 'digital_goods' && post.type !== 'goods') {
        throw new LocalizationError('It is not digital goods post.');
    }

    const usersList = [post.user_id, fromUserId];
    const room = await getRoom(usersList, post_id);

    let msg;
    const tx = await sequelize.transaction();
    try {
        //Create Message
        msg = await ChatMessage.create({ type: 'goods', message: { post_id }, from_id: fromUserId, room_id: room.id }, {
            transaction: tx
        });

        //Ad statuses of message
        if (msg) {
            await Promise.all(usersList.map(async room_user_id => {
                await ChatMessageStatus.create({ message_id: msg.id, user_id: room_user_id, room_id: room.id }, {
                    transaction: tx
                })
            }));
        }
        await tx.commit();
    } catch (err) {
        console.log(err);
        await tx.rollback();
        throw new Error(`oops...Something went wrong!`);
    }

    return msg;
}


export async function createTextMessage(userFrom, message, room_id) {
    const isMemberOfTheRoom = await ChatRoomUser.count({ where: { user_id: userFrom.id, chat_room_id: room_id } });
    if (!isMemberOfTheRoom) {
        throw new LocalizationError(`You are not member of this chat.`);
    }

    const tx = await sequelize.transaction();
    let msg, room;

    try {
        room = await ChatRoom.findOne({
            where: { id: room_id },
            include: {
                model: User,
                include: {
                    model: ChatRoomSettings,
                    as: 'room_settings',
                    where: { room_id },
                    required: false
                }
            }
        });
        if (!room) {
            throw new LocalizationError('Room Not found.');
        }

        msg = await ChatMessage.create({ type: 'text', message: { text: message }, from_id: userFrom.id, room_id }, {
            transaction: tx
        });

        if (msg) {
            await Promise.all(room.users.map(async room_user => {
                await ChatMessageStatus.create({ message_id: msg.id, user_id: room_user.id, room_id, status: room_user.id === userFrom.id }, {
                    transaction: tx
                })
            }));
        }

        const usersIds = room.users.filter(u => (!u.room_settings[0] || !u.room_settings[0].is_mute)).map(u => u.id);

        SystemEventEmitter.emit('message_arrived', userFrom, msg, usersIds)

        await tx.commit();
    } catch (err) {
        console.log(err);
        await tx.rollback();
        throw new Error(`oops...Something went wrong!`);
    }

    chatIO.in(room_id).emit('new_message', { message: msg });

    return msg;
}

export async function createSystemMessage(userFrom, message, room_id) {
    const isMemberOfTheRoom = await ChatRoomUser.count({ where: { user_id: userFrom.id, chat_room_id: room_id } });
    if (!isMemberOfTheRoom) {
        throw new LocalizationError(`You are not member of this chat.`);
    }

    const tx = await sequelize.transaction();
    let msg, room;

    try {
        room = await ChatRoom.findOne({ where: { id: room_id }, include: { model: User } });
        if (!room) {
            throw new LocalizationError('Room Not found.');
        }

        msg = await ChatMessage.create({ type: 'system', message, from_id: userFrom.id, room_id }, {
            transaction: tx
        });

        if (msg) {
            await Promise.all(room.users.map(async room_user => {
                await ChatMessageStatus.create({ message_id: msg.id, user_id: room_user.id, room_id }, {
                    transaction: tx
                })
            }));
        }

        SystemEventEmitter.emit('system_message_arrived', userFrom, msg, room.users.map(u => u.id))

        await tx.commit();
    } catch (err) {
        console.log(err);
        await tx.rollback();
        throw new Error(`oops...Something went wrong!`);
    }

    chatIO.in(room_id).emit('new_message', { message: msg });

    return msg;
}