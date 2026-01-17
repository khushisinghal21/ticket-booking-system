const eventService = require('../services/event.service');

const createEvent = async (req, res) => {
    const { name, seatCount } = req.body;

    if (!name || !seatCount) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    const event = await eventService.createEvent(name, seatCount); // ✅ await

    res.status(201).json(event);
};

const getSeats = async (req, res) => {
    const { eventId } = req.params;
    const seats = await eventService.getSeatsForEvent(eventId); // ✅ await

    res.json(seats);
};

module.exports = {
    createEvent,
    getSeats
};