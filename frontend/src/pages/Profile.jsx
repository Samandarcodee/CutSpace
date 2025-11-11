import './Profile.css';

function Profile({ user }) {
  return (
    <div className="container">
      <h1 className="page-header">Profil</h1>

      <div className="profile-card fade-in">
        <div className="profile-avatar">👤</div>
        <h2 className="profile-name">{user.firstName} {user.lastName}</h2>
        {user.username && (
          <p className="profile-username">@{user.username}</p>
        )}
        <p className="profile-id">ID: {user.id}</p>
      </div>

      <div className="profile-section">
        <h3 className="section-title">Ma'lumot</h3>
        <div className="info-card">
          <div className="info-item">
            <span className="info-icon">📱</span>
            <div className="info-content">
              <div className="info-label">Telegram</div>
              <div className="info-value">Ulangan</div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h3 className="section-title">Sozlamalar</h3>
        <div className="settings-card">
          <div className="setting-item">
            <span className="setting-icon">🔔</span>
            <span className="setting-label">Bildirishnomalar</span>
            <span className="setting-value">Yoqilgan</span>
          </div>
          <div className="setting-item">
            <span className="setting-icon">🌐</span>
            <span className="setting-label">Til</span>
            <span className="setting-value">O'zbek</span>
          </div>
        </div>
      </div>

      <div className="profile-footer">
        <p className="app-version">CutSpace v1.0.0</p>
        <p className="app-info">Toshkent, O'zbekiston 🇺🇿</p>
      </div>
    </div>
  );
}

export default Profile;


