import { useState, useEffect } from 'react';
import { ClientStats } from '../components/client/ClientStats';
import { ClientChart } from '../components/client/ClientChart';
import { API_URL } from '../lib/api.js';

export const ClientDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [outcomes, setOutcomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('alpha.token') || '';
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(`${API_URL}/api/client/stats`, {
        headers,
        credentials: 'include',
      });
      const data = await response.json().catch(() => ({}));
      if (data.success) {
        setSummary(data.summary);
        setOutcomes(data.outcomes || []);
      } else if (data.summary) {
        setSummary(data.summary);
        setOutcomes(data.outcomes || []);
      } else {
        setError(data.error || 'Failed to load client data');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0215]">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0215] p-6">
        <div className="glass p-8 text-center max-w-md">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-gray-400">{error}</p>
          <p className="text-gray-500 text-sm mt-4">Please contact your account manager for access.</p>
          <button onClick={fetchClientData} className="mt-6 px-6 py-2 rounded-xl bg-[#FFD700] text-[#0B0215] font-black text-xs tracking-widest uppercase">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0215] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFD700] flex items-center justify-center text-[#0B0215]">👁️</div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">YOUR DASHBOARD</h1>
            <p className="text-gray-400 text-sm">Here's a summary of your results — read-only, real-time.</p>
          </div>
          <button onClick={fetchClientData} className="ml-auto text-xs px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">Refresh</button>
        </div>

        {summary && <ClientStats summary={summary} />}

        <div className="mt-8">
          <ClientChart outcomes={outcomes} />
        </div>

        {outcomes.length > 0 && (
          <div className="glass p-6 mt-8">
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/60">Recent Outcomes</h3>
            <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
              {outcomes.slice(0,10).map(o=> (
                <div key={o.id} className="bg-[#0B0215] border border-white/10 rounded-xl p-3 flex items-center gap-3 text-sm">
                  <span className="text-white/60 truncate flex-1">{(o.client_id || o.clientId || o.campaign_id || o.campaignId || '—')} — ${Number(o.revenue||0).toLocaleString()} / ${Number(o.cost||0).toLocaleString()} → {(Number(o.roi)||0).toFixed(1)}% ROI</span>
                  <span className="text-xs text-white/30">{o.created_at ? new Date(o.created_at).toLocaleDateString() : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Data updated in real-time. Questions? Contact your account manager.</p>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
