const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/report', controller.reportHotspot);
router.get('/', controller.getAllHotspots);

module.exports = router;
