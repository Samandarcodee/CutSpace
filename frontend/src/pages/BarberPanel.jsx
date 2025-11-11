import { useState, useEffect } from 'react';
import { getPendingBookings, updateBookingStatus } from '../api';
import './BarberPanel.css';

function BarberPanel({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected

  useEffect(() => {
    loadBookings();
    
    // Poll for updates every 3 seconds
    const interval = setInterval(loadBookings, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadBookings = async () => {
    try {
      // In a real app, you would filter by barber_id
      // For demo, we show all bookings
      const response = await getPendingBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status);
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status } 
          : booking
      ));

      const tg = window.Telegram?.WebApp;
      if (tg) {
        const message = status === 'accepted' 
          ? '✅ Band qabul qilindi' 
          : '❌ Band rad etildi';
        tg.showAlert(message);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.showAlert('❌ Xatolik yuz berdi');
      }
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return '⏳ Kutilmoqda';
      case 'accepted':
        return '✅ Qabul qilindi';
      case 'rejected':
        return '❌ Rad etildi';
      default:
        return status;
    }
  };

  return (
    <div className="container barber-panel">
      <div className="panel-header">
        <h1 className="page-header">Sartarosh Paneli</h1>
        <p className="welcome-text">Assalomu alaykum! 👋</p>
      </div>

      <div className="filter-buttons">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Barchasi ({bookings.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          ⏳ Kutilmoqda ({bookings.filter(b => b.status === 'pending').length})
        </button>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-text">
            {filter === 'pending' 
              ? 'Yangi bandlar yo\'q' 
              : 'Hozircha bandlar yo\'q'}
          </div>
        </div>
      ) : (
        <div className="bookings-grid">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="booking-panel-card fade-in">
              <div className="booking-panel-header">
                <div className="booking-panel-id">#{booking.id}</div>
                <div className={`status-badge status-${booking.status}`}>
                  {getStatusText(booking.status)}
                </div>
              </div>

              <div className="booking-panel-info">
                <div className="info-row">
                  <span className="info-icon">👤</span>
                  <div className="info-text">
                    <div className="info-label">Mijoz</div>
                    <div className="info-value">{booking.client_name}</div>
                  </div>
                </div>

                <div className="info-row">
                  <span className="info-icon">💈</span>
                  <div className="info-text">
                    <div className="info-label">Sartarosh</div>
                    <div className="info-value">{booking.barber_name}</div>
                  </div>
                </div>

                <div className="info-row">
                  <span className="info-icon">📅</span>
                  <div className="info-text">
                    <div className="info-label">Sana</div>
                    <div className="info-value">{booking.booking_date}</div>
                  </div>
                </div>

                <div className="info-row">
                  <span className="info-icon">⏰</span>
                  <div className="info-text">
                    <div className="info-label">Vaqt</div>
                    <div className="info-value">{booking.booking_time}</div>
                  </div>
                </div>
              </div>

              {booking.status === 'pending' && (
                <div className="booking-panel-actions">
                  <button 
                    className="btn btn-success"
                    onClick={() => handleStatusUpdate(booking.id, 'accepted')}
                  >
                    ✔️ Qabul qilish
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                  >
                    ✖️ Rad etish
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BarberPanel;


