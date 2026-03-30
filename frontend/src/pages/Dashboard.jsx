import { useState, useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { apiUrl } from '../api.js'

function fmtCurrency(n) {
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtDate(s) {
  if (!s) return ''
  return new Date(s).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Dashboard() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const { setToast } = useOutletContext()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshBalance, setRefreshBalance] = useState(0)

  // Fetch user balance refresh
  useEffect(() => {
    if (!user?.id) return
    fetch(apiUrl(`/user/${user.id}`))
      .then(r => r.json())
      .then(u => updateUser(u))
      .catch(() => {})
  }, [refreshBalance])

  // Fetch transactions
  useEffect(() => {
    if (!user?.id) return
    fetch(apiUrl(`/transaction/history/${user.id}`))
      .then(r => r.json())
      .then(data => { setTransactions(Array.isArray(data) ? data.slice(0, 8) : []) })
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false))
  }, [])

  // Daily bonus auto-check
  useEffect(() => {
    if (!user?.id) return
    const today = new Date().toDateString()
    const lastBonus = localStorage.getItem('payflow_daily_bonus_date')
    if (lastBonus === today) return
    fetch(apiUrl(`/rewards/daily-bonus/${user.id}`), { method: 'POST' })
      .then(r => r.json())
      .then(d => {
        if (!d.alreadyClaimed && d.pointsAwarded > 0) {
          localStorage.setItem('payflow_daily_bonus_date', today)
          setToast({ type: 'gold', icon: '🎁', message: `Daily bonus! +${d.pointsAwarded} points earned!`, duration: 4000 })
        }
      })
      .catch(() => {})
  }, [])

  const sent = transactions.filter(t => t.senderId === user?.id)
  const received = transactions.filter(t => t.receiverId === user?.id)
  const totalSent = sent.reduce((s, t) => s + t.amount, 0)
  const totalReceived = received.reduce((s, t) => s + t.amount, 0)

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
          Hi, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Balance Card */}
      <div className="balance-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.875rem', opacity: 0.85, marginBottom: '0.5rem' }}>Total Balance</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          {fmtCurrency(user?.balance || 0)}
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.75 }}>
          Account: {user?.email}
        </div>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>Total Sent</div>
            <div style={{ fontWeight: 700, fontSize: '1.0625rem' }}>{fmtCurrency(totalSent)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>Total Received</div>
            <div style={{ fontWeight: 700, fontSize: '1.0625rem' }}>{fmtCurrency(totalReceived)}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        {[
          { icon: '💸', label: 'Send', path: '/send' },
          { icon: '📷', label: 'Scan QR', path: '/qr' },
          { icon: '📊', label: 'Analytics', path: '/analytics' },
          { icon: '⭐', label: 'Rewards', path: '/rewards' },
        ].map(({ icon, label, path }) => (
          <button key={path} className="quick-action" onClick={() => navigate(path)}>
            <div className="quick-action-icon">{icon}</div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="card animate-slide-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Recent Transactions</h2>
          <button
            className="btn-secondary"
            onClick={() => navigate('/analytics')}
            style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem', width: 'auto' }}
          >
            View all →
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div className="skeleton" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <div className="skeleton" style={{ height: '0.875rem', width: '60%' }} />
                  <div className="skeleton" style={{ height: '0.75rem', width: '40%' }} />
                </div>
                <div className="skeleton" style={{ height: '1rem', width: '5rem' }} />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-faint)' }}>
            No transactions yet.<br />
            <button className="btn-primary" onClick={() => navigate('/send')} style={{ marginTop: '1rem', width: 'auto', padding: '0.6rem 1.25rem' }}>
              Send money
            </button>
          </div>
        ) : (
          transactions.map(t => {
            const isSent = t.senderId === user?.id
            return (
              <div key={t.id} className="tx-item">
                <div className={`tx-icon ${isSent ? 'tx-sent' : 'tx-received'}`}>
                  {isSent ? '↑' : '↓'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {isSent ? `Sent to #${t.receiverId}` : `Received from #${t.senderId}`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
                    {fmtDate(t.time)}
                  </div>
                </div>
                <div style={{
                  fontWeight: 700, fontSize: '0.9375rem',
                  color: isSent ? '#f87171' : '#34d399'
                }}>
                  {isSent ? '-' : '+'}{fmtCurrency(t.amount)}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
