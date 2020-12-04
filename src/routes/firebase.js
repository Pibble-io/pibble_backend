import { firebaseController } from '../controllers/FirebaseController';
import { accessGuard } from '../middlewares/guards';

const router = require('express-promise-router')();

router.post('/:platform', accessGuard(), firebaseController.addToken);
router.patch('/:platform', accessGuard(), firebaseController.updateToken);
router.delete('/:platform', accessGuard(), firebaseController.destroyToken);

module.exports = router;