import { teamController } from '../controllers/TeamController';
import { uploader } from '../middlewares/uploader';
import { accessGuard } from '../middlewares/guards';

const router = require('express-promise-router')();


router.get('/', accessGuard(), teamController.index);
router.get('/:id', accessGuard(), teamController.show);
router.put('/', accessGuard(), uploader.single('logo'), teamController.create);
router.patch('/:id', accessGuard(), uploader.single('logo'), teamController.update);
router.post('/:id/invite', accessGuard(), teamController.invite);
router.post('/:id/join', accessGuard(), teamController.join);
router.post('/:id/reject', accessGuard(), teamController.reject);

module.exports = router;