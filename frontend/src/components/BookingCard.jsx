import './BookingCard.css';

function BookingCard({ booking }) {
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

  const getStatusClass = (status) => {
    return `status-badge status-${status}`;
  };

  return (
    <div className="booking-card fade-in">
      <div className="booking-header">
        <div className="booking-barber">
          <span className="booking-avatar">{booking.barber_avatar}</span>
          <span className="booking-barber-name">{booking.barber_name}</span>
        </div>
        <span className={getStatusClass(booking.status)}>
          {getStatusText(booking.status)}
        </span>
      </div>

      <div className="booking-details">
        <div className="booking-detail-item">
          <span className="detail-icon">📅</span>
          <span className="detail-text">{booking.booking_date}</span>
        </div>
        <div className="booking-detail-item">
          <span className="detail-icon">⏰</span>
          <span className="detail-text">{booking.booking_time}</span>
        </div>
      </div>

      <div className="booking-footer">
        <span className="booking-id">#{booking.id}</span>
        <span className="booking-date">{new Date(booking.created_at).toLocaleDateString('uz-UZ')}</span>
      </div>
    </div>
  );
}

export default BookingCard;


