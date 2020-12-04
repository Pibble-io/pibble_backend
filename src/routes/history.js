import { historyController } from '../controllers/HistoryController';
import {accessGuard} from "../middlewares/guards";

const router = require('express-promise-router')();

// GET: Places list
router.get('/', accessGuard(), historyController.index);
router.post('/add', accessGuard(), historyController.addToHistory);

module.exports = router;