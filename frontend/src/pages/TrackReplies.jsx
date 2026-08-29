import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DEMO_REPLIES = [
  { id: 1, from: 'Sarah Chen', date: 'Today • 09:12', content: "Thanks for sending the proposal over! I reviewed the scope and we're ready to move forward. Can we schedule a call for next week to discuss pricing?", unread: true },
  { id: 2, from: 'Marcus Lee', date: 'Yesterday • 16:40', content: "Got it — I've added our comments to the doc. Let me know if the latest changes look good on your end.", unread: false },
  { id: 3, from: 'Olivia Park', date: 'Oct 21 • 14:05', content: "Replied to your email. Shared the updated brief in the attachment — happy to jump on a quick call if needed.", unread: false },
];

export const TrackReplies = () => {
  const navigate = useNavigate();
  const [replies, setReplies] = useState(DEMO_REPLIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/replies`, { credentials: 'include' })
      .then(res => res.text().then(t => { try { return t ? JSON.parse(t) : {}; } catch { return {}; } }))
      .then(data => {
        const arr = data.replies || data.messages || [];
        if (Array.isArray(arr) && arr.length > 0) {
          setReplies(arr.map((r, i) => ({
            id: r.id || i,
            from: r.from || r.sender || r.name || 'Unknown',
            date: r.received_at ? new Date(r.received_at).toLocaleString([], { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : (r.date || 'Today'),
            content: r.content || r.body || r.message || '',
            unread: r.unread || false
          })));
        } else {
          // keep demo if no real replies yet
          setReplies(DEMO_REPLIES);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FDF6F0] md:bg-[#FFFCF8] px-4 py-6 font-['Inter',sans-serif]">
      <div className="max-w-[760px] mx-auto">
        {/* Top bar */}
        <div className="bg-white border border-[#EDEDED] rounded-2xl px-4 py-4 shadow-sm mb-6">
          <button onClick={() => navigate('/dashboard')} className="inline-flex items-center justify-center w-10 h-10 border border-[#C9C9C9] rounded-xl bg-white hover:bg-[#FAFAFA] text-[#4B5563] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span className="ml-4 text-[15px] font-medium text-[#0A0A0A]">Back</span>
        </div>

        <h1 className="text-[40px] md:text-[56px] font-bold tracking-tight text-[#0A0A0A] leading-none">Track Replies</h1>
        <p className="text-[18px] md:text-[22px] text-[#9CA3AF] mt-1">See who replied</p>

        <div className="mt-6 space-y-4">
          {loading ? (
            <p className="text-center text-sm text-[#6B7280] py-12">Loading...</p>
          ) : replies.length === 0 ? (
            <p className="text-center text-sm text-[#6B7280] py-12">No replies yet. Send messages to get replies.</p>
          ) : (
            replies.map((r) => (
              <div key={r.id} className="bg-white border border-[#EDEDED] rounded-2xl p-5 md:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {r.unread && <span className="w-2.5 h-2.5 bg-[#10B981] rounded-full shrink-0"></span>}
                    <h3 className="text-[20px] md:text-[24px] font-bold tracking-tight text-[#0A0A0A]">{r.from}</h3>
                  </div>
                  <span className="text-[13px] md:text-[14px] text-[#6B7280] font-normal">{r.date}</span>
                </div>
                <p className="text-[14px] md:text-[15px] leading-[1.5] text-[#0A0A0A] mt-3 line-clamp-3">
                  {r.content.length > 180 ? r.content.substring(0, 180) + '...' : r.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};