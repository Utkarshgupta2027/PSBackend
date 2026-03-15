import React, { useState } from 'react';
import { addMoney } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function AddMoneyPage() {
  const { user, login, token } = useAuth();
  const [amount, setAmount]   = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!user?.id) {
      setError('User ID not found. Please log in again.');
      return;
    }
    setLoading(true);
    try {
      const res = await addMoney({ userId: user.id, amount: Number(amount) });
      // Backend returns updated User object
      const updatedUser = res.data;
      login(token, updatedUser); // refresh stored user with new balance
      setSuccess(`₹${amount} added! New balance: ₹${updatedUser.balance}`);
      setAmount('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add money. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Add Money</h1>
        <p className="text-slate-400 mt-1">Top up your wallet balance</p>
      </div>

      {/* Balance card */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-primary-600 to-primary-900 border border-primary-500/30 shadow-xl shadow-primary-900/40 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-10 translate-x-10" />
        <p className="text-primary-200 text-sm font-medium mb-1">Current Balance</p>
        <h2 className="text-4xl font-bold text-white">₹ {user?.balance ?? '—'}</h2>
        <p className="text-primary-300 text-sm mt-2">{user?.name || user?.email}</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Amount to Add (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold select-none">₹</span>
              <input
                id="add-amount"
                type="number"
                min="1"
                step="0.01"
                className="input-field pl-8"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Quick amounts */}
          <div>
            <p className="label">Quick add</p>
            <div className="grid grid-cols-4 gap-2">
              {[200, 500, 1000, 2000, 5000, 10000, 20000, 50000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className="py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm hover:bg-slate-700 hover:border-primary-600 hover:text-primary-300 transition-all"
                >
                  ₹{val >= 1000 ? `${val / 1000}k` : val}
                </button>
              ))}
            </div>
          </div>

          {error   && <div className="error-box">⚠️ {error}</div>}
          {success && <div className="success-box">✅ {success}</div>}

          <button id="add-submit" type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Adding…
              </span>
            ) : '➕ Add Money'}
          </button>
        </form>
      </div>
    </div>
  );
}
