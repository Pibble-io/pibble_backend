import multer from 'multer';
import { accessGuard } from '../middlewares/guards';
import { chatController } from '../controllers/ChatController';

import { doubleRequestGuard } from '../helpers/RateLimit';

const router = require('express-promise-router')();

// router.post('/text/message', accessGuard(), doubleRequestGuard, chatController.createTextMessage);
router.post('/text/message', accessGuard(), chatController.createTextMessage);

router.post('/post/message', accessGuard(), chatController.createPostMessage);
router.post('/room', accessGuard(), chatController.createRoom);
router.post('/digital_goods_room', accessGuard(), chatController.createDigitalGoodsRoom);
router.post('/goods_room', accessGuard(), chatController.createGoodsRoom);

router.patch('/room/:room_id/settings', accessGuard(), chatController.changeSettings);

router.get('/room/:room_id', accessGuard(), chatController.getRoomHistory);
router.get('/room/:room_id/read', accessGuard(), chatController.readAllMessages);
router.get('/rooms', accessGuard(), chatController.getUserRooms);
router.get('/digital_doods_rooms', accessGuard(), chatController.getDigitalGoodsChats);
router.get('/private_rooms', accessGuard(), chatController.getPrivetRooms);

router.get('/group/:post_id/rooms/', accessGuard(), chatController.getRoomsInGroup);
router.get('/socket_test_info', accessGuard(), chatController.getTestInfo);

module.exports = router;