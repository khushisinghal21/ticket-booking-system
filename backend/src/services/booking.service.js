const pool = require('../db/postgres');
const { randomUUID } = require('crypto');
const { acquireLock, releaseLock } = require('./lock.service');

const bookSeat = async (eventId, seatId, userId) => {
    const lockKey = `lock:seat:${seatId}`;
    const lock = await acquireLock(lockKey);

    if (!lock) {
        return { status: 'FAILED', reason: 'Seat is busy' };
    }

    try {
        const seatRes = await pool.query(
            'SELECT is_booked FROM seats WHERE id = $1',
            [seatId]
        );

        if (seatRes.rowCount === 0) {
            throw new Error('Seat not found');
        }

        if (seatRes.rows[0].is_booked) {
            return { status: 'FAILED', reason: 'Seat already booked' };
        }

        await pool.query(
            'UPDATE seats SET is_booked = TRUE WHERE id = $1',
            [seatId]
        );

        const bookingId = randomUUID();
        await pool.query(
            'INSERT INTO bookings (id, event_id, seat_id, user_id, status) VALUES ($1, $2, $3, $4, $5)',
            [bookingId, eventId, seatId, userId, 'CONFIRMED']
        );

        return {
            status: 'CONFIRMED',
            bookingId,
            seatId,
            eventId
        };
    } finally {
        await releaseLock(lockKey);
    }
};

module.exports = { bookSeat };