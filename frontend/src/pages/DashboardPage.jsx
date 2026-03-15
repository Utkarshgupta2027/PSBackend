import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHistory } from '../api/api';

function StatCard({ label, value, icon, gradient }) {
  return (
    <div className={`rounded-2xl p-5 border border-white/10 shadow-xl relative overflow-hidden ${gradient}`}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
      <p className="text-sm font-medium text-white/70 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      <div className="absolute bottom-3 right-4 text-3xl opacity-40">{icon}</div>
    </div>
  );
}

function ActionButton({ to, icon, label, color }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all duration-200 hover:scale-105 active:scale-95 ${color}`}
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-sm font-semibold text-white">{label}</span>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    if (user?.id) {
      getHistory(user.id)
        .then((r) => setRecent(r.data.slice(0, 5)))
        .catch(() => {});
    }
  }, [user]);

  const balance = user?.balance ?? '—';
  const displayName = user?.name || user?.email || 'User';

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Hello, {displayName.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400 mt-1">Here's your financial overview</p>
      </div>

      {/* Balance + Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Wallet Balance"
          value={`₹ ${balance}`}
          icon="💰"
          gradient="bg-gradient-to-br from-primary-600 to-primary-800"
        />
        <StatCard
          label="Transactions"
          value={recent.length}
          icon="📊"
          gradient="bg-gradient-to-br from-slate-700 to-slate-800"
        />
        <StatCard
          label="Account Status"
          value="Active"
          icon="✅"
          gradient="bg-gradient-to-br from-emerald-700 to-emerald-900"
        />
      </div>

      {/* Quick Actions */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-white mb-5">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-4">
          <ActionButton to="/send"      icon="💸" label="Send Money"  color="bg-gradient-to-br from-primary-600/30 to-primary-800/30 border-primary-600/30 hover:border-primary-500/60" />
          <ActionButton to="/add-money" icon="➕" label="Add Money"   color="bg-gradient-to-br from-emerald-600/30 to-emerald-800/30 border-emerald-600/30 hover:border-emerald-500/60" />
          <ActionButton to="/history"   icon="📋" label="History"     color="bg-gradient-to-br from-violet-600/30 to-violet-800/30 border-violet-600/30 hover:border-violet-500/60" />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
          <Link to="/history" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <div className="text-5xl mb-3">📭</div>
            <p>No transactions yet</p>
            <Link to="/send" className="mt-3 inline-block text-primary-400 text-sm hover:text-primary-300">
              Send your first payment →
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {recent.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-500/20 flex items-center justify-center text-lg">💸</div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">To: User #{tx.receiverId}</p>
                    <p className="text-xs text-slate-500">{new Date(tx.time).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-400">-₹{tx.amount}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${tx.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {tx.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
