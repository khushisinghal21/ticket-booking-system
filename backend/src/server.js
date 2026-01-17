const app = require('./app');

const PORT = 4000;

app.listen(PORT, () => {
    console.log(`🚀 Ticket Booking Server running on port ${PORT}`);
});