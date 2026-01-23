const bookingService = require('../services/booking.service');
const {
    getCachedResponse,
    checkAndSetProcessing,
    saveResponseWithStatus
} = require('../services/idempotency.service');

const confirmBooking = async (req, res) => {
    const { eventId, seatId } = req.body;
    // Get userId from authenticated user (attached by verifyToken middleware)
    // Fallback to req.body.userId only if req.user is missing (though route should enforce it)
    const userId = req.user?.id || req.body.userId;
    const idempotencyKey = req.headers['idempotency-key'];

    if (!eventId || !seatId || !userId || !idempotencyKey) {
        return res.status(400).json({
            status: 'FAILED',
            reason: 'Missing input or Idempotency-Key'
        });
    }

    try {
        // 1️⃣ Check if already processed
        const cached = await getCachedResponse(idempotencyKey);
        if (cached) {
            // Return cached response with original status code
            return res.status(cached.statusCode || 200).json(cached.body);
        }

        // 2️⃣ Atomic check-and-set: prevent duplicate processing
        const canProcess = await checkAndSetProcessing(idempotencyKey);
        if (!canProcess) {
            // Another request with same key is being processed
            return res.status(409).json({
                status: 'PROCESSING',
                reason: 'Request is already being processed'
            });
        }

        // 3️⃣ Process booking
        const result = await bookingService.bookSeat(
            eventId,
            seatId,
            userId
        );

        // 4️⃣ Determine status code based on result
        const statusCode = result.status === 'CONFIRMED' ? 200 : 400;

        // 5️⃣ Save result with status code
        await saveResponseWithStatus(idempotencyKey, statusCode, result);

        return res.status(statusCode).json(result);

    } catch (error) {
        console.error('Booking error:', error);

        // Cache error response to prevent retries
        const errorResponse = {
            status: 'FAILED',
            reason: 'Internal server error'
        };

        await saveResponseWithStatus(idempotencyKey, 500, errorResponse);

        return res.status(500).json(errorResponse);
    }
};

module.exports = { confirmBooking };