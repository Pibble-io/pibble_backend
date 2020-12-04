import { categoryController } from '../controllers/CategoryController';
import { accessGuard } from "../middlewares/guards";

const router = require('express-promise-router')();

// GET: Categories list
router.get('/', accessGuard(), categoryController.getCategories);

module.exports = router;