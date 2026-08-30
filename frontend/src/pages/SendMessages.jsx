import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../lib/api';

export const SendMessages = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState('');
  const [subject, setSubject] = useState('Quick 15-min chat to 3x your replies?');
  const [message, setMessage] = useState(`Hi {{first_name}}, I noticed {company} is expanding its design team and hiring for product roles.

I'm reaching out because Alpha Agency partners with sales teams to improve cold outreach response rates — we recently helped a similar company increase replies by 40% within the first 30 days using tailored messaging.

Would you be open to a quick 15-min chat next week to see if this could be useful for your team?`);
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
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/outreach/send'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ to: company, subject, html: message, text: message })
      });
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text }; }
      if (res.ok && (data.success || data.sent || data.message)) {
        setStatus('Message sent successfully! Your cold outreach is on its way.');
        setStatusType('success');
      } else {
        setStatus(data.error || 'Failed to send. Check RESEND_API_KEY in Worker secrets.');
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
    <div className="min-h-screen bg-[#FFFCF8] px-3 sm:px-4 py-4 sm:py-6 font-['Inter',sans-serif] overflow-x-hidden w-full max-w-[100vw]">
      <div className="max-w-[760px] mx-auto w-full max-w-full">
        <div className="bg-white border border-[#EDEDED] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-3 flex items-center justify-between shadow-sm mb-4 sm:mb-6 gap-2 w-full max-w-full overflow-hidden">
          <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-1 sm:gap-1.5 bg-[#F3F3F3] hover:bg-[#EBEBEB] text-[#0A0A0A] border border-[#E5E7EB] rounded-full px-3 sm:px-4 py-1.5 text-[12px] sm:text-[14px] font-medium transition-colors cursor-pointer shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 border border-[#0A0A0A] rounded-lg flex items-center justify-center shrink-0">
              <div className="flex gap-1"><div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#0A0A0A] rounded-full"></div><div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#0A0A0A] rounded-full"></div></div>
            </div>
            <span className="text-[16px] sm:text-[20px] font-bold tracking-tight text-[#0A0A0A] truncate">Alpha</span><span className="hidden sm:inline text-[16px] sm:text-[20px] font-normal text-[#0A0A0A]">Agency</span>
          </div>
          <div className="w-10 sm:w-16 shrink-0" />
        </div>

        <div className="bg-white border border-[#EDEDED] rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 md:p-8 shadow-sm w-full max-w-full overflow-hidden">
          <h1 className="text-[24px] sm:text-[32px] md:text-[42px] font-bold tracking-tight text-[#0A0A0A] text-center leading-none break-words">Send Messages</h1>
          <p className="text-center text-[14px] sm:text-[16px] md:text-[18px] text-[#6B7280] mt-2 px-2">Cold outreach that gets replies.</p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="text-[15px] font-medium text-[#0A0A0A]">Company email</label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="company@example.com"
                className="mt-1.5 w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-[15px] text-[#0A0A0A] placeholder:text-[#9CA3AF] focus:border-[#5E17EB] focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="text-[15px] font-medium text-[#0A0A0A]">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject line"
                className="mt-1.5 w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-[15px] text-[#0A0A0A] placeholder:text-[#9CA3AF] focus:border-[#5E17EB] focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="text-[15px] font-medium text-[#0A0A0A]">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="mt-1.5 w-full border border-[#E5E7EB] rounded-xl px-4 py-4 text-[14px] leading-[1.6] text-[#0A0A0A] focus:border-[#5E17EB] focus:outline-none bg-[#FAFAFA] md:bg-[#F9F9F7] resize-none"
              />
            </div>

            <button onClick={handleSend} disabled={loading} className="w-full bg-[#0A0A0A] hover:bg-black text-white rounded-xl py-4 text-[16px] font-medium transition-colors disabled:opacity-60 cursor-pointer">
              {loading ? 'Sending...' : 'Send Message'}
            </button>

            {status && (
              statusType === 'success' ? (
                <div className="mx-auto max-w-[420px] bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-7 h-7 bg-[#10B981] rounded-full flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <div className="text-left">
                    <div className="text-[14px] font-semibold text-[#065F46]">Message sent successfully!</div>
                    <div className="text-[13px] text-[#047857]">Your cold outreach is on its way.</div>
                  </div>
                </div>
              ) : (
                <p className={`text-center text-sm ${statusType==='error' ? 'text-red-600' : 'text-green-600'}`}>{status}</p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
