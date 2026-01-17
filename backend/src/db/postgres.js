const { Pool } = require('pg');

const pool = new Pool({
    user: 'khushisinghal',
    host: 'localhost',
    database: 'ticket_booking',
    password: '',
    port: 5432
});

module.exports = pool;