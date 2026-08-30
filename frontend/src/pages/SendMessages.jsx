import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from '../lib/api';

export const SendMessages = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [company, setCompany] = useState('');
  const [subject, setSubject] = useState('Quick idea for your company — 4,500+ audience feature?');
  const [message, setMessage] = useState(`Hi {{first_name}},

Saw your company — great work in your space. We run 4,500+ audience (3K YouTube, 1,270 LinkedIn, 500 connections, 184 Telegram, 131 WhatsApp, 86 cyber) and feature brands done-for-you.

Can we feature your company? Reply YES and we handle everything — no call needed.

— Alpha Agency ($250 Founding)`);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setStatus('');
    if (!company.trim() || !message.trim() || !subject.trim()) {
      setStatus('Please fill in company email, subject and message');
      setStatusType('error');
      return;
    }
    if (!company.includes('@')) {
      setStatus('Enter a valid company email');
      setStatusType('error');
      return;
    }
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/api/outreach/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        credentials: 'include',
        body: JSON.stringify({ to: company.trim(), subject: subject.trim(), html: message, text: message })
      });
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text }; }
      if (res.ok && (data.success || data.sent || data.message)) {
        setStatus('Sent via Resend — check Inbox for replies + Telegram alert');
        setStatusType('success');
        setCompany('');
      } else {
        setStatus(data.error || `Failed ${res.status}. Check RESEND_API_KEY in Worker secrets.`);
        setStatusType('error');
      }
    } catch (e) {
      setStatus(e.message);
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFCF8] px-3 sm:px-4 py-4 sm:py-6 font-['Inter',sans-serif]">
      <div className="max-w-[760px] mx-auto">
        {/* Header */}
        <div className="bg-white border border-[#EDEDED] rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm mb-6">
          <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-1.5 border border-[#E5E7EB] rounded-full px-3 py-1.5 text-[13px] font-medium bg-white hover:bg-[#F9FAFB]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg> Back
          </button>
          <div className="text-center">
            <h1 className="text-[16px] font-black leading-none">Send Messages</h1>
            <p className="text-[11px] text-[#6B7280]">Resend • Vault → Inbox → Telegram</p>
          </div>
          <button onClick={() => navigate('/saved-companies')} className="text-[13px] font-bold bg-[#0A0A0A] text-white rounded-full px-4 py-1.5">Vault</button>
        </div>

        <div className="bg-white border border-[#EDEDED] rounded-[20px] p-5 md:p-7 shadow-sm">
          <h2 className="text-[18px] font-black text-center">Cold outreach that gets replies</h2>
          <p className="text-center text-[13px] text-[#6B7280] mt-1">Best flow: Search → Save to Vault → Send from Vault (tracked). This is quick send.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-[12px] font-bold tracking-wide text-[#0A0A0A]">Company email *</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="owner@company.com" className="mt-1.5 w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-[14px] focus:border-[#5E17EB] focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/10" />
            </div>
            <div>
              <label className="text-[12px] font-bold tracking-wide text-[#0A0A0A]">Subject *</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="mt-1.5 w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-[14px] focus:border-[#5E17EB] focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/10" />
              <p className="text-[11px] text-[#9CA3AF] mt-1">Keep under 50 chars. Avoid “call / meeting”.</p>
            </div>
            <div>
              <label className="text-[12px] font-bold tracking-wide text-[#0A0A0A]">Message *</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={7} className="mt-1.5 w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-[13px] leading-[1.6] focus:border-[#5E17EB] focus:outline-none focus:ring-2 focus:ring-[#5E17EB]/10 bg-[#FFFEFB] resize-none" />
              <div className="flex justify-between text-[11px] text-[#9CA3AF] mt-1"><span>Use {"{{first_name}}"} if templated</span><span>{message.length} chars</span></div>
            </div>

            <button onClick={handleSend} disabled={loading} className="w-full bg-[#0A0A0A] hover:bg-black text-white rounded-xl py-3.5 text-[14px] font-bold disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Sending via Resend...' : 'Send Message →'}
            </button>

            {status && (
              statusType === 'success' ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex gap-3">
                  <span className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-[12px]">✓</span>
                  <div><div className="text-[13px] font-bold text-emerald-800">Sent!</div><div className="text-[12px] text-emerald-700">{status}</div></div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-[13px] font-medium">{status}</div>
              )
            )}

            <div className="bg-[#F0EFFF] border border-[#DDD6FE] rounded-xl p-3">
              <p className="text-[11px] font-bold text-[#5E17EB]">Tip</p>
              <p className="text-[12px] text-[#4B5563] leading-snug">For full tracking (hot → won $250 + Telegram), send from <button onClick={() => navigate('/saved-companies')} className="font-bold underline">Vault</button> — it deduplicates domain and sets follow-up approval.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

