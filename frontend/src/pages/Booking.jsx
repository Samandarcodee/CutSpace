import { useState, useEffect } from 'react';
import { getClientBookings } from '../api';
import BookingCard from '../components/BookingCard';
import './Booking.css';

function Booking({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(loadBookings, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  const loadBookings = async () => {
    try {
      const response = await getClientBookings(user.id);
      setBookings(response.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="page-header">Mening bandlarim</h1>

      {loading ? (
        <div className="spinner"></div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <div className="empty-state-text">Hozircha bandlaringiz yo'q</div>
          <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>
            Sartaroshni tanlang va band qiling
          </p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Booking;


