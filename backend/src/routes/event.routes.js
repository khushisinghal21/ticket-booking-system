const express = require('express');
const router = express.Router();
const controller = require('../controllers/event.controller');

router.post('/events', controller.createEvent);
router.get('/events/:eventId/seats', controller.getSeats);

module.exports = router;