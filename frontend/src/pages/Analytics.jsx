import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { apiUrl } from '../api.js'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from 'recharts'


function fmtCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const PERIOD_CONFIG = {
  day:   { label: 'Today',     icon: '🕐', desc: 'Last 24 hours' },
  week:  { label: 'This Week', icon: '📅', desc: 'Last 7 days' },
  month: { label: 'Month',     icon: '📆', desc: 'Last 30 days' },
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.625rem',
        padding: '0.75rem 1rem',
        fontSize: '0.8125rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</div>
        <div style={{ fontWeight: 700, color: 'var(--accent-light)', fontSize: '1rem' }}>
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
  const [transactions, setTransactions] = useState([])
  const [chartType, setChartType] = useState('bar') // 'bar' | 'area'

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    fetch(apiUrl(`/transaction/analytics/${user.id}?period=${period}`))
      .then(r => r.json())
      .then(d => {
        setData(Array.isArray(d.data) ? d.data : [])
        setTotal(d.total || 0)
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [period, user?.id])

  useEffect(() => {
    if (!user?.id) return
    fetch(apiUrl(`/transaction/history/${user.id}`))
      .then(r => r.json())
      .then(d => setTransactions(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [user?.id])

  const sent = transactions.filter(t => t.senderId === user?.id)
  const received = transactions.filter(t => t.receiverId === user?.id)
  const avgSent = sent.length ? sent.reduce((s, t) => s + t.amount, 0) / sent.length : 0
  const maxTx = sent.length ? Math.max(...sent.map(t => t.amount)) : 0

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>📊 Analytics</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Track your spending patterns</p>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card animate-slide-up">
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💸</div>
          <div className="stat-number">{fmtCurrency(total)}</div>
          <div className="stat-label">{PERIOD_CONFIG[period].desc} Spent</div>
        </div>
        <div className="stat-card animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📈</div>
          <div className="stat-number">{fmtCurrency(avgSent)}</div>
          <div className="stat-label">Avg per Transaction</div>
        </div>
        <div className="stat-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🏆</div>
          <div className="stat-number">{fmtCurrency(maxTx)}</div>
          <div className="stat-label">Largest Transaction</div>
        </div>
      </div>

      {/* Chart Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Spending Overview</h2>
            <p style={{ color: 'var(--text-faint)', fontSize: '0.8125rem', margin: '0.2rem 0 0' }}>
              {PERIOD_CONFIG[period].desc}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className={`btn-icon ${chartType === 'bar' ? 'active' : ''}`}
              onClick={() => setChartType('bar')}
              title="Bar chart"
              style={{ ...(chartType === 'bar' ? { background: 'var(--accent-glow)', borderColor: 'var(--accent)', color: 'var(--accent)' } : {}) }}
            >▊</button>
            <button
              className={`btn-icon ${chartType === 'area' ? 'active' : ''}`}
              onClick={() => setChartType('area')}
              title="Area chart"
              style={{ ...(chartType === 'area' ? { background: 'var(--accent-glow)', borderColor: 'var(--accent)', color: 'var(--accent)' } : {}) }}
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

        <div className="chart-container">
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-faint)' }}>
              <span className="animate-spin" style={{ fontSize: '2rem' }}>⟳</span>
            </div>
          ) : data.length === 0 || data.every(d => d.amount === 0) ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-faint)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <div>No spending data for this period</div>
            </div>
          ) : chartType === 'bar' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'var(--text-faint)', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-faint)', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `₹${(v/1000).toFixed(1)}k` : `₹${v}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--accent-glow)' }} />
                <Bar dataKey="amount" fill="var(--accent)" radius={[6,6,0,0]}
                  maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: 'var(--text-faint)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-faint)', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `₹${(v/1000).toFixed(1)}k` : `₹${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="var(--accent)" strokeWidth={2.5}
                  fill="url(#colorAmt)" dot={{ fill: 'var(--accent)', r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: 'var(--bg-base)' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Transaction breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="stat-card">
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔴</div>
          <div className="stat-number" style={{ color: '#f87171' }}>{sent.length}</div>
          <div className="stat-label">Total Sent</div>
          <div style={{ color: '#f87171', fontWeight: 600, marginTop: '0.25rem', fontSize: '0.875rem' }}>
            {fmtCurrency(sent.reduce((s, t) => s + t.amount, 0))}
          </div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🟢</div>
          <div className="stat-number" style={{ color: '#34d399' }}>{received.length}</div>
          <div className="stat-label">Total Received</div>
          <div style={{ color: '#34d399', fontWeight: 600, marginTop: '0.25rem', fontSize: '0.875rem' }}>
            {fmtCurrency(received.reduce((s, t) => s + t.amount, 0))}
          </div>
        </div>
      </div>
    </div>
  )
}
