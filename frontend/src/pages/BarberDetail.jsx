import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBarberById, getBarberReviews, createReview } from '../api';
import './BarberDetail.css';

function BarberDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [barber, setBarber] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBarberData();
  }, [id]);

  const loadBarberData = async () => {
    try {
      const [barberRes, reviewsRes] = await Promise.all([
        getBarberById(id),
        getBarberReviews(id)
      ]);
      setBarber(barberRes.data);
      setReviews(reviewsRes.data);
    } catch (error) {
      console.error('Error loading barber data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await createReview({
        barber_id: parseInt(id),
        client_name: `${user.firstName} ${user.lastName || ''}`.trim(),
        client_telegram_id: user.id,
        rating,
        comment
      });

      setShowReviewForm(false);
      setComment('');
      setRating(5);
      loadBarberData();

      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.showAlert('✅ Sharh qo\'shildi!');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.showAlert('❌ Xatolik yuz berdi');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return '⭐️'.repeat(Math.round(rating));
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
    <div className="container barber-detail-page">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Orqaga
      </button>

      <div className="barber-profile fade-in">
        <div className="barber-profile-avatar">{barber.avatar}</div>
        <h1 className="barber-profile-name">{barber.name}</h1>
        <div className="barber-profile-rating">
          <span className="stars">{renderStars(barber.rating)}</span>
          <span className="rating-text">{barber.rating.toFixed(1)}</span>
          <span className="rating-count">({barber.total_reviews} sharh)</span>
        </div>
        <p className="barber-profile-description">{barber.description}</p>
      </div>

      <div className="services-section">
        <h2 className="section-title">Xizmatlar</h2>
        <div className="services-list">
          {barber.services.map((service, index) => (
            <div key={index} className="service-card">
              <span className="service-card-name">{service.name}</span>
              <span className="service-card-price">{(service.price / 1000).toFixed(0)} ming so'm</span>
            </div>
          ))}
        </div>
      </div>

      <button 
        className="btn btn-primary"
        onClick={() => navigate(`/barber/${id}/book`)}
      >
        📅 Band qilish
      </button>

      <div className="reviews-section">
        <div className="reviews-header">
          <h2 className="section-title">Sharhlar ({reviews.length})</h2>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowReviewForm(!showReviewForm)}
            style={{ marginTop: '8px' }}
          >
            {showReviewForm ? '❌ Bekor qilish' : '✍️ Sharh qoldirish'}
          </button>
        </div>

        {showReviewForm && (
          <form className="review-form fade-in" onSubmit={handleSubmitReview}>
            <div className="input-group">
              <label className="input-label">Reyting</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-button ${rating >= star ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                  >
                    ⭐️
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Izoh (ixtiyoriy)</label>
              <textarea
                className="input textarea"
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Fikringizni yozing..."
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Yuborilmoqda...' : '✅ Sharh qo\'shish'}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-text">Hozircha sharhlar yo'q</div>
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-card fade-in">
                <div className="review-header">
                  <span className="review-author">{review.client_name}</span>
                  <span className="review-rating">{renderStars(review.rating)}</span>
                </div>
                {review.comment && (
                  <p className="review-comment">{review.comment}</p>
                )}
                <span className="review-date">
                  {new Date(review.created_at).toLocaleDateString('uz-UZ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BarberDetail;


