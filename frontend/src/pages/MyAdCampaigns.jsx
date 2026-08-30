import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from '../lib/api';

export const MyAdCampaigns = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCampaigns = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/api/campaigns`, { headers: { Authorization: token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' }, credentials: 'include' });
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.campaigns || data.outcomes || []);
      setCampaigns(list.slice(0,12));
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, [getToken]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  return (
    <div className="min-h-screen bg-[#FFFCF8] px-3 sm:px-4 py-4 sm:py-6 font-['Inter',sans-serif] overflow-x-hidden w-full max-w-[100vw]">
      <div className="max-w-[760px] mx-auto w-full max-w-full">
        <div className="bg-white rounded-[20px] sm:rounded-[24px] border border-[#EDEDED]/60 shadow-sm p-4 sm:p-6 md:p-8 w-full overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-5 sm:mb-6">
            <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-1.5 sm:gap-2 border border-[#E0E0E0] rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[13px] sm:text-[15px] font-medium text-[#0A0A0A] bg-white hover:bg-[#FAFAFA] cursor-pointer shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="text-center flex-1 min-w-0 mx-2 sm:mx-4">
              <h1 className="text-[20px] sm:text-[28px] md:text-[34px] font-bold tracking-tight truncate">My Ad Campaigns</h1>
              <p className="text-[12px] sm:text-[13px] text-[#6B7280] mt-1">Client campaigns we ran on 4,671+ audience</p>
            </div>
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#5E17EB] rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-[12px] sm:text-[15px] font-semibold">AC</span>
            </div>
          </div>

          <div className="bg-[#F0EFFF] border border-[#DDD6FE] rounded-xl p-3 mb-4 text-center">
            <p className="text-[12px] font-bold text-[#5E17EB]">4,671+ Total Reach — 131 WhatsApp + 86 Cyber + 184 Telegram + 1,270 LinkedIn + 3K YouTube</p>
          </div>

          {loading ? (
            <p className="text-center text-sm text-[#6B7280] py-8">Loading campaigns...</p>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[#6B7280]">No campaigns yet. Your ad campaigns will appear here.</p>
              <p className="text-xs text-[#9CA3AF] mt-2">Max 12 campaigns in vault — oldest deleted when full</p>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map(c => (
                <div key={c.id} className="bg-white border border-[#EDEDED] rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] font-black truncate">{c.company_name || c.name || 'Campaign'}</h3>
                      <p className="text-[12px] text-[#6B7280] truncate">{c.industry || c.niche || 'Tech'} • {c.status || 'active'}</p>
                    </div>
                    <span className="text-[10px] font-black px-2 py-1 rounded-full bg-[#F0EFFF] text-[#5E17EB] shrink-0">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[12px] text-[#4B5563] mt-2 line-clamp-2">{c.shortDescription || c.content || 'Campaign delivered to 4,671+ audience'}</p>
                </div>
              ))}
            </div>
          )}
          <p className="text-center text-[11px] text-[#9CA3AF] mt-4">Max 12 campaigns — oldest removed when full • Vault save fixed</p>
        </div>
      </div>
    </div>
  );
};