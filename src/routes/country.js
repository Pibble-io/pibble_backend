import { countryController } from '../controllers/CountryController';

const router = require('express-promise-router')();

// GET: Countries list
router.get('/', countryController.getCountries);

module.exports = router;