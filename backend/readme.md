# Ticket Booking Backend

A backend system focused on correctness under concurrency.

## What this system guarantees
- No double booking of seats
- Deterministic outcomes under concurrent requests
- Transparent booking states
- Fairness via rate limiting

## Core Design
- Seats are the unit of booking
- Each seat is protected by a Redis lock (mutex)
- Booking logic runs inside a critical section
- Locks have TTLs to avoid deadlocks

## Tech Stack
- Node.js + Express
- Redis (locking, rate limiting)
- In-memory store (for clarity & testing)

## OS Concepts Used
- Mutual Exclusion: Redis locks
- Critical Section: seat booking
- Deadlock Prevention: lock TTL
- Fairness: rate limiting
- Race Conditions: demonstrated and fixed

## APIs
- POST /api/events
- GET /api/events/:eventId/seats
- POST /api/book