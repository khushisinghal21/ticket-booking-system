const redis = require('../cache/redis');

const TTL = 600; // 10 minutes
const PROCESSING_TTL = 60; // 1 minute for processing state

/**
 * Get cached response for an idempotency key
 * @param {string} key - Idempotency key
 * @returns {Object|null} Cached response with statusCode and body, or null
 */
const getCachedResponse = async (key) => {
    const data = await redis.get(`idempotency:${key}`);
    return data ? JSON.parse(data) : null;
};

/**
 * Save response to cache (backward compatible)
 * @param {string} key - Idempotency key
 * @param {Object} response - Response body
 */
const saveResponse = async (key, response) => {
    await redis.set(
        `idempotency:${key}`,
        JSON.stringify(response),
        'EX',
        TTL
    );
};

/**
 * Atomically check if request is being processed and mark as processing
 * Uses Redis SET NX (set if not exists) for atomic operation
 * @param {string} key - Idempotency key
 * @returns {boolean} True if successfully marked as processing, false if already exists
 */
const checkAndSetProcessing = async (key) => {
    const processingKey = `idempotency:processing:${key}`;
    // SET NX EX - Set if not exists with expiration (atomic operation)
    const result = await redis.set(
        processingKey,
        'processing',
        'EX',
        PROCESSING_TTL,
        'NX'
    );
    return result === 'OK';
};

/**
 * Save response with HTTP status code
 * @param {string} key - Idempotency key
 * @param {number} statusCode - HTTP status code
 * @param {Object} responseBody - Response body
 */
const saveResponseWithStatus = async (key, statusCode, responseBody) => {
    const response = {
        statusCode,
        body: responseBody,
        timestamp: new Date().toISOString()
    };

    await redis.set(
        `idempotency:${key}`,
        JSON.stringify(response),
        'EX',
        TTL
    );

    // Clean up processing marker
    await redis.del(`idempotency:processing:${key}`);
};

module.exports = {
    getCachedResponse,
    saveResponse,
    checkAndSetProcessing,
    saveResponseWithStatus
};