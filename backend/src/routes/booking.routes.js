const express = require('express');
const router = express.Router();
const controller = require('../controllers/booking.controller');
const rateLimit = require('../middlewares/rateLimit');

router.post('/book', rateLimit, controller.bookSeat);

module.exports = router;