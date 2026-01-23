import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSeats, holdSeat, confirmBooking } from '../api/events';

function SeatsPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [seats, setSeats] = useState([]);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadSeats();
    }, []);

    const loadSeats = async () => {
        try {
            const data = await getSeats(eventId);
            setSeats(data);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load seats' });
        } finally {
            setLoading(false);
        }
    };

    const handleSeatClick = async (seat) => {
        if (seat.isBooked) return;

        setMessage({ type: '', text: '' });
        setSelectedSeat(seat.seatId);
        setActionLoading(true);

        try {
            const result = await holdSeat(eventId, seat.seatId);
            if (result.status === 'HELD') {
                setMessage({ type: 'success', text: `Seat ${seat.seatId} held! You have ${result.expiresIn}s to confirm.` });
            } else {
                setMessage({ type: 'error', text: result.reason || 'Failed to hold seat' });
                setSelectedSeat(null);
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.reason || 'Failed to hold seat' });
            setSelectedSeat(null);
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!selectedSeat) return;

        setActionLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const result = await confirmBooking(eventId, selectedSeat);
            if (result.status === 'CONFIRMED') {
                setMessage({ type: 'success', text: `🎉 Booking confirmed! ID: ${result.bookingId}` });
                loadSeats(); // Reload to show updated status
                setSelectedSeat(null);
            } else {
                setMessage({ type: 'error', text: result.reason || 'Booking failed' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.reason || 'Booking failed' });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="center">
                <div className="card" style={{ textAlign: 'center' }}>
                    <h2>Loading seats...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                {/* Header */}
                <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                    <div>
                        <button onClick={() => navigate('/events')} className="btn btn-secondary btn-sm">
                            ← Back to Events
                        </button>
                    </div>
                    <h1 style={{ margin: 0 }}>🪑 Select Your Seat</h1>
                    <div style={{ width: '120px' }}></div>
                </div>

                {/* Message Display */}
                {message.text && (
                    <div
                        className={`card animate-slide-in ${message.type === 'success' ? 'badge-success' : 'badge-error'}`}
                        style={{
                            marginBottom: '2rem',
                            padding: '1rem 1.5rem',
                            textAlign: 'center',
                            background: message.type === 'success'
                                ? 'rgba(72, 187, 120, 0.2)'
                                : 'rgba(245, 101, 101, 0.2)',
                            borderColor: message.type === 'success' ? '#48bb78' : '#f56565',
                        }}
                    >
                        <p style={{ margin: 0, color: message.type === 'success' ? '#48bb78' : '#f56565', fontWeight: 600 }}>
                            {message.text}
                        </p>
                    </div>
                )}

                {/* Confirm Button (when seat selected) */}
                {selectedSeat && (
                    <div className="card animate-fade-in" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        <p style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>
                            Seat <strong>{selectedSeat}</strong> is held for you
                        </p>
                        <button
                            onClick={handleConfirm}
                            className="btn btn-success btn-lg"
                            disabled={actionLoading}
                        >
                            {actionLoading ? 'Confirming...' : '✓ Confirm Booking'}
                        </button>
                    </div>
                )}

                {/* Legend */}
                <div className="flex justify-center" style={{ gap: '2rem', marginBottom: '2rem' }}>
                    <div className="flex items-center" style={{ gap: '0.5rem' }}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            background: 'var(--gradient-success)',
                        }}></div>
                        <span>Available</span>
                    </div>
                    <div className="flex items-center" style={{ gap: '0.5rem' }}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            background: '#4a5568',
                        }}></div>
                        <span>Booked</span>
                    </div>
                    <div className="flex items-center" style={{ gap: '0.5rem' }}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            background: 'var(--gradient-primary)',
                            boxShadow: 'var(--shadow-glow)',
                        }}></div>
                        <span>Selected</span>
                    </div>
                </div>

                {/* Seats Grid */}
                <div className="grid grid-3" style={{ maxWidth: '900px', margin: '0 auto' }}>
                    {seats.map((seat, index) => {
                        const isSelected = seat.seatId === selectedSeat;
                        const isBooked = seat.isBooked;

                        return (
                            <div
                                key={seat.seatId}
                                className="card card-compact animate-fade-in"
                                style={{
                                    cursor: isBooked ? 'not-allowed' : 'pointer',
                                    background: isSelected
                                        ? 'var(--gradient-primary)'
                                        : isBooked
                                            ? '#2d3748'
                                            : 'var(--bg-card)',
                                    boxShadow: isSelected ? 'var(--shadow-glow)' : 'var(--shadow-md)',
                                    opacity: isBooked ? 0.5 : 1,
                                    animationDelay: `${index * 20}ms`,
                                    textAlign: 'center',
                                }}
                                onClick={() => !isBooked && !actionLoading && handleSeatClick(seat)}
                            >
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                    {isBooked ? '🔒' : isSelected ? '✓' : '🪑'}
                                </div>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                    {seat.seatId}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {isBooked ? 'BOOKED' : isSelected ? 'SELECTED' : 'AVAILABLE'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default SeatsPage;
