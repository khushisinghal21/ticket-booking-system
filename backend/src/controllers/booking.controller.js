const bookingService = require('../services/booking.service');

const bookSeat = async (req, res) => {
    const { eventId, seatId, userId } = req.body;

    if (!eventId || !seatId || !userId) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    try {
        const result = await bookingService.bookSeat(eventId, seatId, userId);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = { bookSeat };