const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { validateToken } = require('../../api').jwtApi;

router.post('/create', controller.createEvent);
router.get('/upcoming', controller.getUpcomingEvents);
router.get('/impact-stats', controller.getImpactStats);
router.get('/:id/photos', controller.getEventPhotos);
router.put('/:id', controller.updateEvent);
router.delete('/:id', controller.deleteEvent);

module.exports = router;
