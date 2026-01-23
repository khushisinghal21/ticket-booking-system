const express = require('express');
const router = express.Router();

const rateLimit = require('../middlewares/rateLimit');
const verifyToken = require('../middlewares/auth.middleware');
const { requireIdempotencyKey } = require('../middleware/idempotency.middleware');
const { confirmBooking } = require('../controllers/booking.controller');

router.post('/seats/confirm', verifyToken, requireIdempotencyKey, rateLimit, confirmBooking);

module.exports = router;