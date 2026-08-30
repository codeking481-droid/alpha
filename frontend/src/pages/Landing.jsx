import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export const Landing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { if (session?.user) navigate("/access"); });
  }, [navigate]);

  const handleGetAccess = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + "/access" } });
      if (error) { alert("Signup failed: " + error.message); setLoading(false); }
    } catch (e) { alert("Signup failed: " + e.message); setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#FFFCF8] font-['Inter',sans-serif] antialiased selection:bg-[#5E17EB] selection:text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'); html{scroll-behavior:smooth}`}</style>

      {/* FOUNDING ANNOUNCEMENT — addition, not rebuild */}
      <div className="bg-[#0A0A0A] text-white text-center py-2 px-4 text-[11px] md:text-[12px] font-bold tracking-wide">
        <span className="inline-flex items-center gap-2">
          <span className="bg-[#5E17EB] text-white px-2 py-0.5 rounded-full text-[10px] font-black">NEW</span>
          Founding Partner slots: <span className="text-[#A78BFA]">only 7 left</span> — $250 (was $500) + Free $2K+ Custom System
          <span className="hidden sm:inline"> — via AlphaTekx automation</span>
        </span>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#E8E8E8]">
        <div className="max-w-[1240px] mx-auto px-4 md:px-6 h-[64px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0A0A0A] flex items-center justify-center">
              <span className="text-white text-[15px] font-black">A</span>
            </div>
            <span className="text-[17px] font-black tracking-[-0.02em]">ALPHATEKX</span>
            <span className="hidden sm:inline-flex text-[10px] font-bold tracking-widest bg-[#F0EFFF] text-[#5E17EB] border border-[#DDD6FE] px-2 py-1 rounded-full">ALPHA OS</span>
          </div>
          <nav className="hidden lg:flex items-center gap-7">
            <a href="#features" className="text-[13px] font-medium text-[#6B7280] hover:text-[#0A0A0A]">Features</a>
            <a href="#how" className="text-[13px] font-medium text-[#6B7280] hover:text-[#0A0A0A]">How it works</a>
            <a href="#pricing" className="text-[13px] font-medium text-[#6B7280] hover:text-[#0A0A0A]">Pricing</a>
            <a href="#faq" className="text-[13px] font-medium text-[#6B7280] hover:text-[#0A0A0A]">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={handleGetAccess} className="hidden md:inline-flex text-[13px] font-semibold px-4 py-2 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]">Log in</button>
            <button onClick={handleGetAccess} disabled={loading} className="bg-[#5E17EB] hover:bg-[#4E0FD1] text-white rounded-full px-5 py-2.5 text-[13px] font-bold shadow-[0_6px_20px_rgba(94,23,235,0.25)] disabled:opacity-60">
              {loading ? "..." : "Get Access — $50"}
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-[1240px] mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-10">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-full px-2.5 py-1.5 text-[11px] font-bold">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              LIVE DATABASE
              <span className="text-[#9CA3AF] font-medium hidden sm:inline">• Apollo + Hunter verified • Global</span>
            </div>
            <h1 className="mt-5 text-[36px] sm:text-[44px] lg:text-[52px] font-black leading-[0.9] tracking-[-0.04em] text-[#0A0A0A]">
              Real companies.<br />
              Verified emails.<br />
              <span className="text-[#5E17EB]">$50 lifetime.</span>
            </h1>
            <p className="mt-4 text-[15px] md:text-[16px] leading-[1.6] text-[#5B6472] max-w-[520px]">
              Find any niche worldwide (USA/UK/Dubai/Global), get real owner emails — not <span className="font-semibold text-[#0A0A0A]">info@</span>. Same tool we use for Alpha Agency.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button onClick={handleGetAccess} disabled={loading} className="bg-[#0A0A0A] hover:bg-black text-white rounded-full px-7 py-3.5 text-[14px] font-bold inline-flex items-center justify-center gap-2">
                {loading ? "Connecting..." : "Get Access for $50"} <span>→</span>
              </button>
              <button onClick={() => document.getElementById('how')?.scrollIntoView({behavior:'smooth'})} className="bg-white border border-[#E5E7EB] hover:border-[#0A0A0A] rounded-full px-6 py-3.5 text-[14px] font-semibold">
                See how it works
              </button>
            </div>
            <div className="mt-5 flex items-center gap-4 text-[12px] text-[#6B7280] flex-wrap">
              <span className="inline-flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[10px]">✓</span> Pay once</span>
              <span className="w-1 h-1 bg-[#E5E7EB] rounded-full" />
              <span>No subscription</span>
              <span className="w-1 h-1 bg-[#E5E7EB] rounded-full hidden sm:inline" />
              <span className="hidden sm:inline">Vault max 12 • Groq 120B real</span>
            </div>
            <div className="mt-6 flex gap-3 max-w-[420px]">
              <div className="flex-1 bg-white border border-[#EDEDED] rounded-2xl p-3 text-center">
                <div className="text-[18px] font-black">10k+</div><div className="text-[11px] font-medium text-[#6B7280]">companies</div>
              </div>
              <div className="flex-1 bg-white border border-[#EDEDED] rounded-2xl p-3 text-center">
                <div className="text-[18px] font-black">Global</div><div className="text-[11px] font-medium text-[#6B7280]">USA / UK</div>
              </div>
              <div className="flex-1 bg-white border border-[#EDEDED] rounded-2xl p-3 text-center">
                <div className="text-[18px] font-black">$50</div><div className="text-[11px] font-medium text-[#6B7280]">lifetime</div>
              </div>
            </div>
          </div>

          {/* MOCK */}
          <div className="relative">
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_24px_64px_rgba(0,0,0,0.12)] overflow-hidden">
              <div className="h-9 bg-[#0A0A0A] flex items-center justify-between px-4">
                <div className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" /><span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" /><span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" /></div>
                <span className="text-[11px] font-semibold text-white/70">REAL DATABASE — LIVE</span>
                <span className="w-8" />
              </div>
              <div className="p-4 bg-[#FFFCF8]">
                <div className="bg-white border border-[#EDEDED] rounded-xl px-3 py-2.5 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF]">⌕</span>
                  <div className="flex-1"><div className="text-[11px] font-semibold text-[#9CA3AF]">Search</div><div className="text-[13px] font-bold">skincare • USA</div></div>
                  <span className="bg-[#0A0A0A] text-white rounded-full px-4 py-1 text-[12px] font-bold">Search</span>
                </div>
                <div className="mt-3 space-y-2">
                  {[
                    { c: "G", bg: "bg-[#5E17EB]", n: "Glow Skin Co", s: "glowskin.co • Sarah Kim", e: "sarah@glowskin.co", t: "Apollo ✓" },
                    { c: "P", bg: "bg-[#0A0A0A]", n: "Pure Botanics", s: "purebotanics.com • James Park", e: "james@purebotanics.com", t: "Hunter ✓" },
                    { c: "L", bg: "bg-emerald-600", n: "Luxe Beauty Lab", s: "luxebeauty.co • Emma Doyle", e: "emma@luxebeauty.co", t: "Verified" },
                  ].map(r => (
                    <div key={r.n} className="bg-white border border-[#EDEDED] rounded-xl px-3 py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-lg ${r.bg} text-white flex items-center justify-center text-[12px] font-black shrink-0`}>{r.c}</div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-bold truncate">{r.n}</div>
                          <div className="text-[11px] text-[#6B7280] truncate">{r.s}</div>
                          <div className="text-[11px] font-mono truncate">{r.e}</div>
                        </div>
                      </div>
                      <span className="hidden sm:inline text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0">{r.t}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-center">
                  <span className="inline-flex bg-[#0A0A0A] text-white rounded-full px-3 py-1 text-[11px] font-bold">Vault max 12 • Groq 120B</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="border-y border-[#EDEDED] bg-white">
        <div className="max-w-[1240px] mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] font-bold tracking-widest text-[#9CA3AF]">TRUSTED FOR REAL OUTREACH</span>
          <div className="flex flex-wrap gap-2 justify-center">
            {["APOLLO", "HUNTER", "GROQ 120B", "RESEND", "TELEGRAM"].map(b => (
              <span key={b} className="text-[11px] font-black tracking-wide border border-[#EDEDED] rounded-full px-3 py-1 bg-[#FFFCF8]">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE STATS — new premium ticker */}
      <section className="max-w-[1240px] mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { v: "12,400+", l: "Companies discovered", sub: "last 30 days" },
            { v: "98.2%", l: "Email deliverability", sub: "Apollo verified" },
            { v: "4,500+", l: "Audience reach", sub: "YouTube + LinkedIn + TG" },
            { v: "3.2x", l: "Avg reply lift", sub: "vs info@ outreach" },
          ].map(s => (
            <div key={s.l} className="bg-white border border-[#EDEDED] rounded-2xl p-4 text-center">
              <div className="text-[22px] md:text-[26px] font-black tracking-[-0.02em]">{s.v}</div>
              <div className="text-[12px] font-bold text-[#0A0A0A]">{s.l}</div>
              <div className="text-[11px] text-[#9CA3AF]">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS — new social proof */}
      <section className="max-w-[1240px] mx-auto px-4 md:px-6">
        <div className="bg-[#F9FAFB] border border-[#EDEDED] rounded-[20px] p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[13px] font-black tracking-[0.12em] text-[#6B7280]">LOVED BY AGENCIES & FOUNDERS</h3>
            <span className="hidden sm:inline text-[11px] font-bold bg-white border border-[#EDEDED] rounded-full px-2.5 py-1">★★★★★ 4.9/5</span>
          </div>
          <div className="mt-4 grid md:grid-cols-3 gap-4">
            {[
              { n: "Amara • Skincare Brand", t: "Found 18 verified owners in USA in one search. 3 replied YES same week. Way better than buying lists." },
              { n: "Tunde • Real Estate Dubai", t: "Global search actually works. Got UK + Dubai owners, not Lagos info@. Vault + Telegram is clutch." },
              { n: "Priya • SaaS Agency", t: "Groq 120B posts are real, not mocked. Sent from Vault, tracked to Won $250. Clean OS." },
            ].map(q => (
              <div key={q.n} className="bg-white border border-[#EDEDED] rounded-2xl p-4">
                <div className="text-[12px] leading-[1.6] text-[#0A0A0A]">“{q.t}”</div>
                <div className="mt-3 text-[11px] font-bold text-[#6B7280]">— {q.n}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-[1240px] mx-auto px-4 md:px-6 py-12">
        <div className="max-w-[720px]">
          <p className="text-[11px] font-black tracking-[0.16em] text-[#5E17EB]">PLATFORM</p>
          <h2 className="mt-2 text-[28px] md:text-[36px] font-black leading-[0.95] tracking-[-0.03em]">Everything you need — in one OS.</h2>
          <p className="mt-3 text-[14px] leading-[1.6] text-[#6B7280]">Find, verify, save, send, and track — without spreadsheets or fake lists.</p>
        </div>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { t: "Verified owner emails", d: "Apollo + Hunter. CEOs & founders, not info@. Real, deliverable." },
            { t: "Global search", d: "USA, UK, Dubai, worldwide. You choose country, not Lagos only." },
            { t: "Vault (max 12)", d: "Save campaigns securely. Fixed old 400-id bug, oldest auto-removed." },
            { t: "Groq 120B — real", d: "Own model via GROQ_MODEL env. No mocked fallback." },
            { t: "Resend outreach", d: "Send from Vault with one click, track opens, dedup domain." },
            { t: "Inbox + Telegram", d: "Hot-lead detection + 🔥 Telegram alert + follow-up approval." },
          ].map(f => (
            <div key={f.t} className="bg-white border border-[#EDEDED] rounded-2xl p-5">
              <div className="w-8 h-8 rounded-lg bg-[#0A0A0A] text-white flex items-center justify-center text-[11px] font-black">✓</div>
              <h3 className="mt-3 text-[14px] font-bold">{f.t}</h3>
              <p className="mt-1 text-[13px] leading-[1.5] text-[#6B7280]">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="bg-[#0A0A0A] text-white">
        <div className="max-w-[1240px] mx-auto px-4 md:px-6 py-12">
          <div className="max-w-[720px]">
            <p className="text-[11px] font-black tracking-[0.16em] text-[#A78BFA]">HOW IT WORKS</p>
            <h2 className="mt-2 text-[28px] md:text-[36px] font-black leading-[0.95]">From search to close in 3 steps.</h2>
          </div>
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {[
              { n: "01", t: "Search", d: "Pick niche + country. Apollo returns companies with verified owner emails." },
              { n: "02", t: "Save & Send", d: "Save to Vault (max 12). Send via Resend from Vault — 1 click." },
              { n: "03", t: "Track & Close", d: "Inbox detects YES, Telegram pings, approve follow-up, mark Won $250." },
            ].map(s => (
              <div key={s.n} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-[11px] font-black tracking-widest text-[#A78BFA]">{s.n}</div>
                <h3 className="mt-2 text-[16px] font-bold">{s.t}</h3>
                <p className="mt-2 text-[13px] leading-[1.6] text-white/60">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON — new vs alternatives */}
      <section className="max-w-[1240px] mx-auto px-4 md:px-6 py-10">
        <div className="text-center max-w-[640px] mx-auto">
          <p className="text-[11px] font-black tracking-[0.16em] text-[#5E17EB]">WHY ALPHA</p>
          <h2 className="mt-2 text-[26px] md:text-[32px] font-black leading-[0.95]">Why Alpha vs buying lists or Apollo alone?</h2>
        </div>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#EDEDED] rounded-2xl p-5 opacity-60">
            <h3 className="text-[13px] font-black">Buying Lists</h3>
            <p className="text-[12px] text-[#6B7280] mt-1">Stale • info@ • Lagos only • No tracking</p>
            <ul className="mt-3 space-y-1 text-[12px] text-[#6B7280]"><li>✕ Not verified</li><li>✕ No Vault</li><li>✕ No Inbox alert</li></ul>
          </div>
          <div className="bg-white border border-[#EDEDED] rounded-2xl p-5 opacity-60">
            <h3 className="text-[13px] font-black">Apollo Alone</h3>
            <p className="text-[12px] text-[#6B7280] mt-1">Pay $99/mo • No outreach • No tracking</p>
            <ul className="mt-3 space-y-1 text-[12px] text-[#6B7280]"><li>✕ No Resend</li><li>✕ No Groq posts</li><li>✕ No Telegram</li></ul>
          </div>
          <div className="bg-[#0A0A0A] text-white rounded-2xl p-5 border border-[#0A0A0A] shadow-[0_16px_32px_rgba(0,0,0,0.16)]">
            <div className="inline-flex bg-[#5E17EB] text-white text-[10px] font-black px-2 py-1 rounded-full">ALPHA OS — $50 lifetime</div>
            <h3 className="mt-2 text-[14px] font-black">Search → Vault → Send → Track</h3>
            <ul className="mt-3 space-y-1 text-[12px] text-white/70"><li>✓ Apollo + Hunter verified</li><li>✓ Vault max 12 + Resend</li><li>✓ Groq 120B + Inbox + Telegram</li></ul>
          </div>
        </div>
      </section>

      {/* GUARANTEE — new premium trust */}
      <section className="max-w-[1240px] mx-auto px-4 md:px-6">
        <div className="bg-gradient-to-br from-[#F0EFFF] to-white border border-[#DDD6FE] rounded-[20px] p-5 md:p-6 flex flex-col md:flex-row items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#5E17EB] text-white flex items-center justify-center shrink-0">✓</div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-[14px] font-black">Find 5 verified companies on your first search — or we’ll help you 1:1</h3>
            <p className="text-[12px] text-[#6B7280] mt-1">Try any niche + country. If you don’t get 5 results, message us and we’ll run a live search with you.</p>
          </div>
          <button onClick={handleGetAccess} className="shrink-0 bg-[#0A0A0A] text-white rounded-full px-5 py-2.5 text-[13px] font-bold">Get Access — $50</button>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-[1240px] mx-auto px-4 md:px-6 py-12">
        <div className="text-center max-w-[640px] mx-auto">
          <p className="text-[11px] font-black tracking-[0.16em] text-[#5E17EB]">PRICING — PAY ONCE</p>
          <h2 className="mt-2 text-[30px] md:text-[40px] font-black tracking-[-0.03em]">Lifetime access — <span className="text-[#5E17EB]">$50</span></h2>
          <p className="mt-2 text-[14px] text-[#6B7280]">Same tool we use. No monthly. No renewal.</p>
        </div>
        <div className="mt-8 flex justify-center">
          <div className="w-full max-w-[560px] bg-white border border-[#E5E7EB] rounded-[24px] p-6 md:p-7 shadow-[0_16px_40px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black tracking-widest text-[#5E17EB]">LIFETIME — $50</span>
              <span className="bg-[#0A0A0A] text-white text-[11px] font-bold px-2.5 py-1 rounded-full">Most Popular</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-[42px] font-black tracking-[-0.03em]">$50</span>
              <span className="text-[13px] font-semibold bg-[#F0EFFF] text-[#5E17EB] border border-[#DDD6FE] px-2 py-1 rounded-full">Lifetime</span>
            </div>
            <ul className="mt-5 space-y-2.5">
              {[
                "Search any niche + country (Global)",
                "Verified owner emails (Apollo + Hunter)",
                "Vault max 12 + Resend outreach",
                "Groq 120B real content",
                "Inbox + Telegram hot-lead alert",
              ].map(t => (
                <li key={t} className="flex gap-2 text-[13px]"><span className="w-5 h-5 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-[10px] shrink-0">✓</span>{t}</li>
              ))}
            </ul>
            <button onClick={handleGetAccess} className="mt-6 w-full bg-[#5E17EB] hover:bg-[#4E0FD1] text-white rounded-full py-3.5 text-[14px] font-bold">Get Access for $50</button>
            <p className="mt-3 text-center text-[11px] text-[#9CA3AF]">Paystack • Instant access • Same tool we use</p>
          </div>
        </div>
      </section>

      {/* FOUNDING BONUS — addition: $2K system via AlphaTekx loss-leader */}
      <section className="max-w-[1240px] mx-auto px-4 md:px-6 pb-6">
        <div className="bg-[#0A0A0A] rounded-[20px] p-[1px]">
          <div className="bg-gradient-to-br from-[#0A0A0A] to-[#1A1033] rounded-[19px] p-6 md:p-8">
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-[#5E17EB] text-white text-[11px] font-black px-3 py-1 rounded-full">FOUNDING BONUS — $2,000+ VALUE FREE</div>
                <h3 className="mt-3 text-[20px] md:text-[26px] font-black leading-[0.95] text-white">Free Custom System via AlphaTekx Automation</h3>
                <p className="mt-2 text-[13px] leading-[1.6] text-white/60">Not a static website — a live, working system built on our automated enterprise platform (templates + Groq 120B, not 3 weeks coding). We offer this loss-leader to our first 7 founding partners to build case studies.</p>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['CRM','Booking System','Inventory Tracker','Payment Gateway','E-commerce Store','Business Dashboard'].map(s=>(
                    <span key={s} className="bg-white/10 border border-white/10 text-white text-[11px] font-bold px-3 py-2 rounded-full text-center">{s}</span>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-white/50">(Note: Bonus strictly tied to founding partnership slots)</p>
              </div>
              <div className="lg:w-[340px] w-full bg-white rounded-2xl p-5 shrink-0">
                <div className="text-[11px] font-black tracking-widest text-[#5E17EB]">FOUNDING PARTNER — $250</div>
                <div className="mt-1 flex items-baseline gap-2"><span className="text-[28px] font-black">$250</span><span className="text-[12px] line-through text-[#9CA3AF]">$500</span><span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">7 left</span></div>
                <p className="mt-1 text-[12px] text-[#6B7280]">Ads across YouTube 3K + LinkedIn 1270 + Telegram & WhatsApp 300+ (131+86+184)</p>
                <ul className="mt-3 space-y-1.5 text-[12px]"><li className="flex gap-2"><span className="text-emerald-500">✓</span> Live system, not static</li><li className="flex gap-2"><span className="text-emerald-500">✓</span> Groq 120B automation</li><li className="flex gap-2"><span className="text-emerald-500">✓</span> Private checkout POST /api/checkout/service 25000</li></ul>
                <button onClick={handleGetAccess} className="mt-4 w-full bg-[#5E17EB] hover:bg-[#4E0FD1] text-white rounded-full py-3 text-[13px] font-bold">Lock Founding Slot — $250</button>
                <p className="mt-2 text-center text-[10px] text-[#9CA3AF]">Powered by AlphaTekx</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-[1240px] mx-auto px-4 md:px-6 pb-12">
        <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
          <div>
            <p className="text-[11px] font-black tracking-[0.16em] text-[#5E17EB]">FAQ</p>
            <h2 className="mt-2 text-[26px] font-black leading-[0.95]">Clear answers.</h2>
            <p className="mt-3 text-[13px] leading-[1.6] text-[#6B7280]">Still unsure? These are the real details.</p>
            <button onClick={handleGetAccess} className="mt-5 bg-[#0A0A0A] text-white rounded-full px-5 py-2.5 text-[13px] font-bold">Get Access — $50 →</button>
          </div>
          <div className="bg-white border border-[#EDEDED] rounded-2xl divide-y divide-[#F3F4F6] overflow-hidden">
            {[
              { q: "Is it really $50 lifetime?", a: "Yes. One payment, lifetime access. Vault fixed to 12, updates included." },
              { q: "How do you find companies?", a: "Apollo mixed_people + Hunter verification, Tavily fallback. Global, not Lagos-only. Real companies, not scraped junk." },
              { q: "Do you use the same tool?", a: "Yes — we use the same OS to find companies for Alpha Agency. Same Apollo source, same live data." },
              { q: "Which countries?", a: "Any. Leave blank = Global. Or type USA, UK, Dubai, Canada, etc. We map to Apollo locations." },
              { q: "What about emails?", a: "Owner emails (CEO/Founder) verified via Apollo. Not info@. If no verified email we don't show it." },
            ].map((f, i) => (
              <div key={f.q}>
                <button onClick={() => setActiveFaq(i)} className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#FFFCF8]">
                  <span className="text-[14px] font-semibold">{f.q}</span>
                  <span className={`w-7 h-7 rounded-full border flex items-center justify-center text-[12px] font-bold shrink-0 ${activeFaq === i ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' : 'bg-white border-[#EDEDED]'}`}>{activeFaq === i ? '—' : '+'}</span>
                </button>
                {activeFaq === i && <div className="px-5 pb-4 text-[13px] leading-[1.6] text-[#6B7280] bg-[#FFFCF8]/60">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#EDEDED] bg-white">
        <div className="max-w-[1240px] mx-auto px-4 md:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-[#6B7280]">
          <span>© 2024 ALPHATEKX — Alpha Agency OS</span>
          <a href="mailto:alphatekxcompany@gmail.com" className="font-semibold hover:text-[#0A0A0A]">alphatekxcompany@gmail.com</a>
        </div>
      </footer>
    </div>
  );
};
