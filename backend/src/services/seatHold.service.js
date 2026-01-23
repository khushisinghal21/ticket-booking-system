const redis = require('../cache/redis');

const HOLD_TTL = 120; // seconds

const holdSeat = async (seatId, userId) => {
    const key = `hold:seat:${seatId}`;
    const result = await redis.set(key, userId, 'NX', 'EX', HOLD_TTL);
    return result === 'OK';
};

const getSeatHoldOwner = async (seatId) => {
    return redis.get(`hold:seat:${seatId}`);
};

const releaseSeatHold = async (seatId) => {
    return redis.del(`hold:seat:${seatId}`);
};

module.exports = {
    holdSeat,
    getSeatHoldOwner,
    releaseSeatHold,
    HOLD_TTL
};