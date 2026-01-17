const pool = require('../db/postgres');
const { randomUUID } = require('crypto');

const createEvent = async (name, seatCount) => {
    const eventId = randomUUID();

    await pool.query(
        'INSERT INTO events (id, name) VALUES ($1, $2)',
        [eventId, name]
    );

    for (let i = 1; i <= seatCount; i++) {
        await pool.query(
            'INSERT INTO seats (id, event_id) VALUES ($1, $2)',
            [`${eventId}-S${i}`, eventId]
        );
    }

    return { id: eventId, name };
};

const getSeatsForEvent = async (eventId) => {
    const result = await pool.query(
        'SELECT id AS "seatId", is_booked AS "isBooked" FROM seats WHERE event_id = $1',
        [eventId]
    );

    return result.rows;
};

module.exports = { createEvent, getSeatsForEvent };