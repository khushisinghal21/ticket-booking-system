const pool = require('../db/postgres');
const {
    holdSeat,
    getSeatHoldOwner,
    HOLD_TTL
} = require('../services/seatHold.service');

const holdSeatController = async (req, res) => {
    const { eventId, seatId } = req.body;
    const userId = req.user.id; // Get from authenticated user

    if (!eventId || !seatId) {
        return res.status(400).json({ status: 'FAILED', reason: 'Invalid input' });
    }

    // 1. Check if seat is already booked
    const seatRes = await pool.query(
        'SELECT is_booked FROM seats WHERE id = $1',
        [seatId]
    );

    if (seatRes.rowCount === 0) {
        return res.status(404).json({ status: 'FAILED', reason: 'Seat not found' });
    }

    if (seatRes.rows[0].is_booked) {
        return res.json({ status: 'FAILED', reason: 'Seat already booked' });
    }

    // 2. Try to hold seat
    const success = await holdSeat(seatId, userId);
    if (!success) {
        return res.json({
            status: 'FAILED',
            reason: 'Seat is currently held by another user'
        });
    }

    res.json({
        status: 'HELD',
        seatId,
        expiresIn: HOLD_TTL
    });
};

module.exports = { holdSeatController };