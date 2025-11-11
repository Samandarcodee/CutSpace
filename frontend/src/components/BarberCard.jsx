import { useNavigate } from 'react-router-dom';
import './BarberCard.css';

function BarberCard({ barber }) {
  const navigate = useNavigate();

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐️');
    }
    if (hasHalfStar) {
      stars.push('⭐️');
    }

    return stars.join('');
  };

  return (
    <div className="barber-card fade-in" onClick={() => navigate(`/barber/${barber.id}`)}>
      <div className="barber-header">
        <div className="barber-avatar">{barber.avatar}</div>
        <div className="barber-info">
          <h3 className="barber-name">{barber.name}</h3>
          <div className="barber-rating">
            <span className="stars">{renderStars(barber.rating)}</span>
            <span className="rating-text">{barber.rating.toFixed(1)}</span>
            <span className="rating-count">({barber.total_reviews})</span>
          </div>
        </div>
      </div>

      <p className="barber-description">{barber.description}</p>

      <div className="barber-services">
        {barber.services.slice(0, 3).map((service, index) => (
          <div key={index} className="service-item">
            <span className="service-name">{service.name}</span>
            <span className="service-price">{(service.price / 1000).toFixed(0)} ming so'm</span>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" style={{ marginTop: '12px' }}>
        Band qilish
      </button>
    </div>
  );
}

export default BarberCard;


