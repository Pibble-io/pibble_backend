import { metricController } from '../../controllers/metric_server/MetricController';
import { accessGuard } from '../../middlewares/guards';

const router = require('express-promise-router')();

router.get('/posts', accessGuard(), metricController.getPromoPosts);

router.post('/', accessGuard(), metricController.collectMetrics);

module.exports = router;