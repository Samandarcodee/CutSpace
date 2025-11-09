import { NavLink } from 'react-router-dom';
import './BottomNav.css';

function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <span className="nav-icon">🏠</span>
        <span className="nav-label">Bosh sahifa</span>
      </NavLink>
      
      <NavLink to="/booking" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <span className="nav-icon">📅</span>
        <span className="nav-label">Bandlarim</span>
      </NavLink>
      
      <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <span className="nav-icon">👤</span>
        <span className="nav-label">Profil</span>
      </NavLink>
    </nav>
  );
}

export default BottomNav;


