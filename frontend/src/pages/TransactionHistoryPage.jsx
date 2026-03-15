import React, { useEffect, useState, useCallback } from 'react';
import { getHistory, retryTransaction } from '../api/api';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  SUCCESS: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  FAILED:  'bg-red-500/15   text-red-400   border-red-500/30',
  PENDING: 'bg-amber-500/15  text-amber-400  border-amber-500/30',
};

export default function TransactionHistoryPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  const fetchHistory = useCallback(() => {
    if (!user?.id) return;
    setLoading(true);
    getHistory(user.id)
      .then((r) => setTransactions(r.data))
      .catch(() => setError('Failed to load transaction history.'))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleRetry = async (id) => {
    setRetrying(id);
    try {
      await retryTransaction(id);
      fetchHistory();
    } catch {
      setError('Retry failed. Please try again.');
    } finally {
      setRetrying(null);
    }
  };

  const filtered = filter === 'ALL'
    ? transactions
    : transactions.filter((t) => t.status === filter);

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Transaction History</h1>
        <p className="text-slate-400 mt-1">All your payment activities</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', 'SUCCESS', 'FAILED', 'PENDING'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200
              ${filter === f
                ? 'bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/25'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'}`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-sm text-slate-500 self-center">{filtered.length} records</span>
      </div>

      {error && <div className="error-box mb-4">⚠️ {error}</div>}

      {loading ? (
        <div className="flex flex-col items-center py-20 text-slate-500">
          <svg className="animate-spin h-8 w-8 mb-3 text-primary-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading transactions…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <div className="text-5xl mb-3">📭</div>
          <p>No {filter !== 'ALL' ? filter.toLowerCase() : ''} transactions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((tx) => (
            <div
              key={tx.id}
              className="card flex items-center justify-between gap-4 group hover:border-slate-700 transition-all duration-200"
            >
              {/* Icon */}
              <div className="w-11 h-11 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-xl flex-shrink-0">
                💸
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-slate-200">
                    To: <span className="text-primary-300">User #{tx.receiverId}</span>
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[tx.status] || STATUS_STYLES.PENDING}`}>
                    {tx.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tx.time ? new Date(tx.time).toLocaleString() : '—'} · ID: {tx.id}
                </p>
              </div>

              {/* Amount + Retry */}
              <div className="text-right flex-shrink-0">
                <p className="text-base font-bold text-red-400">-₹{tx.amount}</p>
                {tx.status === 'FAILED' && (
                  <button
                    onClick={() => handleRetry(tx.id)}
                    disabled={retrying === tx.id}
                    className="mt-1 text-xs px-3 py-1 rounded-lg bg-primary-500/20 border border-primary-500/30 text-primary-400 hover:bg-primary-500/30 transition-all disabled:opacity-50"
                  >
                    {retrying === tx.id ? '…' : '↩ Retry'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
