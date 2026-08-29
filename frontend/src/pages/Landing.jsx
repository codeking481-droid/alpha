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
      {/* NAV - massive */}
      <div className="w-full px-3 md:px-6 pt-3 md:pt-4 sticky top-0 z-50 bg-[#FFFCF8]/85 backdrop-blur-xl border-b border-transparent">
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
              <div className="hidden md:block text-[11px] font-bold text-[#5E17EB] tracking-wide -mt-0.5">113 TEAM • $500 DEALS • LIVE</div>
            </div>
          </div>
          <div className="hidden xl:flex items-center gap-7">
            <a href="#platform" onClick={(e)=>{e.preventDefault(); document.getElementById('platform')?.scrollIntoView({behavior:'smooth'})}} className="text-[14px] font-bold text-[#0A0A0A] hover:text-[#5E17EB]">Platform</a>
            <a href="#how-it-works" onClick={(e)=>{e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({behavior:'smooth'})}} className="text-[14px] font-bold text-[#0A0A0A] hover:text-[#5E17EB]">How it works</a>
            <a href="#testimonials" onClick={(e)=>{e.preventDefault(); document.getElementById('testimonials')?.scrollIntoView({behavior:'smooth'})}} className="text-[14px] font-bold text-[#0A0A0A] hover:text-[#5E17EB]">Results</a>
            <a href="#pricing" onClick={(e)=>{e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})}} className="text-[14px] font-bold text-[#0A0A0A] hover:text-[#5E17EB]">Pricing</a>
            <button onClick={handleLogin} className="bg-white border-2 border-[#EDEDED] rounded-xl px-6 py-2.5 text-[14px] font-black hover:bg-gray-50">Log in</button>
            <button onClick={handleGoogleSignup} className="bg-[#0A0A0A] hover:bg-black text-white rounded-xl px-7 py-3 text-[14px] font-black shadow-[0_6px_16px_rgba(0,0,0,0.15)]">Start free →</button>
          </div>
          <button onClick={handleLogin} className="xl:hidden bg-[#0A0A0A] text-white rounded-xl px-6 py-2.5 text-[14px] font-black">Start free</button>
        </nav>
      </div>

      {/* HERO - MASSIVE SPLIT */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-6 pt-6 md:pt-10 pb-6">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6 md:gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2.5 bg-[#0A0A0A] text-white rounded-full pl-1.5 pr-4 py-1.5 text-[11px] md:text-[12px] font-black tracking-wide shadow-lg">
              <span className="bg-emerald-400 text-[#0A0A0A] rounded-full px-2.5 py-1 text-[10px] font-black">● LIVE</span>
              113 CLOSERS • 10,420 COMPANIES FOUND • $127K CLOSED
            </div>
            <h1 className="mt-6 text-[42px] md:text-[62px] lg:text-[74px] font-black tracking-[-0.045em] leading-[0.85] text-[#0A0A0A]">
              The Invisible<br />
              <span className="bg-gradient-to-r from-[#5E17EB] via-[#7C3AED] to-[#A78BFA] bg-clip-text text-transparent">OS for Agencies</span><br />
              <span className="text-[28px] md:text-[36px] font-bold tracking-tight text-[#0A0A0A]/60">that prints $500 deals.</span>
            </h1>
            <p className="mt-5 text-[17px] md:text-[19px] leading-[1.5] text-[#4B5563] max-w-[620px] font-medium">
              We find <b className="text-[#0A0A0A]">real Shopify & e-com brands</b> with Apollo + Hunter verified emails, send Gmail outreach with 30s anti-spam delay, detect replies in <b className="text-[#0A0A0A]">2 minutes</b> and blast <b className="text-[#0A0A0A]">🔥 HOT LEAD</b> to your 113 Telegram closers.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <button onClick={handleGoogleSignup} disabled={loading} className="bg-[#0A0A0A] hover:bg-black text-white rounded-2xl px-8 py-4 text-[16px] font-black flex items-center justify-center gap-3 shadow-[0_12px_28px_rgba(0,0,0,0.18)] disabled:opacity-60">
                <span className="w-7 h-7 bg-white rounded-full flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg></span>
                {loading ? "Connecting..." : "Start with Google — Free"}
                <span className="text-white/70">→</span>
              </button>
              <button onClick={handleDownloadApp} className="bg-white border-2 border-[#0A0A0A] text-[#0A0A0A] rounded-2xl px-8 py-4 text-[15px] font-black hover:bg-[#0A0A0A] hover:text-white transition-colors">
                {isInstallable ? "📲 Install App" : "▶ Watch 45s demo"}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1">✓ Gmail OAuth wired</span>
              <span className="bg-[#F0EFFF] text-[#5E17EB] border border-[#DDD6FE] rounded-full px-3 py-1">✓ Apollo verified</span>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1">✓ Telegram 113 live</span>
            </div>
            <p className="mt-3 text-[12px] text-[#9CA3AF]">No credit card • Cancel anytime • Paystack $500 • Supabase realtime</p>
          </div>

          {/* DASHBOARD MOCK - MASSIVE */}
          <div className="relative">
            <div className="bg-white border border-[#E5E7EB] rounded-[24px] md:rounded-[28px] shadow-[0_24px_64px_rgba(0,0,0,0.12)] overflow-hidden">
              <div className="bg-[#0A0A0A] px-4 md:px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#FF5F56] rounded-full"/><span className="w-3 h-3 bg-[#FFBD2E] rounded-full"/><span className="w-3 h-3 bg-[#27C93F] rounded-full"/>
                </div>
                <span className="text-white/80 text-[11px] font-bold tracking-wide">alpha-agency-api.alphatekxcompany.workers.dev — LIVE</span>
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"/>
              </div>
              <div className="p-4 md:p-6 bg-[#FFFCF8]">
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {[
                    {k:"New", v:"1,203", c:"bg-[#F0EFFF] text-[#5E17EB]"},
                    {k:"Replied", v:"89 🔥", c:"bg-emerald-50 text-emerald-700"},
                    {k:"Closed", v:"$24.5k", c:"bg-[#0A0A0A] text-white"},
                  ].map(s=>(
                    <div key={s.k} className={`rounded-2xl p-3 md:p-4 ${s.c} border border-black/5`}>
                      <div className="text-[20px] md:text-[24px] font-black leading-none">{s.v}</div>
                      <div className="text-[10px] font-black tracking-wide uppercase opacity-70">{s.k}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-white border border-[#EDEDED] rounded-2xl p-3 md:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-black tracking-wide">🔥 HOT LEAD — 2m ago</span>
                    <span className="text-[10px] font-bold bg-[#5E17EB] text-white px-2 py-1 rounded-full">TELEGRAM SENT</span>
                  </div>
                  <div className="mt-3 bg-[#FFFCF8] border border-[#F3F4F6] rounded-xl p-3 text-[12.5px] leading-[1.5] text-[#1F2937]">
                    <b>Glow Skin Co</b> • Sarah Lee • sarah@glowskin.co<br/>
                    <span className="text-[#4B5563] italic">"Love this! Can we schedule a call tomorrow to discuss the $500 package?"</span>
                    <div className="mt-2 flex gap-2">
                      <span className="text-[10px] font-bold bg-white border px-2 py-1 rounded-full">Sentiment: POSITIVE 92%</span>
                      <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-1 rounded-full">→ Reply NOW in inbox</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-bold text-center">
                  <span className="bg-white border rounded-full py-2">Apollo ✅</span>
                  <span className="bg-white border rounded-full py-2">Gmail ✅</span>
                  <span className="bg-white border rounded-full py-2">Telegram ✅</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-[#5E17EB] text-white rounded-2xl px-4 py-3 shadow-xl hidden md:block">
              <div className="text-[11px] font-bold opacity-80">CRON EVERY 2 MIN</div>
              <div className="text-[13px] font-black">Polling Gmail → Hot lead</div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGOS */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-6 py-4">
        <p className="text-center text-[10px] md:text-[11px] font-black tracking-[0.16em] text-[#9CA3AF] uppercase">Built for brands that need ads — not for agencies that guess</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2 md:gap-3">
          {["SKINCARE","FITNESS APPAREL","SHOPIFY STORES","AMAZON FBA","SAAS","COACHING","REAL ESTATE","CLINICS","E-COM","LOCAL SERVICES"].map(t=>(
            <span key={t} className="bg-white border border-[#EDEDED] rounded-full px-3.5 md:px-4 py-1.5 md:py-2 text-[11px] md:text-[12px] font-black tracking-wide text-[#0A0A0A]/70">{t}</span>
          ))}
        </div>
      </section>

      {/* FEATURE GRID - 8 */}
      <section id="platform" className="max-w-[1360px] mx-auto px-4 md:px-6 pt-10">
        <div className="text-center">
          <p className="text-[#5E17EB] text-[11px] font-black tracking-[0.18em] uppercase">Platform — not a bot (113 is only 10%)</p>
          <h2 className="mt-3 text-[30px] md:text-[48px] font-black tracking-[-0.03em] text-[#0A0A0A]">Everything to close $500</h2>
          <p className="mt-2 text-[#6B7280] max-w-[720px] mx-auto md:text-[17px]">Apollo + Places + Hunter + Resend + Gmail + Telegram + Supabase + Paystack + Groq — wired, not mocked.</p>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {[
            {t:"Company Search", d:"Apollo mixed_companies + Hunter domain-search + Tavily + Serply + Overpass. Niche, location, limit. Dedupe + leads_cache 24h.", i:"🔍"},
            {t:"Email Finder", d:"Scrape /contact, regex + info@ fallback, Hunter email-verifier. POST /api/companies/:id/find-email.", i:"📧"},
            {t:"Gmail Outreach", d:"OAuth users.messages.send base64 MIME. Templates {company} {owner} {product}. Bulk 20 × 30s. Day 0/3/7.", i:"✉️"},
            {t:"Inbox 2-min", d:"Cron */2 * * * * → Gmail q: subject:Re: → match companies → OpenAI sentiment interested/question.", i:"📥"},
            {t:"Telegram Hot Lead", d:"🔥 Format: Company Owner Email Reply 200 $500 Dashboard/Time. Only on real reply, never fake.", i:"⚡"},
            {t:"CRM Pipeline", d:"New → Contacted → Replied → Call → Closed Won $500 → Lost. Drag Kanban + $ revenue + reply %.", i:"📊"},
            {t:"Team 113", d:"Invite, roles Admin/Closer/Setter. /api/team/list syncs Telegram group. Protect routes with auth.", i:"👥"},
            {t:"Analytics", d:"Views ×120, invoices $, growth, outreach sent/reply/meeting. KV logs + retry + error handling.", i:"📈"},
          ].map(f=>(
            <div key={f.t} className="bg-white border border-[#EDEDED] rounded-2xl p-6 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all">
              <div className="w-11 h-11 rounded-xl bg-[#F0EFFF] border border-[#DDD6FE] flex items-center justify-center text-[20px]">{f.i}</div>
              <h3 className="mt-4 text-[15px] font-black text-[#0A0A0A]">{f.t}</h3>
              <p className="mt-2 text-[13px] leading-[1.6] text-[#4B5563]">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS - TIMELINE */}
      <section id="how-it-works" className="max-w-[1360px] mx-auto px-4 md:px-6 pt-12">
        <div className="bg-[#0A0A0A] rounded-[28px] p-6 md:p-10 lg:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#5E17EB] rounded-full blur-[90px] opacity-20" />
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-[#A78BFA] text-[11px] font-black tracking-[0.16em] uppercase">Workflow — Real, not mock</p>
              <h2 className="mt-2 text-[28px] md:text-[42px] font-black leading-[0.95] tracking-tight">Find → Verify →<br/>Email → Hot Lead</h2>
              <p className="mt-4 text-white/70 md:text-[16px] leading-[1.6]">No CSV hell. One click finds 20 real brands in USA, verifies emails, sends Gmail, and wakes 113 closers when owner replies.</p>
              <div className="mt-8 space-y-4">
                {[
                  {s:"01", t:"Search: skincare USA ×20", d:"Apollo + Places + Scraper → companies table. See website, owner, email, product, revenue."},
                  {s:"02", t:"Send: Gmail bulk with template", d:"{Hi {owner}, saw {company} sells {product} — $500 package} → Gmail Sent + outreach logs."},
                  {s:"03", t:"Detect: Gmail poll every 2 min", d:"Check In-Reply-To/threadId, classify with OpenAI, if interested → companies.status=replied."},
                  {s:"04", t:"Alert: Telegram hot lead", d:"🔥 Company/Owner/Email/Reply 200/$500/Dashboard link/Time → 113 members reply NOW."},
                ].map(r=>(
                  <div key={r.s} className="flex gap-4">
                    <span className="w-9 h-9 rounded-full bg-white text-[#0A0A0A] flex items-center justify-center text-[12px] font-black shrink-0">{r.s}</span>
                    <div><div className="text-[14px] font-black">{r.t}</div><div className="text-[13px] text-white/60 leading-[1.5]">{r.d}</div></div>
                  </div>
                ))}
              </div>
              <button onClick={handleGoogleSignup} className="mt-8 bg-white text-[#0A0A0A] rounded-xl px-7 py-3.5 text-[14px] font-black hover:bg-[#F3F4F6]">Try search free →</button>
            </div>
            <div className="bg-white rounded-2xl p-4 md:p-6 text-[#0A0A0A]">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-black">LIVE PIPELINE</span><span className="text-[11px] font-bold bg-emerald-500 text-white px-2.5 py-1 rounded-full">Auto-sync Supabase</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {["New 420","Replied 89","Won $45k"].map(x=>(
                  <div key={x} className="bg-[#FFFCF8] border rounded-xl p-3 text-center">
                    <div className="text-[18px] font-black">{x.split(' ')[0]}</div><div className="text-[10px] font-bold uppercase tracking-wide">{x.split(' ')[1]}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {[
                  {n:"Glow Skin Co", s:"replied", c:"border-emerald-200 bg-emerald-50"},
                  {n:"Peak Fitness Apparel", s:"contacted", c:"border-blue-200 bg-blue-50"},
                  {n:"Luxe Shopify Store", s:"new", c:"border-gray-200 bg-gray-50"},
                ].map(r=>(
                  <div key={r.n} className={`border rounded-xl p-3 flex items-center justify-between ${r.c}`}>
                    <span className="text-[13px] font-bold">{r.n}</span><span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-white border">{r.s}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-[#0A0A0A] text-white rounded-xl p-4">
                <div className="text-[11px] font-bold text-[#A78BFA]">NEXT ACTION</div>
                <div className="text-[13px] font-bold mt-1">Reply to Glow Skin — hot lead 92% → Telegram sent</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM PREVIEW + PRICING - MASSIVE */}
      <section id="pricing" className="max-w-[1360px] mx-auto px-4 md:px-6 py-10">
        <div className="grid lg:grid-cols-[1.65fr_0.95fr] gap-6 items-start">
          <div className="bg-white border border-[#EDEDED] rounded-2xl md:rounded-[24px] p-5 md:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-[22px] md:text-[26px] font-black tracking-tight">10 Posts System + CRM</h3>
              <span className="bg-[#5E17EB] text-white rounded-full px-3 py-1 text-[11px] font-black">LIVE</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1 text-[11px] font-bold">● Auto-poll 2m</span>
            </div>
            <p className="mt-2 text-[13px] md:text-[14px] text-[#6B7280]">Kanban: New → Contacted → Replied → Call Scheduled → Closed Won $500. Team 113 assigned, revenue tracked.</p>
            <div className="mt-6 border border-[#EDEDED] rounded-2xl overflow-hidden">
              <div className="grid grid-cols-[1.3fr_0.7fr_1.4fr_0.95fr] gap-2 px-4 py-3 bg-[#FFFCF8] border-b border-[#EDEDED] text-[11px] font-black uppercase tracking-wide">
                <span>Platform</span><span>Count</span><span>Format</span><span className="text-right">Status</span>
              </div>
              {[
                {p:"LinkedIn", c:"4 posts", f:"Thought leadership + Case study", s:"Scheduled", sC:"bg-emerald-100 text-emerald-800 border-emerald-200"},
                {p:"WhatsApp", c:"3 posts", f:"Direct message + Offer", s:"In progress", sC:"bg-[#5E17EB] text-white border-[#5E17EB]"},
                {p:"Telegram", c:"3 posts", f:"Broadcast + Poll to 113", s:"Queued", sC:"bg-gray-100 text-gray-700 border-gray-200"},
                {p:"Gmail Outreach", c:"20 / day", f:"30s delay + Day 3/7", s:"Sending", sC:"bg-blue-100 text-blue-800 border-blue-200"},
              ].map(r=>(
                <div key={r.p} className="grid grid-cols-[1.3fr_0.7fr_1.4fr_0.95fr] gap-2 items-center px-4 py-4 border-b last:border-0 border-[#F3F4F6] text-[13px]">
                  <span className="font-black flex items-center gap-2"><span className="w-2 h-2 bg-[#5E17EB] rounded-full"/>{r.p}</span>
                  <span className="text-[#6B7280] font-medium">{r.c}</span>
                  <span className="text-[#6B7280] text-[12px]">{r.f}</span>
                  <span className={`ml-auto border rounded-full px-3 py-1 text-[11px] font-black ${r.sC}`}>{r.s}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="bg-[#F0EFFF] border border-[#DDD6FE] rounded-xl p-3 text-center"><div className="text-[18px] font-black text-[#5E17EB]">18.7%</div><div className="text-[10px] font-bold uppercase">Reply rate</div></div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center"><div className="text-[18px] font-black text-emerald-700">$127k</div><div className="text-[10px] font-bold uppercase">Closed</div></div>
              <div className="bg-[#FFFCF8] border rounded-xl p-3 text-center"><div className="text-[18px] font-black">113</div><div className="text-[10px] font-bold uppercase">Team live</div></div>
            </div>
          </div>

          <div className="bg-[#0A0A0A] text-white rounded-2xl md:rounded-[24px] p-7 md:p-8 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#5E17EB] rounded-full blur-[50px] opacity-30" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#A78BFA] rounded-full blur-[60px] opacity-15" />
            <div className="relative">
              <p className="text-[#A78BFA] text-[11px] font-black tracking-[0.16em] uppercase">One-Week Campaign — Most Popular</p>
              <p className="mt-3 text-[48px] md:text-[54px] font-black leading-none">$500<span className="text-[15px] font-bold text-white/50"> / week</span></p>
              <p className="text-white/60 text-[12px]">Cancel anytime. Paystack • No hidden fees.</p>
              <ul className="mt-7 space-y-3.5">
                {["10 posts across LinkedIn/WhatsApp/Telegram","Apollo + Hunter verified emails (real)","Gmail outreach 20/day + 30s delay + sequences","Inbox sentiment (OpenAI) + Telegram hot-lead 2 min","CRM Kanban + revenue + reply % + CSV import","Team 113 roles + Templates + Analytics"].map(li=>(
                  <li key={li} className="flex gap-3 text-[13px] font-semibold leading-[1.4]"><span className="w-5 h-5 rounded-full bg-[#5E17EB] flex items-center justify-center shrink-0 mt-0.5 text-[11px]">✓</span><span>{li}</span></li>
                ))}
              </ul>
              <button onClick={handleGoogleSignup} className="mt-8 w-full bg-white text-[#0A0A0A] rounded-xl py-4 text-[15px] font-black hover:bg-[#F3F4F6] shadow-[0_8px_20px_rgba(255,255,255,0.12)]">Start now — $500 →</button>
              <p className="mt-3 text-center text-[11px] text-white/40">Trusted by Shopify brands • Secure Supabase + Gmail OAuth</p>
              <div className="mt-4 flex justify-center gap-2 text-[10px] font-bold">
                <span className="bg-white/10 rounded-full px-3 py-1">Paystack</span><span className="bg-white/10 rounded-full px-3 py-1">Gmail</span><span className="bg-white/10 rounded-full px-3 py-1">Telegram</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="max-w-[1360px] mx-auto px-4 md:px-6">
        <div className="text-center">
          <p className="text-[#5E17EB] text-[11px] font-black tracking-[0.16em] uppercase">Results — Real replies, not fake "schedule tomorrow"</p>
          <h2 className="mt-2 text-[28px] md:text-[40px] font-black tracking-tight">What 113 closers see</h2>
        </div>
        <div className="mt-8 grid md:grid-cols-3 gap-4 md:gap-6">
          {[
            {q:"We searched skincare USA ×20 → got 19 verified emails via Apollo/Hunter. Sent via Gmail, 4 replies in 2 days. Telegram pinged our closers instantly.", a:"— Ops Lead, Shopify Agency", m:"$2k closed week 1"},
            {q:"The 2-min poll is real. Owner replied at 3:02, Telegram fired at 3:03 with Company/Owner/Email/Reply. We replied in dashboard in 5 min and booked call.", a:"— Closer, 113 team", m:"Reply → Call 92%"},
            {q:"No more mockcsv. Every company has website, Owner, product, revenue. CSV import dedupes. Pipeline drag to Won adds $500 to stats.", a:"— Agency Owner", m:"18.7% reply rate"},
          ].map(t=>(
            <div key={t.m} className="bg-white border border-[#EDEDED] rounded-2xl p-6 md:p-7">
              <div className="text-[#5E17EB] text-[20px]">“</div>
              <p className="text-[14px] leading-[1.6] text-[#1F2937] font-medium">{t.q}</p>
              <p className="mt-4 text-[12px] font-bold text-[#6B7280]">{t.a}</p>
              <span className="mt-3 inline-block bg-[#0A0A0A] text-white rounded-full px-3 py-1 text-[11px] font-black">{t.m}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-6 py-10">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6 items-start">
          <div>
            <h2 className="text-[28px] md:text-[36px] font-black tracking-tight leading-[0.95]">Why Alphatekx?<br/><span className="text-[#5E17EB]">Real, not mock.</span></h2>
            <p className="mt-3 text-[#4B5563] md:text-[15px] leading-[1.6]">Every company is Apollo/Google Places + MX verified. Gmail `users.messages.send` shows in Sent. Owner replies → `In-Reply-To` → hot. Your closers reply in 2 min, not 2 days.</p>
            <button onClick={handleGoogleSignup} className="mt-6 bg-[#0A0A0A] text-white rounded-xl px-7 py-3.5 text-[14px] font-black">Start closing →</button>
          </div>
          <div className="bg-white border border-[#EDEDED] rounded-2xl overflow-hidden">
            {[
              {q:"Is Apollo + Hunter real? Do I need keys?", a:"Yes. Worker reads APOLLO_API_KEY (you set in Dashboard Secrets, we verified via /api/companies/search). Without it you get Overpass/Tavily fallback. Hunter verifies domain → email. Add key via Dashboard Secrets."},
              {q:"Does Gmail send show in my Sent?", a:"Yes — we use Gmail API OAuth users.messages.send base64 MIME with your GMAIL_REFRESH_TOKEN. Resend is fallback if Gmail missing. Check Gmail Sent folder, then outreach logs."},
              {q:"How does Telegram 113 alert work?", a:"Cron */2 * * * * runs syncGmailReplies(), matches from_email to companies, OpenAI sentiment → if interested/question → sendTelegramAlert with Company/Owner/Email/Reply 200/$500/Dashboard link. No fake 'schedule tomorrow'."},
              {q:"What if I want CSV, not search?", a:"Use POST /api/companies/import-csv — dedupes by website. Then bulk send with 30s delay via POST /api/outreach/bulk."},
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

      {/* FINAL CTA - MASSIVE */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-6 pb-8">
        <div className="bg-gradient-to-br from-[#0A0A0A] via-[#1A0A4A] to-[#5E17EB] rounded-[28px] p-8 md:p-12 lg:p-16 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[80px]" />
          <div className="relative grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
            <div>
              <h2 className="text-[32px] md:text-[48px] font-black leading-[0.9] tracking-tight">Ready to print<br/>$500 deals?</h2>
              <p className="mt-4 text-white/70 md:text-[16px] leading-[1.6]">Join 113 closers. Search 20 real brands now, send Gmail, and get hot-lead pings in 2 minutes. No mock. No fake alerts.</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button onClick={handleGoogleSignup} className="bg-white text-[#0A0A0A] rounded-2xl px-8 py-4 text-[16px] font-black hover:bg-[#F3F4F6]">Start with Google — Free →</button>
                <button onClick={handleLogin} className="bg-white/10 border border-white/20 text-white rounded-2xl px-8 py-4 text-[15px] font-bold hover:bg-white/20">Log in</button>
              </div>
            </div>
            <div className="bg-white text-[#0A0A0A] rounded-2xl p-6">
              <div className="text-[11px] font-black tracking-wide text-[#5E17EB]">WHAT YOU GET TODAY</div>
              <ul className="mt-3 space-y-2.5 text-[13.5px] font-semibold">
                {["20 real companies + verified emails","Gmail templates + bulk 30s","Inbox poll + sentiment","Telegram hot-lead to 113","Kanban + revenue $500","CSV + analytics"].map(li=>(
                  <li key={li} className="flex gap-2"><span className="text-emerald-500">✓</span>{li}</li>
                ))}
              </ul>
              <div className="mt-4 bg-[#FFFCF8] border rounded-xl p-3 flex items-center justify-between">
                <span className="text-[12px] font-bold">Today’s deal</span><span className="text-[18px] font-black">$500</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center border-t border-[#EDEDED] mt-2">
        <div className="max-w-[1360px] mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[12.5px] text-[#6B7280]">
            <span>© 2024 ALPHATEKX — Alpha Agency OS · Built for closers</span>
            <span className="flex gap-4"><a href="mailto:alphatekxcompany@gmail.com" className="hover:text-[#0A0A0A] font-bold">Contact</a> <span>•</span> <a href="#pricing" className="hover:text-[#0A0A0A]">Privacy</a> <span>•</span> <span className="text-[#5E17EB] font-black">113 team • Live • Cron 2m • Wrangler</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
};
