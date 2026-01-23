require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const bookingRoutes = require('./routes/booking.routes');
const seatHoldRoutes = require('./routes/seatHold.routes');

const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());

app.use('/api', authRoutes);
app.use('/api', eventRoutes);
app.use('/api', bookingRoutes);
app.use('/api', seatHoldRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

module.exports = app;