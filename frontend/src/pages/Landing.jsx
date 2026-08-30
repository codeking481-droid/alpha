import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export const Landing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); setIsInstallable(true); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => { setIsInstallable(false); setDeferredPrompt(null); });
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { if (session?.user) navigate("/access"); });
  }, [navigate]);

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + "/access" } });
      if (error) { alert("Signup failed: " + error.message); setLoading(false); }
    } catch (e) { alert("Signup failed: " + e.message); setLoading(false); }
  };
  const handleLogin = () => handleGoogleSignup();
  const handleDownloadApp = async () => {
    if (deferredPrompt) { deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; if (outcome === "accepted") { setDeferredPrompt(null); setIsInstallable(false); } }
    else alert("To install:\n\n iPhone: Share → Add to Home Screen\n Android: ⋮ → Install app\n Desktop: Install icon in address bar");
  };

  return (
    <div className="min-h-screen bg-[#FFFCF8] font-['Inter',sans-serif] antialiased overflow-x-hidden w-full max-w-[100vw] selection:bg-[#5E17EB] selection:text-white">
      {/* NAV */}
      <div className="w-full px-2 sm:px-3 md:px-6 pt-3 md:pt-4 sticky top-0 z-50 bg-[#FFFCF8]/85 backdrop-blur-xl">
        <nav className="max-w-[1360px] mx-auto bg-white border border-[#EDEDED] rounded-xl sm:rounded-2xl md:rounded-[20px] px-3 sm:px-4 md:px-8 py-3 sm:py-3.5 md:py-4 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.06)] gap-2 w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-br from-[#5E17EB] to-[#7C3AED] rounded-xl md:rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(94,23,235,0.3)]">
              <span className="text-white text-[26px] md:text-[30px] font-black -mt-[2px]">α</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[22px] md:text-[28px] font-black tracking-[-0.02em] text-[#0A0A0A] leading-none">ALPHATEKX</span>
                <span className="hidden sm:inline text-[10px] font-black tracking-[0.14em] text-white bg-[#0A0A0A] px-2.5 py-1 rounded-full">ALPHA AGENCY OS</span>
              </div>
              <div className="hidden md:block text-[11px] font-bold text-[#5E17EB] tracking-wide -mt-0.5">REAL AUDIENCE 4,671+ • VERIFIED • LIVE</div>
            </div>
          </div>
          <div className="hidden xl:flex items-center gap-7">
            <a href="#audience" onClick={(e)=>{e.preventDefault(); document.getElementById('audience')?.scrollIntoView({behavior:'smooth'})}} className="text-[14px] font-bold text-[#0A0A0A] hover:text-[#5E17EB]">Audience</a>
            <a href="#offer" onClick={(e)=>{e.preventDefault(); document.getElementById('offer')?.scrollIntoView({behavior:'smooth'})}} className="text-[14px] font-bold text-[#0A0A0A] hover:text-[#5E17EB]">Offer</a>
            <a href="#pricing" onClick={(e)=>{e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})}} className="text-[14px] font-bold text-[#0A0A0A] hover:text-[#5E17EB]">Pricing</a>
            <button onClick={handleLogin} className="bg-white border-2 border-[#EDEDED] rounded-xl px-6 py-2.5 text-[14px] font-black hover:bg-gray-50">Log in</button>
            <button onClick={handleGoogleSignup} className="bg-[#5E17EB] hover:bg-[#4D0FD4] text-white rounded-xl px-7 py-3 text-[14px] font-black shadow-[0_6px_16px_rgba(94,23,235,0.3)]">Accept Offer - $250 →</button>
          </div>
          <button onClick={handleGoogleSignup} className="xl:hidden bg-[#5E17EB] hover:bg-[#4D0FD4] text-white rounded-xl px-4 sm:px-6 py-2.5 text-[13px] sm:text-[14px] font-black">Accept $250</button>
        </nav>
      </div>

      {/* HERO — REAL AUDIENCE + $250 */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-6 pt-6 md:pt-10 pb-6">
        <div className="text-center max-w-[900px] mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#FEF3C7] border border-[#FDE68A] rounded-full px-3 py-1 text-[11px] font-black text-[#92400E] mb-4">
            🔥 Founding Member - 7 spots left at $250 • Regular $500 after
          </div>
          <h1 className="text-[32px] sm:text-[40px] md:text-[56px] font-black tracking-[-0.03em] leading-[0.9] text-[#0A0A0A]">
            Advertise To Our <span className="bg-gradient-to-r from-[#5E17EB] to-[#7C3AED] bg-clip-text text-transparent">4,600+ Engaged Audience</span> + Get FREE System If You Accept
          </h1>
          <p className="mt-4 text-[14px] sm:text-[16px] md:text-[18px] leading-[1.5] text-[#4B5563] font-medium">
            Reach: WhatsApp 131 + Cybersecurity 86 + Telegram 184 + LinkedIn 1,270 + YouTube 3K = <strong className="text-[#0A0A0A]">4,671+</strong> targeted (Tech/Cybersecurity niche)
          </p>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <span style={{textDecoration:'line-through', color:'gray', fontSize:'20px'}}>$500</span>
            <span style={{color:'green', fontWeight:'bold', fontSize:'32px'}}>$250 Founding Member</span>
            <span className="text-[13px] font-bold text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A] rounded-full px-3 py-1">First 10 clients, 7 spots left!</span>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={handleGoogleSignup} disabled={loading} className="bg-[#5E17EB] hover:bg-[#4D0FD4] text-white rounded-2xl px-8 py-4 text-[16px] font-black flex items-center justify-center gap-3 shadow-[0_12px_28px_rgba(94,23,235,0.3)] disabled:opacity-60">
              <span className="w-7 h-7 bg-white rounded-full flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg></span>
              {loading ? "Connecting..." : "Accept Offer - $250 + Free System"}
              <span className="text-white/70">→</span>
            </button>
            <button onClick={handleDownloadApp} className="bg-white border-2 border-[#0A0A0A] text-[#0A0A0A] rounded-2xl px-8 py-4 text-[15px] font-black hover:bg-[#0A0A0A] hover:text-white">
              {isInstallable ? "📲 Install App" : "▶ See Audience"}
            </button>
          </div>
          <p className="mt-3 text-[11px] text-[#9CA3AF]">One-time $250 • Lifetime access • No subscription • Bonus only if accept</p>
        </div>
      </section>

      {/* AUDIENCE PROOF SECTION — 5 cards with real numbers */}
      <section id="audience" className="max-w-[1360px] mx-auto px-4 md:px-6 py-8">
        <div className="text-center">
          <p className="text-[#5E17EB] text-[11px] font-black tracking-[0.18em] uppercase">Real Audience We Own — No Fake Numbers</p>
          <h2 className="mt-2 text-[28px] md:text-[40px] font-black tracking-tight">4,671+ Targeted Reach</h2>
          <p className="mt-2 text-[#6B7280] text-[14px]">Tech & Cybersecurity niche — verified channels</p>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-[#EDEDED] rounded-2xl p-6 text-center hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-[#25D366] rounded-2xl flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2C6.55 2 2.07 6.47 2.07 11.95c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.82 9.82 0 0 0 4.78 1.22h.01c5.48 0 9.95-4.47 9.95-9.95 0-2.66-1.03-5.15-2.94-7.04zm-7.02 14.5h-.01a8.13 8.13 0 0 1-4.14-1.13l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.42 5.82c0 4.54-3.7 8.24-8.25 8.24z"/></svg>
            </div>
            <h3 className="mt-3 text-[16px] font-black">WhatsApp Channel</h3>
            <p className="text-[28px] font-black text-[#25D366] leading-none mt-1">131</p>
            <p className="text-[12px] font-bold text-[#6B7280]">Members</p>
          </div>
          <div className="bg-white border border-[#EDEDED] rounded-2xl p-6 text-center hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-[#0A0A0A] rounded-2xl flex items-center justify-center mx-auto">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
            </div>
            <h3 className="mt-3 text-[16px] font-black">Cybersecurity WhatsApp</h3>
            <p className="text-[28px] font-black text-[#0A0A0A] leading-none mt-1">86</p>
            <p className="text-[12px] font-bold text-[#6B7280]">Members</p>
          </div>
          <div className="bg-white border border-[#EDEDED] rounded-2xl p-6 text-center hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-[#229ED9] rounded-2xl flex items-center justify-center mx-auto">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
            </div>
            <h3 className="mt-3 text-[16px] font-black">Telegram</h3>
            <p className="text-[28px] font-black text-[#229ED9] leading-none mt-1">184</p>
            <p className="text-[12px] font-bold text-[#6B7280]">Members (115+69)</p>
          </div>
          <div className="bg-white border border-[#EDEDED] rounded-2xl p-6 text-center hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-[#0A66C2] rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-white text-[18px] font-black">in</span>
            </div>
            <h3 className="mt-3 text-[16px] font-black">LinkedIn</h3>
            <p className="text-[28px] font-black text-[#0A66C2] leading-none mt-1">1,270</p>
            <p className="text-[12px] font-bold text-[#6B7280]">500+ Connections + 770 Followers</p>
          </div>
          <div className="bg-white border border-[#EDEDED] rounded-2xl p-6 text-center hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-[#FF0000] rounded-2xl flex items-center justify-center mx-auto">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M23.5 12.1s-.2-2.4-.8-3.5c-.4-1-1-1.6-2-2-.9-.6-2.4-.8-3.5-.8H6.8c-1.1 0-2.6.2-3.5.8-1 .4-1.6 1-2 2C.7 9.7.5 12.1.5 12.1s-.2 2.4.4 3.5c.4 1 1 1.6 2 2 .9.6 2.4.8 3.5.8h10.4c1.1 0 2.6-.2 3.5-.8 1-.4 1.6-1 2-2 .6-1.1.8-3.5.8-3.5z"/><path d="M9.8 15.5l5.2-3.4-5.2-3.4z" fill="black"/></svg>
            </div>
            <h3 className="mt-3 text-[16px] font-black">YouTube</h3>
            <p className="text-[28px] font-black text-[#FF0000] leading-none mt-1">3,000+</p>
            <p className="text-[12px] font-bold text-[#6B7280]">Subscribers</p>
          </div>
        </div>
        <div className="mt-6 bg-gradient-to-r from-[#5E17EB] to-[#7C3AED] rounded-2xl p-4 text-center text-white">
          <p className="text-[16px] md:text-[20px] font-black">🔥 4,671+ Total Targeted Reach - Tech & Cybersecurity Audience</p>
          <p className="text-[11px] md:text-[12px] font-bold opacity-80 mt-1">131 WhatsApp + 86 Cybersecurity + 184 Telegram + 1,270 LinkedIn + 3,000 YouTube</p>
        </div>
      </section>

      {/* OFFER DETAILS $250 */}
      <section id="offer" className="max-w-[900px] mx-auto px-4 md:px-6 py-8">
        <div className="bg-white border-2 border-[#5E17EB] rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgba(94,23,235,0.15)]">
          <h2 className="text-[22px] md:text-[28px] font-black tracking-tight text-center">What You Get For $250 (Was $500)</h2>
          <p className="text-center text-[13px] text-[#6B7280] mt-1">One-time Founding Member — First 10 clients, 7 spots left!</p>
          <ul className="mt-6 space-y-3">
            <li className="flex gap-3 text-[14px] font-medium"><span className="w-6 h-6 rounded-full bg-[#5E17EB] flex items-center justify-center text-white text-[12px] shrink-0">✓</span><span>Advertisement to <strong>ALL</strong> our channels (131 WhatsApp, 86 Cybersecurity Group, 184 Telegram, 1,270 LinkedIn, 3K YouTube)</span></li>
            <li className="flex gap-3 text-[14px] font-medium"><span className="w-6 h-6 rounded-full bg-[#5E17EB] flex items-center justify-center text-white text-[12px] shrink-0">✓</span><span>Post + Story + Video Shoutout across all channels</span></li>
            <li className="flex gap-3 text-[14px] font-medium"><span className="w-6 h-6 rounded-full bg-[#5E17EB] flex items-center justify-center text-white text-[12px] shrink-0">✓</span><span>1 Week Promotion Campaign</span></li>
            <li className="flex gap-3 text-[14px] font-medium"><span className="w-6 h-6 rounded-full bg-[#5E17EB] flex items-center justify-center text-white text-[12px] shrink-0">✓</span><span>Campaign Report + Screenshots Proof</span></li>
            <li className="flex gap-3 text-[14px] font-medium"><span className="w-6 h-6 rounded-full bg-[#5E17EB] flex items-center justify-center text-white text-[12px] shrink-0">✓</span><span>Priority Support</span></li>
          </ul>
          <div className="mt-6 bg-[#F0EFFF] border border-[#DDD6FE] rounded-xl p-4 text-center">
            <p className="text-[13px] font-black text-[#5E17EB]">Founding Member Pricing</p>
            <div className="flex items-center justify-center gap-3 mt-1">
              <span style={{textDecoration:'line-through', color:'gray', fontSize:'18px'}}>$500</span>
              <span style={{color:'green', fontWeight:'bold', fontSize:'28px'}}>$250</span>
              <span className="text-[11px] font-black bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded-full">Save $250</span>
            </div>
            <p className="text-[11px] text-[#6B7280] mt-1">First 10 clients only — 7 spots left!</p>
          </div>
        </div>
      </section>

      {/* BONUS SECTION — CONDITIONAL */}
      <section className="max-w-[900px] mx-auto px-4 md:px-6 pb-8">
        <div className="bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] border-2 border-[#F59E0B] rounded-2xl p-6 md:p-8">
          <h2 className="text-[20px] md:text-[24px] font-black text-center">🎁 BONUS: ONE FREE System Of Your Choice - ONLY IF YOU ACCEPT OUR OFFER</h2>
          <p className="mt-3 text-[14px] leading-[1.6] text-[#92400E] text-center font-medium">
            If you accept our $250 advertisement offer, we will build you <strong>ONE FREE system</strong> of your choice - Any system you have in mind that you want to build. Not just website that sits there - System that actually <strong>DOES</strong> things for you!
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {t:"Booking System", d:"auto-books clients"},
              {t:"CRM System", d:"manages clients"},
              {t:"Inventory System", d:"tracks stock"},
              {t:"Payment System", d:"collects money"},
              {t:"Store System", d:"sells while you sleep"},
              {t:"Dashboard System", d:"shows business data"},
              {t:"Any custom system you want", d:"you imagine, we build"},
            ].map(x=>(
              <div key={x.t} className="bg-white border border-[#FDE68A] rounded-xl p-4 text-center">
                <div className="text-[14px] font-black text-[#0A0A0A]">{x.t}</div>
                <div className="text-[11px] text-[#6B7280]">({x.d})</div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-red-50 border-2 border-red-300 rounded-xl p-4">
            <p className="text-[13px] font-black text-red-700 text-center">⚠️ CONDITION: Free System bonus ONLY if you accept our $250 advertisement offer. If you reject our offer, we will NOT create any system for you. Bonus is for accepting clients only. No system if you reject.</p>
          </div>
          <div className="mt-6 text-center">
            <button onClick={handleGoogleSignup} className="bg-[#5E17EB] hover:bg-[#4D0FD4] text-white rounded-2xl px-8 py-4 text-[16px] font-black shadow-[0_8px_24px_rgba(245,158,11,0.3)]">Yes, Accept $250 Offer + Free System →</button>
            <p className="mt-2 text-[11px] font-bold text-[#92400E]">Reject = No bonus system. System only free when you accept.</p>
          </div>
        </div>
      </section>

      {/* PRICING — keep $250 founding */}
      <section id="pricing" className="max-w-[900px] mx-auto px-4 md:px-6 pb-8">
        <div className="bg-white border-2 border-[#5E17EB] rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgba(94,23,235,0.15)] text-center">
          <p className="text-[11px] font-black tracking-[0.14em] uppercase text-[#5E17EB]">🔥 Founding Member - 7 spots left</p>
          <div className="mt-2 flex items-center justify-center gap-3">
            <span style={{textDecoration:'line-through', color:'gray', fontSize:'20px'}}>$500</span>
            <span style={{color:'green', fontWeight:'bold', fontSize:'32px'}}>$250 Founding Member</span>
          </div>
          <p className="text-[13px] text-[#6B7280] mt-1">First 10 clients only — 7 spots left at $250! Regular $500 after.</p>
          <ul className="mt-4 text-left bg-[#F9FAFB] border border-[#EDEDED] rounded-lg p-4 space-y-2 text-[13px] font-medium max-w-[400px] mx-auto">
            <li>✓ 50 Verified Owner Emails (Apollo ✓, not info@) — REMOVED: Now shows Audience</li>
            <li>✓ Advertisement to 4,671+ audience (131+86+184+1270+3K)</li>
            <li>✓ Free System Bonus If You Accept</li>
            <li>✓ Inbox Reply Tracking + Hot Alerts</li>
          </ul>
          <p className="mt-2 text-[11px] text-[#9CA3AF]">Regular price $500 after 10 clients — Save $250 now!</p>
          <button onClick={handleGoogleSignup} className="mt-4 w-full bg-[#5E17EB] hover:bg-[#4D0FD4] text-white rounded-xl py-3.5 text-[14px] font-black">Get Started - $250 →</button>
          <p className="mt-2 text-[11px] font-bold text-[#5E17EB]">7 spots left at $250 — Regular $500 after</p>
        </div>
      </section>

      {/* FAQ — updated for $250 and bonus */}
      <section className="max-w-[900px] mx-auto px-4 md:px-6 pb-8">
        <div className="bg-white border border-[#EDEDED] rounded-2xl p-6">
          <h3 className="text-[18px] font-black">Questions? Clear answers.</h3>
          <div className="mt-4 space-y-4 text-[13px] leading-[1.6] text-[#4B5563]">
            <div><b className="text-[#0A0A0A]">What do I get for $250?</b> Advertisement to 4,671+ audience + Campaign Report + Bonus FREE system if you accept.</div>
            <div><b className="text-[#0A0A0A]">What system will you build free?</b> Any ONE system you want — Booking, CRM, Inventory, Payment, Store, Dashboard, or custom. Only if you accept $250 offer. No system if you reject.</div>
            <div><b className="text-[#0A0A0A]">Is audience real?</b> Yes: 131 WhatsApp + 86 Cybersecurity + 184 Telegram (115+69) + 1,270 LinkedIn + 3K YouTube = 4,671 verified.</div>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center border-t border-[#EDEDED] mt-2">
        <div className="max-w-[1360px] mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[12.5px] text-[#6B7280]">
            <span>© 2024 ALPHATEKX — Alpha Agency OS • 4,671+ Audience</span>
            <span className="flex gap-4"><a href="mailto:alphatekxcompany@gmail.com" className="hover:text-[#0A0A0A] font-bold">Contact</a> <span>•</span> <span className="text-[#5E17EB] font-black">Real data • No mock</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
};