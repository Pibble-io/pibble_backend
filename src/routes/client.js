
import { clientController } from '../controllers';
import { accessGuard } from "../middlewares/guards";

const router = require('express-promise-router')();

// GET: Countries list
router.get('/', accessGuard(), clientController.index);
router.post('/create', accessGuard(), clientController.create);

module.exports = router;