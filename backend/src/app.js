const express = require('express');
const eventRoutes = require('./routes/event.routes');
const bookingRoutes = require('./routes/booking.routes');

const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());
app.use('/api', eventRoutes);
app.use('/api', bookingRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

module.exports = app;