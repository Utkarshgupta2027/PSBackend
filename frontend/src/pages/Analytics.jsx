import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { apiUrl } from '../api.js'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, LinearGradient, Stop
} from 'recharts'

function fmtCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
function fmtDate(s) {
  if (!s) return ''
  return new Date(s).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const PERIOD_CONFIG = {
  day:   { label: 'Today',     icon: '🕐', desc: 'Last 24 hours' },
  week:  { label: 'This Week', icon: '📅', desc: 'Last 7 days' },
  month: { label: 'Month',     icon: '📆', desc: 'Last 30 days' },
}

// Read CSS variable at runtime — works even when theme changes
function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '0.625rem',
        padding: '0.75rem 1rem',
        fontSize: '0.8125rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}>
        <div style={{ color: '#94a3b8', marginBottom: '0.25rem' }}>{label}</div>
        <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '1rem' }}>
          {fmtCurrency(payload[0].value)}
        </div>
      </div>
    )
  }
  return null
}

export default function Analytics() {
  const { user } = useAuth()
  const [period, setPeriod] = useState('week')
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [chartType, setChartType] = useState('bar')
  const [accentColor, setAccentColor] = useState('#0ea5e9')

  // Read accent color on mount and on theme change
  useEffect(() => {
    const readColor = () => {
      const color = getCssVar('--accent') || '#0ea5e9'
      setAccentColor(color)
    }
    readColor()
    const observer = new MutationObserver(readColor)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  // Fetch analytics data
  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    fetch(apiUrl(`/transaction/analytics/${user.id}?period=${period}`))
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(d => {
        setData(Array.isArray(d.data) ? d.data : [])
        setTotal(d.total || 0)
      })
      .catch(e => {
        setError('Could not load analytics data.')
        setData([])
      })
      .finally(() => setLoading(false))
  }, [period, user?.id])

  // Fetch transaction history
  useEffect(() => {
    if (!user?.id) return
    fetch(apiUrl(`/transaction/history/${user.id}`))
      .then(r => r.json())
      .then(d => setTransactions(Array.isArray(d) ? d : []))
      .catch(() => setTransactions([]))
  }, [user?.id])

  const sent = transactions.filter(t => t.senderId === user?.id)
  const received = transactions.filter(t => t.receiverId === user?.id)
  const avgSent = sent.length ? sent.reduce((s, t) => s + t.amount, 0) / sent.length : 0
  const maxTx = sent.length ? Math.max(...sent.map(t => t.amount)) : 0
  const hasData = data.length > 0 && data.some(d => d.amount > 0)

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>📊 Analytics</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Track your spending patterns</p>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { icon: '💸', value: fmtCurrency(total), label: `${PERIOD_CONFIG[period].desc} Spent` },
          { icon: '📈', value: fmtCurrency(avgSent), label: 'Avg per Transaction' },
          { icon: '🏆', value: fmtCurrency(maxTx), label: 'Largest Transaction' },
        ].map((s, i) => (
          <div key={i} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.icon}</div>
            <div className="stat-number">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        {/* Chart header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Spending Overview</h2>
            <p style={{ color: 'var(--text-faint)', fontSize: '0.8125rem', margin: '0.2rem 0 0' }}>
              {PERIOD_CONFIG[period].desc}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className="btn-icon"
              onClick={() => setChartType('bar')}
              title="Bar chart"
              style={chartType === 'bar' ? { background: 'var(--accent-glow)', borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}
            >▊</button>
            <button
              className="btn-icon"
              onClick={() => setChartType('area')}
              title="Area chart"
              style={chartType === 'area' ? { background: 'var(--accent-glow)', borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}
            >〜</button>
          </div>
        </div>

        {/* Period Tabs */}
        <div className="analytics-tabs" style={{ marginBottom: '1.5rem' }}>
          {Object.entries(PERIOD_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              id={`tab-${key}`}
              className={`analytics-tab ${period === key ? 'active' : ''}`}
              onClick={() => setPeriod(key)}
            >
              {cfg.icon} {cfg.label}
            </button>
          ))}
        </div>

        {/* Chart area */}
        <div className="chart-container">
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.75rem', color: 'var(--text-faint)' }}>
              <span className="animate-spin" style={{ fontSize: '2rem' }}>⟳</span>
              <span>Loading...</span>
            </div>
          ) : error ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-faint)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
              <div>{error}</div>
            </div>
          ) : !hasData ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-faint)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <div style={{ fontWeight: 600 }}>No spending data for this period</div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Make a payment to see your analytics</div>
            </div>
          ) : chartType === 'bar' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(14,165,233,0.1)' }} />
                <Bar dataKey="amount" fill={accentColor} radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={accentColor} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={accentColor} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke={accentColor}
                  strokeWidth={2.5}
                  fill="url(#colorAmt)"
                  dot={{ fill: accentColor, r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#020617' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Sent / Received breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔴</div>
          <div className="stat-number" style={{ color: '#f87171' }}>{sent.length}</div>
          <div className="stat-label">Payments Sent</div>
          <div style={{ color: '#f87171', fontWeight: 600, marginTop: '0.25rem', fontSize: '0.875rem' }}>
            {fmtCurrency(sent.reduce((s, t) => s + t.amount, 0))}
          </div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🟢</div>
          <div className="stat-number" style={{ color: '#34d399' }}>{received.length}</div>
          <div className="stat-label">Payments Received</div>
          <div style={{ color: '#34d399', fontWeight: 600, marginTop: '0.25rem', fontSize: '0.875rem' }}>
            {fmtCurrency(received.reduce((s, t) => s + t.amount, 0))}
          </div>
        </div>
      </div>

      {/* Full Transaction History */}
      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem' }}>
          Transaction History
          <span style={{
            marginLeft: '0.625rem', fontSize: '0.75rem', fontWeight: 600,
            background: 'var(--accent-glow)', color: 'var(--accent-light)',
            padding: '0.125rem 0.5rem', borderRadius: '9999px'
          }}>{transactions.length}</span>
        </h2>

        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-faint)' }}>
            No transactions yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {transactions.map(t => {
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
                      {t.status && (
                        <span style={{
                          marginLeft: '0.5rem',
                          color: t.status === 'SUCCESS' ? '#34d399' : '#f87171',
                          fontWeight: 600
                        }}>• {t.status}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: isSent ? '#f87171' : '#34d399' }}>
                    {isSent ? '-' : '+'}{fmtCurrency(t.amount)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
