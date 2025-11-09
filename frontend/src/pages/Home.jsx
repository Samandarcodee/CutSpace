import { useState, useEffect } from 'react';
import { getBarbers } from '../api';
import BarberCard from '../components/BarberCard';
import './Home.css';

function Home({ user }) {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBarbers();
  }, []);

  const loadBarbers = async () => {
    try {
      const response = await getBarbers();
      setBarbers(response.data);
    } catch (error) {
      console.error('Error loading barbers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="home-header">
        <h1 className="page-header">Sartaroshlar</h1>
        <p className="welcome-text">Assalomu alaykum, {user.firstName}! 👋</p>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : barbers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💈</div>
          <div className="empty-state-text">Hozircha sartaroshlar yo'q</div>
        </div>
      ) : (
        <div className="barbers-list">
          {barbers.map((barber) => (
            <BarberCard key={barber.id} barber={barber} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;


