import { placeController } from '../controllers/PlaceController';
import { accessGuard } from '../middlewares/guards';

const router = require('express-promise-router')();

// GET: Places list
router.get('/', placeController.getPlaces);
router.get('/:id/posts',  accessGuard(), placeController.getPosts);

module.exports = router;