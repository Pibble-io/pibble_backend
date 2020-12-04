import { mediaController } from '../controllers/MediaController';
import { accessGuard, urlAccessGuard } from '../middlewares/guards';
import { uploader } from '../middlewares/uploader';

const router = require('express-promise-router')();

router.get('/uuid', accessGuard(), mediaController.getUuid);

// router.put('/', accessGuard(), uploader.single('media'), mediaController.uploadPostMedia);
router.put('/', accessGuard(), uploader.fields([{ name: 'media'}, { name: 'original_media' }]), mediaController.uploadPostMedia);


router.post('/', accessGuard(), mediaController.uploadBase64Media);

router.post('/download/digital-goods/:post_id', accessGuard(), mediaController.downloadDigitalGoods);

router.get('/original/digital-goods/:file_name', urlAccessGuard(), mediaController.getOriginalImage);

module.exports = router;