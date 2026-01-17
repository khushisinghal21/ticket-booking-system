const redis = require('../cache/redis');

const acquireLock = async (key, ttl = 5) => {
    return await redis.set(key, 'LOCKED', 'NX', 'EX', ttl);
};

const releaseLock = async (key) => {
    await redis.del(key);
};

module.exports = { acquireLock, releaseLock };