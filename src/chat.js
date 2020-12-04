const ChatServer = require('http').createServer()
const io = require('socket.io')(ChatServer)

import config from './config';
import { ChatMessage, ChatRoom, User, sequelize } from './models';
import { Op } from "sequelize";
import jwt from "jsonwebtoken";

let usersConnections = {};

function joinUserToRoom(user_id, room_id) {
    const client_id = usersConnections[user_id];
    if (client_id)
        io.clients().sockets[client_id].join(room_id);
}

function leaveUserFromRoom(user_id, room_id) {
    const client_id = usersConnections[user_id];
    if (client_id) {
        io.clients().sockets[client_id].leave(room_id);
    }
}

function getConnectionsInfo() {
    return { users: Object.keys(usersConnections), rooms: io.sockets.adapter.rooms, usersConnections: Object.keys(usersConnections).length };
}

const chatIO = io.use(function (client, next) {
    if (client.handshake.query && client.handshake.query.token) {
        jwt.verify(client.handshake.query.token, config.JWT_ACCESS_SECRET, { ignoreExpiration: true }, function (err, decoded) {
            if (err) {
                console.log('Authentication error');
                return next(new Error('Authentication error'));
            }
            client.decoded = decoded;
            next();
        });
    } else {
        console.log('Authentication error');
        next(new Error('Authentication error'));
    }
})
    .on('connection', async client => {
        const user_id = client.decoded.id;
        usersConnections[user_id] = client.id;

        const is_left = (condition) => {
            return '(SELECT `is_left` FROM `chat_room_settings` AS `chat_room_settings` WHERE `chat_room_settings`.`room_id` = chat_room.id AND `chat_room_settings`.`user_id` = ' + user_id + ')' + condition
        }

        const unread_chat_message = (condition) => {
            return '(SELECT count(*) AS `count` FROM `chat_message_statuses` AS `chat_message_statuses` WHERE `chat_message_statuses`.`room_id` = chat_room.id AND `chat_message_statuses`.`status` = 0 AND `chat_message_statuses`.`user_id` = ' + user_id + ')' + condition
        }

        const userRooms = await ChatRoom.findAll(
            {
                where: {
                    [Op.or]: [
                        {
                            [Op.and]: [
                                {
                                    [Op.or]: [
                                        sequelize.literal(is_left(' = 0 ')),
                                        sequelize.literal(is_left(' IS NULL ')),
                                    ]
                                }
                            ]
                        }, {
                            [Op.and]: [
                                sequelize.literal(is_left(' >0 ')), ,
                                sequelize.literal(unread_chat_message(' >0 '))
                            ]
                        }
                    ]
                },
                include: [{
                    model: User,
                    where: {
                        id: user_id
                    },
                    required: true
                }]
            }
        )
        userRooms.map(room => {
            joinUserToRoom(user_id, room.id);
        })

        client.on('disconnect', () => {
            delete usersConnections[client.decoded.id];
        });

        client.on('send', async ({ room_id, message }) => {
            const user_id = client.decoded.id;
            const msg = await ChatMessage.create({ message: { message: message }, from_id: user_id, room_id: room_id });
            client.to(room_id).emit('new_message', { message: msg });
        });
    })
export {
    ChatServer,
    chatIO,
    joinUserToRoom,
    leaveUserFromRoom,
    getConnectionsInfo
}