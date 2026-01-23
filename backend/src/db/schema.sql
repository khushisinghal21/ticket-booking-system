-- Database schema for ticket booking system

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Seats table
CREATE TABLE IF NOT EXISTS seats (
    id TEXT PRIMARY KEY,
    event_id UUID REFERENCES events(id),
    is_booked BOOLEAN DEFAULT FALSE
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY,
    event_id UUID,
    seat_id TEXT,
    user_id UUID REFERENCES users(id),
    status TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
