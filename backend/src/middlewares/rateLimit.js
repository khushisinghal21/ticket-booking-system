const redis = require('../cache/redis');

const rateLimit = async (req, res, next) => {
    const userId = req.body.userId || req.ip; // fallback
    const key = `rate:${userId}`;
    const limit = 5; // max requests
    const windowSec = 60;

    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSec);

    if (count > limit) {
        return res.status(429).json({
            status: 'FAILED',
            reason: 'Rate limit exceeded. Try again later.'
        });
    }

    next();
};

module.exports = rateLimit;