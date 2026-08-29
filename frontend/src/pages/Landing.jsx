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
    <div className="min-h-screen bg-[#FFFCF8] font-['Inter',sans-serif] antialiased overflow-x-hidden selection:bg-[#5E17EB] selection:text-white">
      {/* NAV */}
      <div className="w-full px-3 md:px-6 pt-3 md:pt-4 sticky top-0 z-50 bg-[#FFFCF8]/85 backdrop-blur-xl">
        <nav className="max-w-[1360px] mx-auto bg-white border border-[#EDEDED] rounded-2xl md:rounded-[20px] px-4 md:px-8 py-3.5 md:py-4 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-br from-[#5E17EB] to-[#7C3AED] rounded-xl md:rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(94,23,235,0.3)]">
              <span className="text-white text-[26px] md:text-[30px] font-black -mt-[2px]">α</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[22px] md:text-[28px] font-black tracking-[-0.02em] text-[#0A0A0A] leading-none">ALPHATEKX</span>
                <span className="hidden sm:inline text-[10px] font-black tracking-[0.14em] text-white bg-[#0A0A0A] px-2.5 py-1 rounded-full">ALPHA AGENCY OS</span>
              </div>
              <div className="hidden md:block text-[11px] font-bold text-[#5E17EB] tracking-wide -mt-0.5">REAL COMPANIES • VERIFIED EMAILS • LIVE</div>
            </div>
          </div>
          <div className="hidden xl:flex items-center gap-7">
            <a href="#platform" onClick={(e)=>{e.preventDefault(); document.getElementById('platform')?.scrollIntoView({behavior:'smooth'})}} className="text-[14px] font-bold text-[#0A0A0A] hover:text-[#5E17EB]">Platform</a>
            <a href="#how-it-works" onClick={(e)=>{e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({behavior:'smooth'})}} className="text-[14px] font-bold text-[#0A0A0A] hover:text-[#5E17EB]">How it works</a>
            <a href="#pricing" onClick={(e)=>{e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})}} className="text-[14px] font-bold text-[#0A0A0A] hover:text-[#5E17EB]">Pricing</a>
            <button onClick={handleLogin} className="bg-white border-2 border-[#EDEDED] rounded-xl px-6 py-2.5 text-[14px] font-black hover:bg-gray-50">Log in</button>
            <button onClick={handleGoogleSignup} className="bg-[#0A0A0A] hover:bg-black text-white rounded-xl px-7 py-3 text-[14px] font-black shadow-[0_6px_16px_rgba(0,0,0,0.15)]">Get access — $50 →</button>
          </div>
          <button onClick={handleLogin} className="xl:hidden bg-[#0A0A0A] text-white rounded-xl px-6 py-2.5 text-[14px] font-black">Get access</button>
        </nav>
      </div>

      {/* HERO — PUBLIC $50 */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-6 pt-6 md:pt-10 pb-6">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6 md:gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2.5 bg-white border border-[#EDEDED] rounded-full pl-1.5 pr-4 py-1.5 text-[11px] md:text-[12px] font-black tracking-wide shadow-sm">
              <span className="bg-[#5E17EB] text-white rounded-full px-2.5 py-1 text-[10px] font-black">● LIVE</span>
              10,420+ REAL COMPANIES FOUND • VERIFIED VIA APOLLO + HUNTER
            </div>
            <h1 className="mt-6 text-[42px] md:text-[62px] lg:text-[74px] font-black tracking-[-0.045em] leading-[0.85] text-[#0A0A0A]">
              Find Real<br />
              <span className="bg-gradient-to-r from-[#5E17EB] via-[#7C3AED] to-[#A78BFA] bg-clip-text text-transparent">Companies.</span><br />
              <span className="text-[28px] md:text-[36px] font-bold tracking-tight text-[#0A0A0A]/60">Get their verified emails.</span>
            </h1>
            <p className="mt-5 text-[17px] md:text-[19px] leading-[1.5] text-[#4B5563] max-w-[620px] font-medium">
              AlphaTekX finds <b className="text-[#0A0A0A]">real brands</b> with Apollo + Hunter verified emails. You get company, website, owner, email, product — and create what they ask for. <b className="text-[#0A0A0A]">No guesswork, no fake lists.</b>
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
              <span className="bg-[#F0EFFF] text-[#5E17EB] border border-[#DDD6FE] rounded-full px-3 py-1">113 TELEGRAM</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1">3K YOUTUBE</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1">130 WHATSAPP</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1">85 CYBER</span>
              <span className="bg-[#5E17EB] text-white border border-[#DDD6FE] rounded-full px-3 py-1">700+ LINKEDIN</span>
              <span className="bg-[#5E17EB] text-white border border-[#DDD6FE] rounded-full px-3 py-1">LIVE</span>
            </div>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <button onClick={handleGoogleSignup} disabled={loading} className="bg-[#0A0A0A] hover:bg-black text-white rounded-2xl px-8 py-4 text-[16px] font-black flex items-center justify-center gap-3 shadow-[0_12px_28px_rgba(0,0,0,0.18)] disabled:opacity-60">
                <span className="w-7 h-7 bg-white rounded-full flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg></span>
                {loading ? "Connecting..." : "Start with Google — $50"}
                <span className="text-white/70">→</span>
              </button>
              <button onClick={handleDownloadApp} className="bg-white border-2 border-[#0A0A0A] text-[#0A0A0A] rounded-2xl px-8 py-4 text-[15px] font-black hover:bg-[#0A0A0A] hover:text-white">
                {isInstallable ? "📲 Install App" : "▶ See how it works"}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
              <span className="bg-[#F0EFFF] text-[#5E17EB] border border-[#DDD6FE] rounded-full px-3 py-1">✓ Apollo verified</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1">✓ Hunter checked</span>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1">✓ CSV import • Dedupe</span>
            </div>
            <p className="mt-3 text-[12px] text-[#9CA3AF]">Pay $50 once → Find companies → Get emails → Create & deliver. Cancel anytime.</p>
          </div>

          {/* MOCK — PUBLIC FINDER */}
          <div className="relative">
            <div className="bg-white border border-[#E5E7EB] rounded-[24px] md:rounded-[28px] shadow-[0_24px_64px_rgba(0,0,0,0.12)] overflow-hidden">
              <div className="bg-[#0A0A0A] px-4 md:px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#FF5F56] rounded-full"/><span className="w-3 h-3 bg-[#FFBD2E] rounded-full"/><span className="w-3 h-3 bg-[#27C93F] rounded-full"/>
                </div>
                <span className="text-white/80 text-[11px] font-bold tracking-wide">alphatekx.name.ng — LIVE FINDER</span>
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"/>
              </div>
              <div className="p-4 md:p-6 bg-[#FFFCF8]">
                <div className="bg-white border border-[#EDEDED] rounded-2xl p-3 flex items-center gap-3">
                  <span className="text-[#9CA3AF]">🔍</span>
                  <span className="text-[14px] font-bold text-[#0A0A0A]">skincare USA ×20</span>
                  <span className="ml-auto bg-[#0A0A0A] text-white rounded-full px-3 py-1 text-[11px] font-black">Search</span>
                </div>
                <div className="mt-4 space-y-2">
                  {[
                    {n:"Glow Skin Co", w:"glowskin.co", e:"sarah@glowskin.co", s:"Hunter ✓"},
                    {n:"Pure Botanics", w:"purebotanics.com", e:"hello@purebotanics.com", s:"Apollo ✓"},
                    {n:"Luxe Beauty Lab", w:"luxebeauty.co", e:"info@luxebeauty.co", s:"Verified"},
                  ].map(r=>(
                    <div key={r.n} className="bg-white border border-[#EDEDED] rounded-xl p-3 flex items-center justify-between">
                      <div><div className="text-[13px] font-black">{r.n}</div><div className="text-[11px] text-[#6B7280]">{r.w} • {r.e}</div></div>
                      <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full">{r.s}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-bold text-center">
                  <span className="bg-white border rounded-full py-2">Apollo ✅</span>
                  <span className="bg-white border rounded-full py-2">Hunter ✅</span>
                  <span className="bg-white border rounded-full py-2">No fake</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-[#0A0A0A] text-white rounded-2xl px-4 py-3 shadow-xl hidden md:block">
              <div className="text-[11px] font-bold opacity-60">YOU GET</div>
              <div className="text-[13px] font-black">Company • Owner • Email • Product</div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-6 py-4">
        <p className="text-center text-[10px] md:text-[11px] font-black tracking-[0.16em] text-[#9CA3AF] uppercase">For founders who need real leads, not scraped junk</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2 md:gap-3">
          {["SKINCARE","FITNESS","SHOPIFY","SAAS","AMAZON","COACHING","REAL ESTATE","CLINICS","E-COM","LOCAL"].map(t=>(
            <span key={t} className="bg-white border border-[#EDEDED] rounded-full px-3.5 md:px-4 py-1.5 md:py-2 text-[11px] md:text-[12px] font-black tracking-wide text-[#0A0A0A]/70">{t}</span>
          ))}
        </div>
      </section>

      {/* PLATFORM — PUBLIC */}
      <section id="platform" className="max-w-[1360px] mx-auto px-4 md:px-6 pt-10">
        <div className="text-center">
          <p className="text-[#5E17EB] text-[11px] font-black tracking-[0.18em] uppercase">Platform — $50 to find, create, deliver</p>
          <h2 className="mt-3 text-[30px] md:text-[48px] font-black tracking-[-0.03em] text-[#0A0A0A]">Find → Get Email → Create</h2>
          <p className="mt-2 text-[#6B7280] max-w-[720px] mx-auto md:text-[17px]">Pay $50, search any niche + location, get verified emails (Hunter), then create what companies ask for. Simple, real, scalable.</p>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {[
            {n:"1", t:"Find Real Companies", d:"Apollo + Hunter + Google Places + Overpass. Niche + location + limit. Dedupe by website. Save to dashboard. CSV import.", c:"from-[#5E17EB] to-[#7C3AED]"},
            {n:"2", t:"Get Verified Emails", d:"Every company comes with owner name, website, verified email, product. Hunter check. No info@ guess.", c:"from-[#0A0A0A] to-[#272727]"},
            {n:"3", t:"Create What They Need", d:"Companies tell you what they need — you create and deliver. Track who you emailed, who replied, who’s hot.", c:"from-[#059669] to-[#047857]"},
          ].map(card=>(
            <div key={card.n} className="bg-white border border-[#EDEDED] rounded-2xl p-7 md:p-8 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.c} flex items-center justify-center text-white font-black text-[18px]`}>{card.n}</div>
              <h3 className="mt-5 text-[18px] font-black text-[#0A0A0A]">{card.t}</h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-[#4B5563]">{card.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRIVATE — 4,500+ AUDIENCE ACROSS 5 COMMUNITIES */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-6 pt-10">
        <div className="bg-[#0A0A0A] rounded-[28px] p-6 md:p-10 lg:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#5E17EB] rounded-full blur-[90px] opacity-20" />
          <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
            <div>
              <p className="text-[#A78BFA] text-[11px] font-black tracking-[0.16em] uppercase">4,500+ Audience Across 5 Communities</p>
              <h2 className="mt-2 text-[28px] md:text-[40px] font-black leading-[0.95] tracking-tight">We Reach Brands<br/>on Our Communities</h2>
              <p className="mt-4 text-white/70 md:text-[15px] leading-[1.6]">For selected brands we feature their product across our LinkedIn, WhatsApp, Telegram and YouTube — 4,500+ targeted audience across 5 communities. Private, not public. Ask for invite.</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  {p:"LinkedIn Followers", v:"700+", s:"700 followers"},
                  {p:"LinkedIn Connections", v:"500+", s:"500 connections"},
                  {p:"WhatsApp Channel", v:"130 members", s:"130 members (2 groups)"},
                  {p:"Telegram Channel", v:"113 members", s:"113 members"},
                  {p:"Cybersecurity Community", v:"85 members", s:"85 cybersecurity"},
                  {p:"YouTube", v:"3K+ subs", s:"3,000+ subscribers"},
                ].map(x=>(
                  <div key={x.p} className="bg-white/10 border border-white/10 rounded-2xl p-4">
                    <div className="text-[13px] font-black">{x.p}</div>
                    <div className="text-[16px] font-black text-[#A78BFA]">{x.v}</div>
                    <div className="text-[11px] text-white/60">{x.s}</div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-white/40">4,500+ audience • 5 communities • Invite only</p>
            </div>
            <div className="bg-white rounded-2xl p-5 md:p-6 text-[#0A0A0A]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black tracking-wide">YOUR OUTREACH — TRACKED</span><span className="text-[11px] font-bold bg-[#0A0A0A] text-white px-2.5 py-1 rounded-full">Team only</span>
              </div>
              <p className="mt-2 text-[13px] text-[#6B7280]">Send to 100, see who replies, generate content for YES, post manually for now. All tracked on site.</p>
              <div className="mt-4 space-y-2">
                {[
                  {n:"Glow Skin Co", m:"Interested — YES", c:"bg-emerald-50 border-emerald-200"},
                  {n:"Peak Fitness", m:"Emailed • 2 days ago", c:"bg-blue-50 border-blue-200"},
                  {n:"Luxe Shopify", m:"Not yet", c:"bg-gray-50 border-gray-200"},
                ].map(r=>(
                  <div key={r.n} className={`border rounded-xl p-3 flex items-center justify-between ${r.c}`}>
                    <span className="text-[13px] font-bold">{r.n}</span><span className="text-[11px] font-bold">{r.m}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-[#FFFCF8] border rounded-xl p-3 text-[12px]">
                <b>Team inbox → </b> When a brand replies, you get pinged and can generate their posts right here.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING — PUBLIC $50 */}
      <section id="pricing" className="max-w-[1360px] mx-auto px-4 md:px-6 py-10">
        <div className="text-center">
          <p className="text-[#5E17EB] text-[11px] font-black tracking-[0.16em] uppercase">Simple pricing — public</p>
          <h2 className="mt-2 text-[30px] md:text-[44px] font-black tracking-tight">Get Access for $50</h2>
          <p className="mt-2 text-[#6B7280]">Find companies, get verified emails, create what they need. Messaging for team only.</p>
        </div>
        <div className="mt-8 grid md:grid-cols-2 gap-6 max-w-[900px] mx-auto">
          <div className="bg-white border border-[#EDEDED] rounded-2xl p-7 md:p-8">
            <p className="text-[11px] font-black tracking-[0.14em] uppercase text-[#6B7280]">Starter</p>
            <p className="mt-2 text-[40px] font-black leading-none">$50<span className="text-[14px] font-bold text-[#6B7280]"> / access</span></p>
            <p className="text-[13px] text-[#6B7280]">One-time, find & export companies</p>
            <ul className="mt-6 space-y-3">
              {["Apollo + Hunter verified search","Niche + location + limit (20-100)","Company, owner, email, product","CSV export + dedupe","Dashboard to track"].map(li=>(
                <li key={li} className="flex gap-2.5 text-[13.5px] font-medium"><span className="w-5 h-5 rounded-full bg-[#F0EFFF] border border-[#DDD6FE] flex items-center justify-center text-[#5E17EB] text-[11px]">✓</span>{li}</li>
              ))}
            </ul>
            <button onClick={handleGoogleSignup} className="mt-7 w-full bg-[#0A0A0A] text-white rounded-xl py-3.5 text-[14px] font-black hover:bg-black">Get access — $50 →</button>
            <p className="mt-2 text-center text-[11px] text-[#9CA3AF]">Paystack • Instant access • No subscription</p>
          </div>
          <div className="bg-[#0A0A0A] text-white rounded-2xl p-7 md:p-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#5E17EB] rounded-full blur-[40px] opacity-30" />
            <p className="text-[#A78BFA] text-[11px] font-black tracking-[0.14em] uppercase">For Agencies</p>
            <p className="mt-2 text-[40px] font-black leading-none">$99<span className="text-[14px] font-bold text-white/60"> / Pro</span></p>
            <p className="text-white/60 text-[13px]">Everything in Starter + more</p>
            <ul className="mt-6 space-y-3">
              {["Everything in Starter","100 companies per search","Priority support","Team invite (future)","Early private engine access"].map(li=>(
                <li key={li} className="flex gap-2.5 text-[13.5px] font-medium"><span className="w-5 h-5 rounded-full bg-[#5E17EB] flex items-center justify-center text-[11px]">✓</span>{li}</li>
              ))}
            </ul>
            <button onClick={handleGoogleSignup} className="mt-7 w-full bg-white text-[#0A0A0A] rounded-xl py-3.5 text-[14px] font-black">Get Pro — $99 →</button>
            <p className="mt-2 text-center text-[11px] text-white/40">For heavy users • Private invite on request</p>
          </div>
        </div>
        <p className="mt-4 text-center text-[11px] text-[#9CA3AF]">Messaging & private 4,500+ audience feature is <b className="text-[#0A0A0A]">team only</b> — not included in $50 public access.</p>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-6">
        <div className="bg-white border border-[#EDEDED] rounded-2xl p-6 md:p-8">
          <h3 className="text-[18px] font-black">What you get</h3>
          <div className="mt-4 grid md:grid-cols-3 gap-6 text-[13.5px] leading-[1.6] text-[#4B5563]">
            <div><b className="text-[#0A0A0A]">Real, not mock.</b> Apollo + Hunter + Places. No info@ guess. Every email verified.</div>
            <div><b className="text-[#0A0A0A]">You control outreach.</b> 100 emails show on your site, you track YES, generate content for them, post manually.</div>
            <div><b className="text-[#0A0A0A]">Private engine.</b> For selected brands we feature on 4,500+ audience across 5 communities. Invite only.</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-6 py-10">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6 items-start">
          <div>
            <h2 className="text-[28px] md:text-[36px] font-black tracking-tight leading-[0.95]">Questions?<br/><span className="text-[#5E17EB]">Clear answers.</span></h2>
            <p className="mt-3 text-[#4B5563] md:text-[15px]"> $50 gives you company finder. Messaging & private 4,500+ audience is team only.</p>
            <button onClick={handleGoogleSignup} className="mt-6 bg-[#0A0A0A] text-white rounded-xl px-7 py-3.5 text-[14px] font-black">Get access — $50 →</button>
          </div>
          <div className="bg-white border border-[#EDEDED] rounded-2xl overflow-hidden">
            {[
              {q:"What does $50 give me?", a:"Access to find real companies: niche + location + limit, with company, website, owner, verified email, product. Export CSV, dedupe. You create what companies ask for. One-time, not monthly."},
              {q:"Can I send emails from the site?", a:"No — messaging is team-only for now. We use it to contact brands about our private 4,500+ audience feature. Your dashboard after $50 is for finding & tracking companies you contacted externally."},
              {q:"Is the 4,500+ audience across 5 communities public?", a:"No. It's invite-only for brands we choose. Public sees 'Private Engine — Invite Only' without price. We pitch it one-to-one via Gmail when a brand is a good fit."},
              {q:"How do you find companies?", a:"Apollo mixed_companies + Hunter domain-search, plus Tavily/Serply/Overpass fallback, cached 24h in leads_cache. All real, no mock lists. You can also CSV import."},
            ].map((f,i)=>(
              <div key={f.q} className="border-b last:border-0 border-[#F3F4F6]">
                <button onClick={()=> setActiveFaq(i)} className="w-full text-left px-6 py-4 flex items-center justify-between gap-4">
                  <span className="text-[14px] font-black text-[#0A0A0A]">{f.q}</span>
                  <span className={`w-7 h-7 rounded-full border flex items-center justify-center text-[14px] font-bold shrink-0 ${activeFaq===i?'bg-[#0A0A0A] text-white border-[#0A0A0A]':'bg-white text-[#0A0A0A] border-[#EDEDED]'}`}>{activeFaq===i?'−':'+'}</span>
                </button>
                {activeFaq===i && <div className="px-6 pb-4 text-[13.5px] leading-[1.6] text-[#4B5563]">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-6 pb-8">
        <div className="bg-gradient-to-br from-[#0A0A0A] via-[#1A0A4A] to-[#5E17EB] rounded-[28px] p-8 md:p-12 lg:p-16 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[80px]" />
          <div className="relative grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
            <div>
              <h2 className="text-[32px] md:text-[48px] font-black leading-[0.9] tracking-tight">Find real<br/>companies today</h2>
              <p className="mt-4 text-white/70 md:text-[16px] leading-[1.6]">Pay $50 once, search any niche, get verified emails. Messaging stays private for our team.</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button onClick={handleGoogleSignup} className="bg-white text-[#0A0A0A] rounded-2xl px-8 py-4 text-[16px] font-black hover:bg-[#F3F4F6]">Get access — $50 →</button>
                <button onClick={handleLogin} className="bg-white/10 border border-white/20 text-white rounded-2xl px-8 py-4 text-[15px] font-bold hover:bg-white/20">Log in</button>
              </div>
            </div>
            <div className="bg-white text-[#0A0A0A] rounded-2xl p-6">
              <div className="text-[11px] font-black tracking-wide text-[#5E17EB]">YOU GET TODAY</div>
              <ul className="mt-3 space-y-2.5 text-[13.5px] font-semibold">
                {["Search any niche + location","Verified owner + email + product","CSV export + dedupe","Track who you emailed"].map(li=>(
                  <li key={li} className="flex gap-2"><span className="text-emerald-500">✓</span>{li}</li>
                ))}
              </ul>
              <div className="mt-4 bg-[#FFFCF8] border rounded-xl p-3 flex items-center justify-between">
                <span className="text-[12px] font-bold">Access</span><span className="text-[18px] font-black">$50</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center border-t border-[#EDEDED] mt-2">
        <div className="max-w-[1360px] mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[12.5px] text-[#6B7280]">
            <span>© 2024 ALPHATEKX — Alpha Agency OS</span>
            <span className="flex gap-4"><a href="mailto:alphatekxcompany@gmail.com" className="hover:text-[#0A0A0A] font-bold">Contact</a> <span>•</span> <span className="text-[#5E17EB] font-black">Real data • No mock</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
};
