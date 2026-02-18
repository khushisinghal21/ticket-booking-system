# 🎟️ Ticket Booking System

A scalable full-stack Ticket Booking System that allows users to browse movies/events, select seats in real-time, and securely book tickets with concurrency-safe seat allocation.

This project demonstrates real-world system design concepts including race condition handling, atomic transactions, optimized database queries, and clean REST API architecture.

---

## 🚀 Features

- 🔐 JWT-based User Authentication (Signup/Login)
- 🎬 Browse Movies / Events & Show Timings
- 🪑 Interactive Seat Selection
- ⚡ Concurrency-safe seat booking (Prevents double booking)
- ⏳ Temporary seat locking mechanism
- 💳 Payment Integration (Mock / Extendable to Stripe)
- 📦 Booking History Tracking
- 🛠️ Admin Management (Add/Delete Shows & Movies)
- 📊 Indexed database queries for performance

---

## 🏗️ System Architecture

Frontend (React)
        ↓
Backend (Node.js + Express)
        ↓
Database (MongoDB / PostgreSQL)
        ↓
Redis (Seat Locking & Caching)

---

## 🧠 Concurrency & Seat Locking Strategy

To prevent race conditions:

1. When a user selects a seat → seat is temporarily locked.
2. Lock expires automatically after a fixed duration.
3. Final booking uses atomic database transaction.
4. Redis (or DB-level locking) ensures no double booking.

This mimics real-world ticket booking platforms.

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Axios
- Tailwind CSS / CSS

### Backend
- Node.js
- Express.js
- JWT Authentication
- RESTful API Architecture

### Database
- MongoDB / PostgreSQL
- Redis (for temporary seat locking)

---

## 📂 Project Structure

ticket-booking-system/
│
├── client/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── App.js
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   └── server.js
│
└── README.md

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/ticket-booking-system.git
cd ticket-booking-system
