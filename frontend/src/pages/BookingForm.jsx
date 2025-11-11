import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBarberById, createBooking } from '../api';
import './BookingForm.css';

function BookingForm({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [barber, setBarber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00',
    '17:00', '18:00', '19:00'
  ];

  useEffect(() => {
    loadBarber();
    
    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    setBookingDate(today);
  }, [id]);

  const loadBarber = async () => {
    try {
      const response = await getBarberById(id);
      setBarber(response.data);
    } catch (error) {
      console.error('Error loading barber:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingDate || !bookingTime) {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.showAlert('⚠️ Iltimos, sana va vaqtni tanlang');
      }
      return;
    }

    setSubmitting(true);

    try {
      await createBooking({
        client_name: `${user.firstName} ${user.lastName || ''}`.trim(),
        client_telegram_id: user.id,
        barber_id: parseInt(id),
        booking_date: bookingDate,
        booking_time: bookingTime
      });

      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.showAlert('✅ Band qilindi! Sartarosh javobini kuting.');
      }

      navigate('/booking');
    } catch (error) {
      console.error('Error creating booking:', error);
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.showAlert('❌ Xatolik yuz berdi. Qayta urinib ko\'ring.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">❌</div>
          <div className="empty-state-text">Sartarosh topilmadi</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container booking-form-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Orqaga
      </button>

      <h1 className="page-header">Band qilish</h1>

      <div className="booking-barber-info fade-in">
        <div className="booking-barber-avatar">{barber.avatar}</div>
        <div>
          <h3 className="booking-barber-name">{barber.name}</h3>
          <p className="booking-barber-desc">{barber.description}</p>
        </div>
      </div>

      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">📅 Sana</label>
          <input
            type="date"
            className="input"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label">⏰ Vaqt</label>
          <div className="time-slots">
            {timeSlots.map((time) => (
              <button
                key={time}
                type="button"
                className={`time-slot ${bookingTime === time ? 'active' : ''}`}
                onClick={() => setBookingTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <div className="booking-summary">
          <h3 className="summary-title">Xulosa</h3>
          <div className="summary-item">
            <span>Sartarosh:</span>
            <span>{barber.name}</span>
          </div>
          <div className="summary-item">
            <span>Sana:</span>
            <span>{bookingDate || 'Tanlanmagan'}</span>
          </div>
          <div className="summary-item">
            <span>Vaqt:</span>
            <span>{bookingTime || 'Tanlanmagan'}</span>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting ? 'Yuborilmoqda...' : '✅ Tasdiqlash'}
        </button>
      </form>
    </div>
  );
}

export default BookingForm;


