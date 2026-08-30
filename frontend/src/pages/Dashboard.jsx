import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    localStorage.removeItem('master_unlocked');
    localStorage.removeItem('demo_hasAccess');
    await supabase.auth.signOut();
    navigate('/');
  };

  const displayName = user?.email?.split('@')[0] ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1) : 'Alex';
  const isAdmin = user?.email?.toLowerCase() === 'alphatekxcompany@gmail.com';

  return (
    <div className="min-h-screen bg-[#FFFCF8] px-3 sm:px-4 py-3 sm:py-4 font-['Inter',sans-serif] overflow-x-hidden w-full max-w-[100vw]">
      <div className="max-w-[1120px] mx-auto w-full max-w-full">
        {/* TOP NAV - Alpha OS */}
        <div className="bg-white border border-[#EDEDED] rounded-2xl px-3 sm:px-5 md:px-6 py-3 sm:py-4 flex items-center justify-between shadow-[0_2px_16px_rgba(0,0,0,0.04)] gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#5E17EB] rounded-xl flex items-center justify-center shrink-0">
              <span className="text-white text-[22px] sm:text-[26px] font-medium leading-none -mt-1">α</span>
            </div>
            <span className="text-[20px] sm:text-[28px] md:text-[30px] font-bold tracking-tight text-[#0A0A0A] truncate">Alpha OS</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="hidden sm:inline text-[13px] md:text-[15px] text-[#0A0A0A] font-normal truncate max-w-[140px]">Welcome back, {displayName}</span>
            <span className="sm:hidden text-[12px] text-[#0A0A0A] truncate max-w-[80px]">Hi, {displayName}</span>
            <button onClick={handleLogout} className="inline-flex items-center gap-1 text-xs sm:text-sm text-[#6B7280] hover:text-[#0A0A0A] border border-[#EDEDED] px-2.5 sm:px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAFAFA] transition-colors shrink-0">
              <span className="hidden sm:inline">Logout</span><span className="sm:hidden">Out</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="hidden sm:block">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>

        {/* DASHBOARD HEADER */}
        <div className="mt-5 sm:mt-7 md:mt-8 mb-4 sm:mb-5 px-1">
          <h1 className="text-[24px] sm:text-[28px] md:text-[36px] font-bold tracking-tight text-[#0A0A0A] leading-none break-words">Dashboard</h1>
          <p className="text-[13px] sm:text-[14px] md:text-[15px] text-[#6B7280] mt-1.5 leading-snug break-words">Advertisement & Marketing Platform — manage outreach and track performance</p>
        </div>

        {/* 4 CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
          {/* My Ad Campaigns - Lavender */}
          <button
            onClick={() => navigate('/my-ad-campaigns')}
            className="relative bg-[#F0EFFF] border border-[#E0D9FF] rounded-2xl p-6 text-left hover:shadow-md transition-all hover:scale-[1.02] overflow-hidden group"
          >
            <div className="w-10 h-10 bg-[#EDE8FF] rounded-xl flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5E17EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M15.3 15.3L20 20" />
              </svg>
            </div>
            <h3 className="text-[24px] md:text-[28px] font-bold tracking-tight text-[#0A0A0A] leading-none">My Ad Campaigns</h3>
            <p className="text-[13px] md:text-[14px] text-[#0A0A0A]/80 mt-2 leading-tight">Client ad campaigns we ran on 4,671+ audience</p>
            <span className="absolute bottom-5 right-5 w-8 h-8 rounded-full border border-[#C4B5FD] bg-[#F0EFFF] flex items-center justify-center text-[#5E17EB] group-hover:bg-white transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7" />
                <polyline points="8 7 17 7 17 16" />
              </svg>
            </span>
          </button>

          {/* Vault - Saved Companies */}
          <button onClick={() => navigate('/saved-companies')} className="relative bg-[#EDE8FF] border border-[#C4B5FD] rounded-2xl p-6 text-left hover:shadow-md transition-all hover:scale-[1.02] overflow-hidden group">
            <div className="w-10 h-10 bg-[#5E17EB] rounded-xl flex items-center justify-center mb-4"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg></div>
            <h3 className="text-[24px] md:text-[28px] font-bold tracking-tight text-[#0A0A0A] leading-none">Vault</h3>
            <p className="text-[13px] md:text-[14px] text-[#6B7280] mt-2 leading-tight">Saved companies — send email via Resend, track replies, close $250 Founding deal</p>
            <span className="absolute bottom-5 right-5 w-8 h-8 rounded-full border border-[#C4B5FD] bg-[#F0EFFF] flex items-center justify-center text-[#5E17EB] group-hover:bg-white transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><polyline points="8 7 17 7 17 16"/></svg>
            </span>
          </button>
          {/* Send Messages - Cream/Yellow */}
          <button
            onClick={() => navigate('/send-messages')}
            className="bg-[#FFF6D6] border border-[#FDE68A]/80 rounded-2xl p-6 text-left hover:shadow-md transition-all hover:scale-[1.02]"
          >
            <div className="w-10 h-10 bg-[#FFF1B8] rounded-xl flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h3 className="text-[24px] md:text-[28px] font-bold tracking-tight text-[#0A0A0A] leading-none">Send Messages</h3>
            <p className="text-[13px] md:text-[14px] text-[#0A0A0A]/80 mt-2 leading-tight">Reach out to prospects with personalized messages</p>
          </button>

          {/* Track Replies - Mint */}
          <button
            onClick={() => navigate('/track-replies')}
            className="bg-[#E6FFF0] border border-[#BBF7D0] rounded-2xl p-6 text-left hover:shadow-md transition-all hover:scale-[1.02]"
          >
            <div className="w-10 h-10 bg-[#D1FAE5] rounded-xl flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 20V10" />
                <path d="M12 20V4" />
                <path d="M6 20v-6" />
                <rect x="2" y="18" width="4" height="3" rx="1" />
                <rect x="8" y="13" width="4" height="8" rx="1" />
                <rect x="14" y="8" width="4" height="13" rx="1" />
              </svg>
            </div>
            <h3 className="text-[24px] md:text-[28px] font-bold tracking-tight text-[#0A0A0A] leading-none">Track Replies</h3>
            <p className="text-[13px] md:text-[14px] text-[#0A0A0A]/80 mt-2 leading-tight">Monitor responses and engagement performance</p>
          </button>

          {/* Inbox / Hot Leads */}
          <button onClick={() => navigate('/inbox')} className="bg-[#FFF6E5] border border-[#FDE68A]/80 rounded-2xl p-6 text-left hover:shadow-md transition-all hover:scale-[1.02] overflow-hidden group">
            <div className="w-10 h-10 bg-[#B45309] rounded-xl flex items-center justify-center mb-4"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg></div>
            <h3 className="text-[24px] md:text-[28px] font-bold tracking-tight text-[#0A0A0A] leading-none">Inbox</h3>
            <p className="text-[13px] md:text-[14px] text-[#6B7280] mt-2 leading-tight">Hot leads + YES follow-up approval + Telegram 113 alert</p>
            <span className="absolute bottom-5 right-5 w-8 h-8 rounded-full border border-[#FDE68A] bg-[#FFF6E5] flex items-center justify-center text-[#B45309] group-hover:bg-white transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><polyline points="8 7 17 7 17 16"/></svg>
            </span>
          </button>
          {/* Campaigns - Violet MONEY MAKER */}
          <button
            onClick={() => navigate('/campaigns')}
            className="bg-[#5E17EB] border border-[#5E17EB] rounded-2xl p-6 text-left hover:shadow-md transition-all hover:scale-[1.02] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-[22px] md:text-[24px] font-bold tracking-tight text-white leading-none">Campaigns</h3>
                <span className="bg-white text-[#5E17EB] text-[11px] font-bold tracking-wide px-3 py-1 rounded-full">MONEY MAKER</span>
              </div>
            </div>
            <p className="text-[22px] md:text-[28px] font-bold tracking-tight text-white leading-none mt-6">THE MONEY MAKER</p>
          </button>

          {/* API Tokens - Blue (Admin Only) */}
          {isAdmin && (
          <button
            onClick={() => navigate('/api-tokens')}
            className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-6 text-left hover:shadow-md transition-all hover:scale-[1.02]"
          >
            <div className="w-10 h-10 bg-[#DBEAFE] rounded-xl flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <h3 className="text-[24px] md:text-[28px] font-bold tracking-tight text-[#0A0A0A] leading-none">API Tokens</h3>
            <p className="text-[13px] md:text-[14px] text-[#0A0A0A]/80 mt-2 leading-tight">Generate tokens for team members to access the API</p>
          </button>
          )}
          {/* Settings - Telegram & Groq 120B */}
          <button
            onClick={() => navigate('/settings')}
            className="bg-[#F9FAFB] border border-[#EDEDED] rounded-2xl p-6 text-left hover:shadow-md transition-all hover:scale-[1.02]"
          >
            <div className="w-10 h-10 bg-[#0A0A0A] rounded-xl flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            </div>
            <h3 className="text-[24px] md:text-[28px] font-bold tracking-tight text-[#0A0A0A] leading-none">Settings</h3>
            <p className="text-[13px] md:text-[14px] text-[#0A0A0A]/80 mt-2 leading-tight">Telegram hot leads & Groq 120B model</p>
          </button>
        </div>

        {/* TODAY'S GOAL */}
        <div className="mt-4 bg-white border border-[#EDEDED] rounded-2xl p-4 sm:p-5 md:p-6 w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
            <h3 className="font-bold text-[16px] sm:text-[18px] md:text-[20px] text-[#0A0A0A] tracking-tight">Today's Goal</h3>
            <span className="text-[11px] sm:text-[12px] md:text-[13px] text-[#6B7280]">Updated 10 min ago • Oct 5, 2024</span>
          </div>
          <div className="grid grid-cols-3 divide-x divide-[#EDEDED]">
            <div className="text-center px-1 sm:px-2 md:px-4 min-w-0">
              <div className="text-[10px] sm:text-[12px] md:text-[13px] text-[#6B7280] font-medium leading-tight">Companies Found</div>
              <div className="text-[22px] sm:text-[30px] md:text-[44px] font-bold text-[#0A0A0A] leading-none mt-1 break-words">24</div>
              <div className="inline-flex items-center justify-center gap-1 text-[10px] sm:text-[11px] md:text-[13px] text-[#059669] font-medium mt-1.5 leading-none">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="hidden sm:block"><path d="M7 17L17 7"/><polyline points="8 7 17 7 17 16"/></svg>
                <span className="hidden sm:inline">+6 from yesterday</span><span className="sm:hidden">+6</span>
              </div>
            </div>
            <div className="text-center px-1 sm:px-2 md:px-4 min-w-0">
              <div className="text-[10px] sm:text-[12px] md:text-[13px] text-[#6B7280] font-medium leading-tight">Messages Sent</div>
              <div className="text-[22px] sm:text-[30px] md:text-[44px] font-bold text-[#0A0A0A] leading-none mt-1 break-words">128</div>
              <div className="inline-flex items-center justify-center gap-1 text-[10px] sm:text-[11px] md:text-[13px] text-[#059669] font-medium mt-1.5 leading-none">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="hidden sm:block"><path d="M7 17L17 7"/><polyline points="8 7 17 7 17 16"/></svg>
                <span className="hidden sm:inline">+32 from yesterday</span><span className="sm:hidden">+32</span>
              </div>
            </div>
            <div className="text-center px-1 sm:px-2 md:px-4 min-w-0">
              <div className="text-[10px] sm:text-[12px] md:text-[13px] text-[#6B7280] font-medium leading-tight">Earned</div>
              <div className="text-[22px] sm:text-[30px] md:text-[44px] font-bold text-[#0A0A0A] leading-none mt-1 break-words">$4,280</div>
              <div className="inline-flex items-center justify-center gap-1 text-[10px] sm:text-[11px] md:text-[13px] text-[#059669] font-medium mt-1.5 leading-none">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="hidden sm:block"><path d="M7 17L17 7"/><polyline points="8 7 17 7 17 16"/></svg>
                <span className="hidden sm:inline">+$720 from yesterday</span><span className="sm:hidden">+$720</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};