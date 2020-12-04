import { goodsOrderController } from '../controllers/GoodsOrderController';
import { accessGuard } from "../middlewares/guards";

const router = require('express-promise-router')();

// GET: Places list
router.post('/', accessGuard(), goodsOrderController.createOrder);
router.post('/confirm', accessGuard(), goodsOrderController.conformOrder);
router.post('/request/return', accessGuard(), goodsOrderController.returnOrderRequest);
router.post('/accept/return', accessGuard(), goodsOrderController.returnOrderAccept);

module.exports = router;