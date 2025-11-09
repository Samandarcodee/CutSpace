import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './App.css';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import BarberDetail from './pages/BarberDetail';
import BookingForm from './pages/BookingForm';
import BarberPanel from './pages/BarberPanel';

function App() {
  const [user, setUser] = useState(null);
  const [isBarber, setIsBarber] = useState(false);

  useEffect(() => {
    // Initialize Telegram Web App
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      
      // Get user data from Telegram
      const telegramUser = tg.initDataUnsafe?.user;
      if (telegramUser) {
        setUser({
          id: telegramUser.id.toString(),
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
          username: telegramUser.username
        });
      }

      // Apply Telegram theme
      document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
      document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
      document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
      document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2481cc');
      document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
      document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f4f4f5');
    } else {
      // For development without Telegram
      setUser({
        id: '123456789',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser'
      });
    }

    // Check if user is barber (for demo, check URL params)
    const urlParams = new URLSearchParams(window.location.search);
    setIsBarber(urlParams.get('role') === 'barber');
  }, []);

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="app">
        {isBarber ? (
          <Routes>
            <Route path="/barber" element={<BarberPanel user={user} />} />
            <Route path="*" element={<Navigate to="/barber" replace />} />
          </Routes>
        ) : (
          <>
            <Routes>
              <Route path="/" element={<Home user={user} />} />
              <Route path="/booking" element={<Booking user={user} />} />
              <Route path="/profile" element={<Profile user={user} />} />
              <Route path="/barber/:id" element={<BarberDetail user={user} />} />
              <Route path="/barber/:id/book" element={<BookingForm user={user} />} />
            </Routes>
            <BottomNav />
          </>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;


