/**
 * Middleware to enforce idempotency key on critical endpoints
 * Validates presence and format of Idempotency-Key header
 */
const requireIdempotencyKey = (req, res, next) => {
    const idempotencyKey = req.headers['idempotency-key'];

    if (!idempotencyKey) {
        return res.status(400).json({
            status: 'FAILED',
            reason: 'Idempotency-Key header is required'
        });
    }

    // Validate format (should be a UUID or similar unique string)
    // Basic validation: at least 10 characters, alphanumeric with hyphens
    const isValidFormat = /^[a-zA-Z0-9-_]{10,}$/.test(idempotencyKey);

    if (!isValidFormat) {
        return res.status(400).json({
            status: 'FAILED',
            reason: 'Idempotency-Key must be at least 10 characters and contain only alphanumeric characters, hyphens, or underscores'
        });
    }

    // Key is valid, proceed
    next();
};

module.exports = {
    requireIdempotencyKey
};
