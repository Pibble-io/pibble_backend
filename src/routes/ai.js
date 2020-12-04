import { aiController } from '../controllers/AiController';
import { accessGuard } from '../middlewares/guards';
import { uploader } from '../middlewares/uploader';

const router = require('express-promise-router')();

router.put('/recognize/image', accessGuard(), uploader.single('image'), aiController.recognizeImage);
router.put('/recognize/video', accessGuard(), uploader.single('video'), aiController.recognizeVideo);

module.exports = router;