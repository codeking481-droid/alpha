import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export const Landing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    });
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.warn("Supabase env missing");
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) navigate("/access");
    });
  }, [navigate]);

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/access" },
      });
      if (error) {
        alert("Signup failed: " + error.message);
        setLoading(false);
      }
    } catch (e) {
      alert("Signup failed: " + e.message);
      setLoading(false);
    }
  };
  const handleLogin = () => handleGoogleSignup();
  const handleDownloadApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    } else {
      alert("To install:\n\nOn iPhone: Share → Add to Home Screen\nOn Android: ⋮ → Install app\nOn Desktop: Install icon in address bar");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFCF8] font-['Inter',sans-serif] antialiased overflow-x-hidden">
      {/* NAVBAR - bigger */}
      <div className="w-full px-4 md:px-6 pt-4 sticky top-0 z-40 bg-[#FFFCF8]/80 backdrop-blur-md">
        <nav className="max-w-[1280px] mx-auto bg-white border border-[#EDEDED] rounded-2xl px-5 md:px-7 py-4 flex items-center justify-between shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#5E17EB] rounded-xl flex items-center justify-center">
              <span className="text-white text-[28px] font-medium -mt-[2px]">α</span>
            </div>
            <span className="text-[28px] md:text-[32px] font-extrabold tracking-tight text-[#0A0A0A]">ALPHATEKX</span>
            <span className="hidden sm:inline ml-2 text-[11px] font-bold tracking-[0.12em] text-[#5E17EB] bg-[#F0EFFF] px-2.5 py-1 rounded-full">ALPHA AGENCY OS</span>
          </div>
          <div className="hidden lg:flex items-center gap-8">
            <a href="#how-it-works" onClick={(e)=>{e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({behavior:'smooth'})}} className="text-[14.5px] font-semibold text-[#0A0A0A] hover:text-[#5E17EB]">Product</a>
            <a href="#how-it-works" onClick={(e)=>{e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({behavior:'smooth'})}} className="text-[14.5px] font-semibold text-[#0A0A0A] hover:text-[#5E17EB]">How it works</a>
            <a href="#pricing" onClick={(e)=>{e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})}} className="text-[14.5px] font-semibold text-[#0A0A0A] hover:text-[#5E17EB]">Pricing</a>
            <a href="#stats" onClick={(e)=>{e.preventDefault(); document.getElementById('stats')?.scrollIntoView({behavior:'smooth'})}} className="text-[14.5px] font-semibold text-[#0A0A0A] hover:text-[#5E17EB]">Live Stats</a>
            <button onClick={handleLogin} className="ml-2 bg-white border border-[#E5E7EB] rounded-xl px-5 py-2.5 text-[14.5px] font-semibold hover:bg-gray-50">Log in</button>
            <button onClick={handleGoogleSignup} className="bg-[#0A0A0A] text-white rounded-xl px-6 py-2.5 text-[14.5px] font-semibold hover:bg-black">Start free →</button>
          </div>
          <button onClick={handleLogin} className="lg:hidden bg-[#0A0A0A] text-white rounded-xl px-5 py-2.5 text-[14px] font-semibold">Log in</button>
        </nav>
      </div>

      {/* HERO - MUCH BIGGER */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-8">
        <div className="bg-gradient-to-br from-white via-white to-[#F0EFFF] border border-[#EDEDED] rounded-[28px] p-6 md:p-12 lg:p-16 shadow-[0_20px_60px_rgba(94,23,235,0.08)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#5E17EB]/[0.04] rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#25D366]/[0.04] rounded-full blur-[60px] pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-[#0A0A0A] text-white rounded-full px-4 py-1.5 text-[12px] font-bold tracking-wide">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              LIVE: 113 TEAM MEMBERS CLOSING $500 DEALS NOW
            </div>
            <h1 className="mt-6 text-[38px] md:text-[64px] lg:text-[72px] font-black tracking-[-0.04em] leading-[0.9] text-[#0A0A0A]">
              The Invisible OS<br />
              <span className="bg-gradient-to-r from-[#5E17EB] to-[#8B5CF6] bg-clip-text text-transparent">for Modern Agencies</span>
            </h1>
            <p className="mt-6 text-[18px] md:text-[22px] leading-[1.4] text-[#0A0A0A]/70 max-w-[760px] font-medium">
              We find <span className="text-[#0A0A0A] font-bold underline decoration-[#5E17EB]/30 underline-offset-4">real companies</span> with verified emails. We send outreach via Gmail. We detect replies in 2 minutes and alert your 113 closers to close $500 packages on Telegram.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button onClick={handleGoogleSignup} disabled={loading} className="bg-[#0A0A0A] hover:bg-black text-white rounded-2xl px-8 py-4 text-[16px] font-bold flex items-center justify-center gap-3 shadow-[0_8px_24px_rgba(0,0,0,0.15)] disabled:opacity-60">
                <span className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                </span>
                {loading ? "Signing up..." : "Start with Google — Free"}
                <span>→</span>
              </button>
              <button onClick={handleDownloadApp} className="bg-white border-2 border-[#5E17EB] text-[#0A0A0A] rounded-2xl px-8 py-4 text-[16px] font-bold hover:bg-[#F0EFFF]">
                {isInstallable ? "📲 Install App" : "⬇ Download App"}
              </button>
            </div>
            <p className="mt-3 text-[13px] text-[#6B7280]">✓ No credit card • ✓ Gmail + Apollo + Telegram wired • ✓ Cancel anytime</p>
          </div>
          {/* STATS BAR */}
          <div id="stats" className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              { k: "Companies Found", v: "10,420+", sub: "last 30 days" },
              { k: "Emails Sent", v: "48.3k", sub: "via Gmail" },
              { k: "Reply Rate", v: "18.7%", sub: "avg" },
              { k: "Revenue Closed", v: "$127k", sub: "500× won" },
            ].map(s=>(
              <div key={s.k} className="bg-white border border-[#EDEDED] rounded-2xl p-4 md:p-5">
                <div className="text-[24px] md:text-[30px] font-black text-[#0A0A0A] leading-none">{s.v}</div>
                <div className="text-[12px] font-bold tracking-wide text-[#5E17EB] uppercase mt-1">{s.k}</div>
                <div className="text-[11px] text-[#6B7280]">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-6 py-6">
        <p className="text-center text-[11px] font-bold tracking-[0.16em] text-[#9CA3AF] uppercase">Trusted by 113 closers + agencies shipping $500 offers</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2 md:gap-3 text-[13px] font-semibold text-[#0A0A0A]/60">
          {["Shopify Brands","Amazon Sellers","SaaS","Local Services","E-com","Coaches","Real Estate","Clinics"].map(t=>(
            <span key={t} className="bg-white border border-[#EDEDED] rounded-full px-4 py-1.5">{t}</span>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS - BIGGER */}
      <section id="how-it-works" className="max-w-[1280px] mx-auto px-4 md:px-6 pt-8">
        <div className="text-center">
          <p className="text-[#5E17EB] text-[12px] font-black tracking-[0.16em] uppercase">How it works — 3 steps to $500</p>
          <h2 className="mt-3 text-[28px] md:text-[44px] font-black tracking-tight text-[#0A0A0A]">Find → Email → Close</h2>
          <p className="mt-2 text-[#6B7280] max-w-[640px] mx-auto">Real Apollo + Google Places data → Gmail outreach with 30s delay → 2-min polling + sentiment → Telegram hot-lead to 113 team.</p>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { n: "1", t: "Discover Real Companies", d: "Apollo.io + Hunter + Google Places + Overpass. We return company, website, owner name, verified email, product, revenue. Dedupe + CSV import.", c: "from-[#5E17EB] to-[#7C3AED]" },
            { n: "2", t: "Outreach via Gmail", d: "Templates with {company_name} {owner_name} {product}. Bulk 20 with 30s delay. Sequences Day 0/3/7. Sent → tracking.", c: "from-[#0A0A0A] to-[#272727]" },
            { n: "3", t: "Inbox → Hot Lead → Telegram", d: "Cron every 2 min scans Gmail for replies, matches companies table, OpenAI sentiment (interested/question) → 🔥 Telegram to 113.", c: "from-[#25D366] to-[#128C7E]" },
          ].map(card=>(
            <div key={card.n} className="bg-white border border-[#EDEDED] rounded-2xl p-7 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.c} flex items-center justify-center text-white font-black text-[18px]`}>{card.n}</div>
              <h3 className="mt-5 text-[20px] font-black text-[#0A0A0A]">{card.t}</h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-[#4B5563]">{card.d}</p>
              <div className="mt-4 text-[12px] font-bold text-[#5E17EB]">Learn more →</div>
            </div>
          ))}
        </div>
      </section>

      {/* PLATFORM PREVIEW + PRICING */}
      <section id="pricing" className="max-w-[1280px] mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_0.95fr] gap-6 items-start">
          <div className="bg-white border border-[#EDEDED] rounded-2xl p-5 md:p-7">
            <div className="flex items-center gap-3">
              <h3 className="text-[22px] font-black tracking-tight">10 Posts System</h3>
              <span className="bg-[#5E17EB] text-white rounded-full px-3 py-1 text-[11px] font-black">LIVE CRM</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1 text-[11px] font-bold">● Auto</span>
            </div>
            <p className="mt-1 text-[13px] text-[#6B7280]">LinkedIn + WhatsApp + Telegram scheduled. Drag pipeline: New → Contacted → Replied → Closed Won $500.</p>
            <div className="mt-5 border border-[#EDEDED] rounded-2xl overflow-hidden">
              <div className="grid grid-cols-[1.3fr_0.7fr_1.5fr_0.9fr] gap-2 px-4 py-3 bg-[#FFFCF8] border-b border-[#EDEDED] text-[12px] font-black uppercase tracking-wide">
                <span>Platform</span><span>Count</span><span>Format</span><span className="text-right">Status</span>
              </div>
              {[
                {p:"LinkedIn", c:"4 posts", f:"Thought leadership + Case study", s:"Scheduled", sC:"bg-emerald-100 text-emerald-800 border-emerald-200"},
                {p:"WhatsApp", c:"3 posts", f:"Direct message + Offer", s:"In progress", sC:"bg-[#5E17EB] text-white"},
                {p:"Telegram", c:"3 posts", f:"Broadcast + Poll to 113", s:"Queued", sC:"bg-gray-100 text-gray-700 border-gray-200"},
              ].map(r=>(
                <div key={r.p} className="grid grid-cols-[1.3fr_0.7fr_1.5fr_0.9fr] gap-2 items-center px-4 py-4 border-b last:border-0 border-[#F3F4F6] text-[13.5px]">
                  <span className="font-bold flex items-center gap-2"><span className="w-2 h-2 bg-[#5E17EB] rounded-full"/>{r.p}</span>
                  <span className="text-[#6B7280]">{r.c}</span>
                  <span className="text-[#6B7280] text-[12.5px]">{r.f}</span>
                  <span className={`ml-auto border rounded-full px-3 py-1 text-[11px] font-bold ${r.sC}`}>{r.s}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <span className="text-[11px] font-bold bg-[#F3F4F6] px-3 py-1.5 rounded-full">CSV import</span>
              <span className="text-[11px] font-bold bg-[#F3F4F6] px-3 py-1.5 rounded-full">Dedupe</span>
              <span className="text-[11px] font-bold bg-[#F0EFFF] text-[#5E17EB] px-3 py-1.5 rounded-full">Apollo verified</span>
            </div>
          </div>

          <div className="bg-[#0A0A0A] text-white rounded-2xl p-7 md:p-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#5E17EB] rounded-full blur-[40px] opacity-30" />
            <p className="text-[#A78BFA] text-[11px] font-black tracking-[0.14em] uppercase">Pricing — One-Week Campaign</p>
            <p className="mt-2 text-[44px] font-black leading-none">$500<span className="text-[14px] font-semibold text-white/60"> / week</span></p>
            <p className="text-white/70 text-[12.5px]">No hidden fees. Cancel anytime.</p>
            <ul className="mt-6 space-y-3">
              {["10 posts across 3 platforms","Apollo + Hunter verified emails","Gmail outreach (30s delay) + sequences","Inbox sentiment + Telegram hot-lead (2 min)","Pipeline: New → Closed Won $500 + stats","Team 113 + Templates + CSV"].map(li=>(
                <li key={li} className="flex gap-2.5 text-[13px] font-medium">
                  <span className="w-5 h-5 rounded-full bg-[#5E17EB] flex items-center justify-center shrink-0 mt-0.5">✓</span>
                  {li}
                </li>
              ))}
            </ul>
            <button onClick={handleLogin} className="mt-7 w-full bg-white text-[#0A0A0A] rounded-xl py-3.5 text-[14px] font-black hover:bg-[#F3F4F6]">Start now — $500 →</button>
            <p className="mt-2 text-center text-[11px] text-white/50">Secure via Paystack • Gmail OAuth • Supabase</p>
          </div>
        </div>
      </section>

      {/* FAQ-ish */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-6 pb-8">
        <div className="bg-white border border-[#EDEDED] rounded-2xl p-6 md:p-8">
          <h3 className="text-[18px] font-black">Why Alphatekx?</h3>
          <div className="mt-4 grid md:grid-cols-3 gap-6 text-[13.5px] leading-[1.6] text-[#4B5563]">
            <div><b className="text-[#0A0A0A]">Real, not mock.</b> Every company is Apollo/Google Places + MX verified. No `info@` guess without check. Cron is real, Telegram is real 113.</div>
            <div><b className="text-[#0A0A0A]">Gmail, not fake SMTP.</b> We `users.messages.send` base64 MIME via your OAuth, so Sent shows in Gmail. Owner replies → `In-Reply-To` → hot.</div>
            <div><b className="text-[#0A0A0A]">Close faster.</b> `🔥 HOT LEAD` format with Company/Owner/Email/Reply 200/Dashboard link/Time — your closers reply in 2 min, not 2 days.</div>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-[12.5px] text-[#9CA3AF]">
        © 2024 ALPHATEKX — Alpha Agency OS · Privacy · Terms · <a href="mailto:alphatekxcompany@gmail.com" className="underline">Contact</a> · <span className="text-[#5E17EB] font-bold">113 team live</span>
      </footer>
    </div>
  );
};
