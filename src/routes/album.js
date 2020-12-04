import multer from 'multer';
import { accessGuard } from '../middlewares/guards';
import { mediaController } from '../controllers/MediaController';

const router = require('express-promise-router')();
const uploader = multer({ dest: 'uploads/' });

router.put('/', [ accessGuard(), uploader.single('album') ], mediaController.createAlbum);

router.delete('/:id', accessGuard(), mediaController.deleteAlbum);

module.exports = router;