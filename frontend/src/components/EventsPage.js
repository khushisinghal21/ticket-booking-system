import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../api/auth';
import { createEvent } from '../api/events';

function EventsPage() {
    const [eventName, setEventName] = useState('');
    const [seatCount, setSeatCount] = useState('50');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const user = getCurrentUser();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const newEvent = await createEvent(eventName, parseInt(seatCount));
            setEvents([newEvent, ...events]);
            setEventName('');
            setSeatCount('50');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEvent = (eventId) => {
        navigate(`/events/${eventId}/seats`);
    };

    return (
        <div className="page">
            <div className="container">
                {/* Header */}
                <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ marginBottom: '0.5rem' }}>🎟️ Ticket Booking</h1>
                        <p style={{ marginBottom: 0, fontSize: '1.125rem' }}>
                            Welcome, <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{user?.name}</span>!
                        </p>
                    </div>
                    <button onClick={handleLogout} className="btn btn-secondary">
                        Logout
                    </button>
                </div>

                {/* Create Event Card */}
                <div className="card animate-fade-in" style={{ marginBottom: '2rem' }}>
                    <h2>Create New Event</h2>
                    <form onSubmit={handleCreateEvent} className="flex" style={{ gap: '1rem', alignItems: 'flex-end' }}>
                        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                            <label className="form-label">Event Name</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g., Concert, Conference, Movie"
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group" style={{ width: '150px', marginBottom: 0 }}>
                            <label className="form-label">Seats</label>
                            <input
                                type="number"
                                className="form-input"
                                min="1"
                                max="1000"
                                value={seatCount}
                                onChange={(e) => setSeatCount(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-success" disabled={loading}>
                            {loading ? '...' : '+ Create Event'}
                        </button>
                    </form>

                    {error && (
                        <div className="form-error animate-slide-in" style={{ marginTop: '1rem' }}>
                            ⚠️ {error}
                        </div>
                    )}
                </div>

                {/* Events List */}
                <div>
                    <h2 style={{ marginBottom: '1.5rem' }}>Your Events</h2>

                    {events.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎭</div>
                            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
                                No events yet. Create your first event above!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-2">
                            {events.map((event, index) => (
                                <div
                                    key={event.id}
                                    className="card card-compact animate-fade-in"
                                    style={{ cursor: 'pointer', animationDelay: `${index * 50}ms` }}
                                    onClick={() => handleSelectEvent(event.id)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 style={{ marginBottom: '0.5rem' }}>{event.name}</h3>
                                            <p style={{ marginBottom: 0, fontSize: '0.875rem' }}>
                                                Event ID: <code>{event.id.slice(0, 8)}...</code>
                                            </p>
                                        </div>
                                        <span className="badge badge-info">View Seats →</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EventsPage;
