const pool = require('../db/postgres');
const { randomUUID } = require('crypto');
const { acquireLock, releaseLock } = require('./lock.service');
const {
    getSeatHoldOwner,
    releaseSeatHold
} = require('./seatHold.service');

const bookSeat = async (eventId, seatId, userId) => {
    const lockKey = `lock:seat:${seatId}`;

    // 🔒 Distributed mutex (protect critical section)
    const lock = await acquireLock(lockKey);
    if (!lock) {
        return { status: 'FAILED', reason: 'Seat is busy' };
    }

    try {
        // 1️⃣ Check seat exists & not already booked
        const seatRes = await pool.query(
            'SELECT is_booked FROM seats WHERE id = $1',
            [seatId]
        );

        if (seatRes.rowCount === 0) {
            return { status: 'FAILED', reason: 'Seat not found' };
        }

        if (seatRes.rows[0].is_booked) {
            return { status: 'FAILED', reason: 'Seat already booked' };
        }

        // 2️⃣ Verify seat HOLD exists
        const holdOwner = await getSeatHoldOwner(seatId);

        if (!holdOwner) {
            return { status: 'FAILED', reason: 'Seat hold expired' };
        }

        if (holdOwner !== userId) {
            return {
                status: 'FAILED',
                reason: 'Seat held by another user'
            };
        }

        // 3️⃣ Confirm booking (FINAL STATE CHANGE)
        await pool.query(
            'UPDATE seats SET is_booked = TRUE WHERE id = $1',
            [seatId]
        );

        const bookingId = randomUUID();
        await pool.query(
            `
      INSERT INTO bookings (id, event_id, seat_id, user_id, status)
      VALUES ($1, $2, $3, $4, $5)
      `,
            [bookingId, eventId, seatId, userId, 'CONFIRMED']
        );

        // 4️⃣ Release HOLD after confirmation
        await releaseSeatHold(seatId);

        return {
            status: 'CONFIRMED',
            bookingId,
            seatId,
            eventId
        };
    } finally {
        // 🔓 Always release mutex
        await releaseLock(lockKey);
    }
};

module.exports = { bookSeat };