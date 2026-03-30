import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useNavigate } from 'react-router-dom'
import { useOutletContext } from 'react-router-dom'

const THEME_CONFIG = {
  dark:   { label: 'Dark',   icon: '🌙', swatch: '#0ea5e9', bg: '#020617' },
  light:  { label: 'Light',  icon: '☀️', swatch: '#0ea5e9', bg: '#f1f5f9' },
  ocean:  { label: 'Ocean',  icon: '🌊', swatch: '#06b6d4', bg: '#0d1f3c' },
  rose:   { label: 'Rose',   icon: '🌸', swatch: '#ec4899', bg: '#1a0a0f' },
  purple: { label: 'Purple', icon: '💜', swatch: '#8b5cf6', bg: '#0d0a1e' },
}

export default function Settings() {
  const { user, logout } = useAuth()
  const { theme, changeTheme } = useTheme()
  const navigate = useNavigate()
  const { setToast } = useOutletContext()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>⚙️ Settings</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="settings-section">
        <div className="settings-section-header">
          👤 Profile
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <div className="avatar" style={{ width: '4rem', height: '4rem', fontSize: '1.25rem', flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{user?.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email}</div>
            {user?.phoneNumber && (
              <div style={{ color: 'var(--text-faint)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                📱 {user.phoneNumber}
              </div>
            )}
            <div style={{ marginTop: '0.5rem' }}>
              <span className="badge badge-info">ID #{user?.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="settings-section">
        <div className="settings-section-header">🎨 Theme</div>
        <div style={{ padding: '0.75rem 1.5rem 1.25rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Choose your preferred look. Changes apply instantly.
          </p>
          <div className="theme-grid">
            {Object.entries(THEME_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                id={`theme-${key}`}
                className={`theme-btn ${theme === key ? 'selected' : ''}`}
                onClick={() => {
                  changeTheme(key)
                  setToast({ type: 'info', icon: cfg.icon, message: `${cfg.label} theme applied!`, duration: 2000 })
                }}
              >
                <div
                  className="theme-swatch"
                  style={{
                    background: `linear-gradient(135deg, ${cfg.bg} 50%, ${cfg.swatch} 50%)`,
                    border: `2px solid ${theme === key ? cfg.swatch : 'var(--border-input)'}`,
                  }}
                />
                <span className="theme-name">{cfg.icon} {cfg.label}</span>
                {theme === key && (
                  <span style={{ fontSize: '0.625rem', color: 'var(--accent)', fontWeight: 700 }}>✓ Active</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="settings-section">
        <div className="settings-section-header">💼 Account Details</div>
        {[
          { label: 'Account Type', value: 'Standard' },
          { label: 'Member Since', value: '2024' },
          { label: 'Wallet Balance', value: `₹${Number(user?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
        ].map(({ label, value }) => (
          <div key={label} className="settings-item">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label}</span>
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* App Settings */}
      <div className="settings-section">
        <div className="settings-section-header">🔧 App Settings</div>
        {[
          { label: 'Transaction Notifications', value: 'Enabled', icon: '🔔' },
          { label: 'Daily Bonus Reminder', value: 'Enabled', icon: '⏰' },
          { label: 'Analytics Tracking', value: 'On', icon: '📊' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="settings-item">
            <span style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {icon} {label}
            </span>
            <span className="badge badge-success">{value}</span>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="settings-section" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
        <div className="settings-section-header" style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }}>
          ⚠️ Account Actions
        </div>
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <button
            id="logout-btn"
            onClick={handleLogout}
            style={{
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: 'white', border: 'none', borderRadius: '0.75rem',
              padding: '0.875rem 1.5rem', fontWeight: 600, fontSize: '0.9375rem',
              cursor: 'pointer', width: '100%',
              boxShadow: '0 4px 14px rgba(220,38,38,0.35)',
              transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(220,38,38,0.45)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(220,38,38,0.35)' }}
          >
            🚪 Logout from PayFlow
          </button>
          <p style={{ textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.8125rem', marginTop: '0.75rem' }}>
            You'll need to sign in again after logging out.
          </p>
        </div>
      </div>

      {/* Version */}
      <div style={{ textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.75rem', marginTop: '2rem' }}>
        PayFlow v2.0.0 · Made with ⚡
      </div>
    </div>
  )
}
