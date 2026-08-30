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

  const handleGetAccess = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + "/access" } });
      if (error) { alert("Signup failed: " + error.message); setLoading(false); }
    } catch (e) { alert("Signup failed: " + e.message); setLoading(false); }
  };
  const handleLogin = () => handleGetAccess();
  const handleDownloadApp = async () => {
    if (deferredPrompt) { deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; if (outcome === "accepted") { setDeferredPrompt(null); setIsInstallable(false); } }
    else alert("To install:\n\n iPhone: Share -> Add to Home Screen\n Android: menu -> Install app\n Desktop: Install icon in address bar");
  };

  return (
    <div className="min-h-screen bg-[#FFFCF8] font-['Inter',sans-serif] antialiased overflow-x-hidden w-full max-w-[100vw] selection:bg-[#5E17EB] selection:text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* PREMIUM NAV */}
      <div className="w-full px-2 sm:px-3 md:px-6 pt-3 md:pt-4 sticky top-0 z-50 bg-[#FFFCF8]/70 backdrop-blur-2xl">
        <nav className="max-w-[1360px] mx-auto bg-white/90 backdrop-blur-xl border border-[#EDEDED]/80 rounded-2xl md:rounded-[22px] px-3 sm:px-5 md:px-7 py-3 md:py-3.5 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.06)] gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br from-[#5E17EB] via-[#7C3AED] to-[#A78BFA] rounded-xl md:rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(94,23,235,0.35)]">
              <span className="text-white text-[18px] md:text-[20px] font-black tracking-tighter -mt-0.5">A</span>
            </div>
            <div className="leading-none">
              <div className="flex items-center gap-2">
                <span className="text-[19px] md:text-[22px] font-black tracking-[-0.03em] text-[#0A0A0A]">ALPHATEKX</span>
                <span className="hidden sm:inline-flex items-center text-[9px] font-black tracking-[0.14em] text-white bg-[#0A0A0A] px-2.5 py-1 rounded-full">ALPHA AGENCY OS</span>
              </div>
              <div className="hidden md:block text-[10px] font-bold tracking-wide text-[#5E17EB] -mt-0.5">REAL COMPANIES — VERIFIED EMAILS — LIVE</div>
            </div>
          </div>
          <div className="hidden xl:flex items-center gap-6">
            <a href="#proof" onClick={(e)=>{e.preventDefault(); document.getElementById('proof')?.scrollIntoView({behavior:'smooth'})}} className="text-[13px] font-semibold text-[#0A0A0A]/70 hover:text-[#0A0A0A]">Proof</a>
            <a href="#features" onClick={(e)=>{e.preventDefault(); document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}} className="text-[13px] font-semibold text-[#0A0A0A]/70 hover:text-[#0A0A0A]">Features</a>
            <a href="#how-it-works" onClick={(e)=>{e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({behavior:'smooth'})}} className="text-[13px] font-semibold text-[#0A0A0A]/70 hover:text-[#0A0A0A]">How it works</a>
            <a href="#pricing" onClick={(e)=>{e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})}} className="text-[13px] font-semibold text-[#0A0A0A]/70 hover:text-[#0A0A0A]">Pricing</a>
            <button onClick={handleLogin} className="bg-white border border-[#EDEDED] rounded-xl px-5 py-2.5 text-[13px] font-bold hover:bg-[#FAFAFA]">Log in</button>
            <button onClick={handleGetAccess} className="bg-[#0A0A0A] hover:bg-black text-white rounded-xl px-6 py-3 text-[13px] font-black shadow-[0_10px_24px_rgba(0,0,0,0.18)]">Get Access — $50</button>
          </div>
          <button onClick={handleGetAccess} className="xl:hidden bg-[#5E17EB] hover:bg-[#4D0FD4] text-white rounded-xl px-5 py-2.5 text-[13px] font-black shadow-[0_8px_20px_rgba(94,23,235,0.3)]">Get Access $50</button>
        </nav>
      </div>

      {/* HERO UPGRADED */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-2">
        <div className="grid lg:grid-cols-[1.08fr_0.92fr] gap-6 md:gap-8 items-center">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-[520px] h-[420px] bg-gradient-to-br from-[#5E17EB]/12 via-[#A78BFA]/10 to-[#FFD6E8]/20 rounded-full blur-[40px] pointer-events-none" />
            <div className="relative inline-flex items-center gap-2 bg-white border border-[#EDEDED] rounded-full pl-1 pr-3 py-1 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
              <span className="bg-[#0A0A0A] text-white rounded-full px-2.5 py-1 text-[10px] font-black tracking-wide flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> LIVE</span>
              <span className="text-[11px] font-bold tracking-wide text-[#0A0A0A]">REAL COMPANIES DATABASE ACCESS</span>
              <span className="hidden sm:inline text-[11px] font-medium text-[#6B7280]">— Apollo + Hunter verified</span>
            </div>
            <h1 className="relative mt-5 text-[32px] xs:text-[36px] sm:text-[42px] md:text-[56px] lg:text-[60px] font-black tracking-[-0.05em] leading-[0.88] text-[#0A0A0A]">
              Get Access To Real Companies With Just <span className="bg-gradient-to-r from-[#5E17EB] via-[#7C3AED] to-[#A78BFA] bg-clip-text text-transparent">$50</span> - Lifetime Access
            </h1>
            <p className="mt-4 text-[15px] md:text-[16.5px] leading-[1.6] text-[#4B5563] max-w-[620px] font-medium">
              People use our tool to get access to real companies - We also use same tool to get companies for our own company
            </p>
            <p className="mt-2.5 inline-flex items-center gap-2 text-[13px] md:text-[14px] leading-[1.5] text-[#0A0A0A] bg-white border border-[#EDEDED] rounded-full px-3.5 py-2 shadow-sm max-w-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" /> Not info@ emails — Real owner emails — Global <b>USA/UK/Global</b> search (not Lagos)
            </p>
            <p className="mt-3 text-[12.5px] font-semibold text-[#5E17EB] flex items-center gap-2"><span className="w-6 h-0.5 bg-[#5E17EB]/20 rounded-full" /> Use the same tool we use to access companies — Pay once, use forever</p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
              <span className="bg-[#0A0A0A] text-white rounded-full px-3.5 py-1.5 shadow">Real owner emails (not info@)</span>
              <span className="bg-white border border-[#EDEDED] text-[#0A0A0A] rounded-full px-3.5 py-1.5">Global USA/UK/Global</span>
              <span className="bg-white border border-[#EDEDED] text-[#0A0A0A] rounded-full px-3.5 py-1.5">Apollo verified</span>
              <span className="hidden sm:inline-flex bg-[#F0EFFF] border border-[#DDD6FE] text-[#5E17EB] rounded-full px-3.5 py-1.5">Real Companies Database Access</span>
            </div>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <button onClick={handleGetAccess} disabled={loading} className="group bg-[#5E17EB] hover:bg-[#4D0FD4] text-white rounded-2xl px-7 py-4 text-[15px] font-black flex items-center justify-center gap-3 shadow-[0_16px_32px_rgba(94,23,235,0.28)] disabled:opacity-60 transition active:scale-[0.98]">
                <span className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm"><svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg></span>
                {loading ? "Connecting..." : "Get Lifetime Access - $50"}
                <span className="w-7 h-7 bg-white/15 rounded-full flex items-center justify-center group-hover:bg-white/20 transition">→</span>
              </button>
              <button onClick={handleDownloadApp} className="bg-white border border-[#EDEDED] hover:border-[#0A0A0A] text-[#0A0A0A] rounded-2xl px-6 py-4 text-[14px] font-bold hover:bg-[#FAFAFA] transition">
                {isInstallable ? "Install App" : "See how it works"}
              </button>
            </div>
            <div className="mt-3 flex items-center gap-3 text-[11px] text-[#9CA3AF]">
              <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[10px]">✓</span> Pay <b className="text-[#0A0A0A]">$50 once</b></span>
              <span className="w-1 h-1 bg-[#E5E7EB] rounded-full" />
              <span>Lifetime — No subscription</span>
              <span className="w-1 h-1 bg-[#E5E7EB] rounded-full hidden sm:inline" />
              <span className="hidden sm:inline">Same tool we use</span>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2 max-w-[520px]">
              <div className="bg-white border border-[#EDEDED] rounded-2xl p-3 text-center shadow-sm"><div className="text-[16px] font-black text-[#0A0A0A] leading-none">10k+</div><div className="text-[11px] font-semibold text-[#6B7280] mt-1">companies found</div></div>
              <div className="bg-white border border-[#EDEDED] rounded-2xl p-3 text-center shadow-sm"><div className="text-[16px] font-black text-[#0A0A0A] leading-none">USA/UK</div><div className="text-[11px] font-semibold text-[#6B7280] mt-1">Global search</div></div>
              <div className="bg-white border border-[#EDEDED] rounded-2xl p-3 text-center shadow-sm"><div className="text-[16px] font-black text-[#0A0A0A] leading-none">Vault 12</div><div className="text-[11px] font-semibold text-[#6B7280] mt-1">campaigns saved</div></div>
            </div>
          </div>

          {/* LIVE DATABASE CARD */}
          <div className="relative lg:pl-2" id="proof">
            <div className="absolute -inset-3 bg-gradient-to-br from-[#5E17EB]/10 via-[#A78BFA]/10 to-[#FFD6E8]/20 rounded-[32px] blur-xl" />
            <div className="relative bg-white border border-[#E5E7EB] rounded-[24px] md:rounded-[28px] shadow-[0_24px_64px_rgba(0,0,0,0.12)] overflow-hidden">
              <div className="bg-[#0A0A0A] px-4 md:px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#FF5F56] rounded-full border border-white/10"/><span className="w-3 h-3 bg-[#FFBD2E] rounded-full border border-white/10"/><span className="w-3 h-3 bg-[#27C93F] rounded-full border border-white/10"/>
                </div>
                <span className="text-white/90 text-[11px] font-bold tracking-wide flex items-center gap-2"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> REAL COMPANIES DATABASE — LIVE</span>
                <span className="hidden sm:inline text-[10px] font-mono font-semibold text-white/60">APOLLO • HUNTER • GLOBAL</span>
              </div>
              <div className="p-4 md:p-5 bg-gradient-to-b from-[#FFFCF8] to-white">
                <div className="bg-white border border-[#EDEDED] rounded-2xl p-2.5 flex items-center gap-2.5 shadow-sm">
                  <span className="w-8 h-8 bg-[#F3F4F6] rounded-xl flex items-center justify-center text-[#9CA3AF]">⌕</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-[#9CA3AF] leading-none">Search</div>
                    <div className="text-[14px] font-bold text-[#0A0A0A]">skincare • USA</div>
                  </div>
                  <span className="bg-[#0A0A0A] text-white rounded-full px-4 py-1.5 text-[12px] font-black">Search</span>
                </div>
                <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-bold">
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-1">Global — USA</span>
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-1">UK</span>
                  <span className="bg-[#F0EFFF] text-[#5E17EB] border border-[#DDD6FE] rounded-full px-2.5 py-1">Global (not Lagos)</span>
                </div>
                <div className="mt-4 space-y-2.5">
                  <div className="group bg-white border border-[#EDEDED] rounded-2xl p-3 flex items-center justify-between hover:border-[#5E17EB]/20 hover:shadow-[0_4px_16px_rgba(94,23,235,0.08)] transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5E17EB] to-[#7C3AED] flex items-center justify-center text-white text-[13px] font-black shrink-0">G</div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-black text-[#0A0A0A] leading-none">Glow Skin Co</div>
                        <div className="text-[11px] font-medium text-[#6B7280] truncate">glowskin.co • CEO • Sarah Kim</div>
                        <div className="text-[11px] font-semibold text-[#0A0A0A] truncate">sarah@glowskin.co</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black border px-2 py-1 rounded-full shrink-0 bg-emerald-50 border-emerald-200 text-emerald-700">Apollo verified</span>
                  </div>
                  <div className="group bg-white border border-[#EDEDED] rounded-2xl p-3 flex items-center justify-between hover:border-[#5E17EB]/20 hover:shadow-[0_4px_16px_rgba(94,23,235,0.08)] transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A0A0A] to-[#272727] flex items-center justify-center text-white text-[13px] font-black shrink-0">P</div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-black text-[#0A0A0A] leading-none">Pure Botanics</div>
                        <div className="text-[11px] font-medium text-[#6B7280] truncate">purebotanics.com • Owner • James Park</div>
                        <div className="text-[11px] font-semibold text-[#0A0A0A] truncate">james@purebotanics.com</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black border px-2 py-1 rounded-full shrink-0 bg-emerald-50 border-emerald-200 text-emerald-700">Hunter verified</span>
                  </div>
                  <div className="group bg-white border border-[#EDEDED] rounded-2xl p-3 flex items-center justify-between hover:border-[#5E17EB]/20 hover:shadow-[0_4px_16px_rgba(94,23,235,0.08)] transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#059669] to-[#047857] flex items-center justify-center text-white text-[13px] font-black shrink-0">L</div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-black text-[#0A0A0A] leading-none">Luxe Beauty Lab</div>
                        <div className="text-[11px] font-medium text-[#6B7280] truncate">luxebeauty.co • Founder • Emma Doyle</div>
                        <div className="text-[11px] font-semibold text-[#0A0A0A] truncate">emma@luxebeauty.co</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black border px-2 py-1 rounded-full shrink-0 bg-blue-50 border-blue-200 text-blue-700">Verified owner</span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-bold text-center">
                  <span className="bg-white border border-[#EDEDED] rounded-full py-2 shadow-sm">Apollo ✓</span>
                  <span className="bg-white border border-[#EDEDED] rounded-full py-2 shadow-sm">Hunter ✓</span>
                  <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full py-2">Not info@</span>
                </div>
                <div className="mt-4 flex items-center justify-center">
                  <span className="bg-[#0A0A0A] text-white rounded-full px-4 py-1.5 text-[11px] font-black tracking-wide shadow">Real Companies Database Access</span>
                </div>
              </div>
              <div className="px-4 md:px-5 py-3 bg-[#F9FAFB] border-t border-[#EDEDED] flex items-center justify-between text-[11px]">
                <span className="font-semibold text-[#6B7280]">Owner emails • Verified • Global</span>
                <span className="font-mono font-semibold text-[#9CA3AF]">vault: max 12 • Groq 120B</span>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-2 md:-right-4 bg-[#0A0A0A] text-white rounded-2xl px-4 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.22)] hidden md:flex items-center gap-3 border border-white/10">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">✓</div>
              <div>
                <div className="text-[11px] font-bold opacity-60 leading-none">YOU GET</div>
                <div className="text-[13px] font-black leading-none mt-1">Company — Owner — Email — Verified</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NICHE MARQUEE */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-6 py-4">
        <p className="text-center text-[10px] md:text-[11px] font-black tracking-[0.16em] text-[#9CA3AF] uppercase">Built for agencies, freelancers, marketers who need real companies</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2 md:gap-2.5">
          {["SKINCARE","FITNESS","SHOPIFY","SAAS","AMAZON","COACHING","REAL ESTATE","CLINICS","E-COM","LOCAL","HOTELS","GYMS"].map(t=>(
            <span key={t} className="bg-white border border-[#EDEDED] rounded-full px-3.5 py-1.5 text-[11px] font-black tracking-wide text-[#0A0A0A]/70 shadow-sm hover:border-[#5E17EB]/20 hover:text-[#5E17EB] transition">{t}</span>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-[1360px] mx-auto px-4 md:px-6 pt-8">
        <div className="rounded-[24px] md:rounded-[28px] bg-[#0A0A0A] text-white p-6 md:p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#5E17EB]/25 via-transparent to-[#A78BFA]/15" />
          <div className="absolute -top-24 -right-24 w-[520px] h-[520px] bg-[#5E17EB] rounded-full blur-[90px] opacity-20" />
          <div className="relative grid lg:grid-cols-[0.95fr_1.05fr] gap-8 items-start">
            <div>
              <p className="text-[#A78BFA] text-[11px] font-black tracking-[0.18em] uppercase">Platform — Premium</p>
              <h2 className="mt-2 text-[26px] md:text-[36px] font-black tracking-[-0.03em] leading-[0.95]">Real platform.<br />Not a spreadsheet.</h2>
              <p className="mt-3 text-white/65 text-[14px] leading-[1.6]">Find, verify, save, and create — all inside one premium OS. Built to get real owner emails at scale, not scrape junk.</p>
              <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/10 border border-white/10 rounded-2xl p-3"><div className="text-[18px] font-black">Global</div><div className="text-[11px] font-semibold text-white/60">USA/UK/Global</div></div>
                <div className="bg-white/10 border border-white/10 rounded-2xl p-3"><div className="text-[18px] font-black">Verified</div><div className="text-[11px] font-semibold text-white/60">Apollo+Hunter</div></div>
                <div className="bg-white text-[#0A0A0A] rounded-2xl p-3"><div className="text-[18px] font-black">$50</div><div className="text-[11px] font-bold text-[#6B7280]">Lifetime</div></div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-[#EDEDED] shadow-sm"><div className="w-9 h-9 rounded-xl bg-[#0A0A0A] text-white flex items-center justify-center text-[13px] font-black">@</div><div className="mt-3 text-[14px] font-black text-[#0A0A0A] leading-none">Real owner emails</div><div className="mt-1.5 text-[13px] leading-[1.5] text-[#6B7280]">Not info@. Apollo + Hunter verified CEO/Founder emails.</div></div>
              <div className="bg-white rounded-2xl p-4 border border-[#EDEDED] shadow-sm"><div className="w-9 h-9 rounded-xl bg-[#0A0A0A] text-white flex items-center justify-center text-[13px] font-black">◉</div><div className="mt-3 text-[14px] font-black text-[#0A0A0A] leading-none">Global search</div><div className="mt-1.5 text-[13px] leading-[1.5] text-[#6B7280]">USA, UK, Global worldwide. Not Lagos hardcoded.</div></div>
              <div className="bg-white rounded-2xl p-4 border border-[#EDEDED] shadow-sm"><div className="w-9 h-9 rounded-xl bg-[#0A0A0A] text-white flex items-center justify-center text-[13px] font-black">⬢</div><div className="mt-3 text-[14px] font-black text-[#0A0A0A] leading-none">Vault max 12</div><div className="mt-1.5 text-[13px] leading-[1.5] text-[#6B7280]">Save up to 12 campaigns securely. Fixed from 400 UUID bug.</div></div>
              <div className="bg-white rounded-2xl p-4 border border-[#EDEDED] shadow-sm"><div className="w-9 h-9 rounded-xl bg-[#0A0A0A] text-white flex items-center justify-center text-[13px] font-black">✦</div><div className="mt-3 text-[14px] font-black text-[#0A0A0A] leading-none">Groq 120B real</div><div className="mt-1.5 text-[13px] leading-[1.5] text-[#6B7280]">Your own 120B model via GROQ_MODEL env. Real content, mocked:false.</div></div>
              <div className="bg-white rounded-2xl p-4 border border-[#EDEDED] shadow-sm"><div className="w-9 h-9 rounded-xl bg-[#0A0A0A] text-white flex items-center justify-center text-[13px] font-black">◆</div><div className="mt-3 text-[14px] font-black text-[#0A0A0A] leading-none">Same tool we use</div><div className="mt-1.5 text-[13px] leading-[1.5] text-[#6B7280]">People use our tool and we use same tool for Alpha Agency.</div></div>
              <div className="bg-white rounded-2xl p-4 border border-[#EDEDED] shadow-sm"><div className="w-9 h-9 rounded-xl bg-[#0A0A0A] text-white flex items-center justify-center text-[13px] font-black">$</div><div className="mt-3 text-[14px] font-black text-[#0A0A0A] leading-none">Pay once</div><div className="mt-1.5 text-[13px] leading-[1.5] text-[#6B7280]">$50 lifetime. No monthly. No renewal. Lifetime access.</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-[1360px] mx-auto px-4 md:px-6 pt-10">
        <div className="text-center max-w-[760px] mx-auto">
          <p className="text-[#5E17EB] text-[11px] font-black tracking-[0.18em] uppercase">How It Works — Same Tool Both Sides</p>
          <h2 className="mt-2 text-[30px] md:text-[44px] font-black tracking-[-0.03em] leading-[0.95] text-[#0A0A0A]">People use our tool + we use same tool</h2>
          <p className="mt-3 text-[#6B7280] md:text-[16px] leading-[1.6]">Anyone can pay <b className="text-[#0A0A0A]">$50 lifetime</b> to get real companies (Global USA/UK). We also use same tool to find companies for Alpha Agency privately — same database, same verification.</p>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 relative">
          <div className="hidden md:block absolute top-[28px] left-[16%] right-[16%] h-px bg-gradient-to-r from-[#EDEDED] via-[#DDD6FE] to-[#EDEDED]" />
          <div className="relative bg-white border border-[#EDEDED] rounded-2xl p-6 md:p-7 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5E17EB] to-[#7C3AED] flex items-center justify-center text-white font-black text-[13px] shadow-lg">01</div>
            <h3 className="mt-4 text-[16px] font-black text-[#0A0A0A] leading-tight">People Use Our Tool ($50)</h3>
            <p className="mt-2 text-[13.5px] leading-[1.6] text-[#4B5563]">Pay $50 lifetime, search any niche + country (USA/UK/Global), get real owner emails via Apollo/Hunter. Not info@, verified, Global not Lagos.</p>
          </div>
          <div className="relative bg-white border border-[#EDEDED] rounded-2xl p-6 md:p-7 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0A0A0A] to-[#272727] flex items-center justify-center text-white font-black text-[13px] shadow-lg">02</div>
            <h3 className="mt-4 text-[16px] font-black text-[#0A0A0A] leading-tight">We Also Use Same Tool</h3>
            <p className="mt-2 text-[13.5px] leading-[1.6] text-[#4B5563]">We use same tool to get access to companies for Alpha Agency. Same platform, same Apollo verification, same live database.</p>
          </div>
          <div className="relative bg-white border border-[#EDEDED] rounded-2xl p-6 md:p-7 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#059669] to-[#047857] flex items-center justify-center text-white font-black text-[13px] shadow-lg">03</div>
            <h3 className="mt-4 text-[16px] font-black text-[#0A0A0A] leading-tight">Real Companies Only</h3>
            <p className="mt-2 text-[13.5px] leading-[1.6] text-[#4B5563]">Global search, real owner emails, Vault max 12 (fixed), Groq 120B real content mocked:false. Premium, fast, accurate.</p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-[1360px] mx-auto px-4 md:px-6 py-10">
        <div className="text-center max-w-[760px] mx-auto">
          <p className="text-[#5E17EB] text-[11px] font-black tracking-[0.16em] uppercase">Pay Once, Use Forever — Same Tool We Use</p>
          <h2 className="mt-2 text-[30px] md:text-[44px] font-black tracking-tight leading-[0.95]">Get Access To Real Companies — <span className="bg-gradient-to-r from-[#5E17EB] to-[#7C3AED] bg-clip-text text-transparent">$50 Lifetime</span></h2>
          <p className="mt-2 text-[#6B7280] text-[14px]">Lifetime Tool Access — For Agencies & Marketers Who Need Our Company Access Tool</p>
        </div>
        <div className="mt-8 flex justify-center">
          <div className="relative bg-white border-2 border-[#5E17EB]/20 rounded-[24px] p-6 md:p-8 w-full max-w-[560px] shadow-[0_16px_48px_rgba(94,23,235,0.14)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F0EFFF] via-white to-white pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-[220px] h-[220px] bg-gradient-to-br from-[#5E17EB]/12 to-[#A78BFA]/12 rounded-full blur-[24px]" />
            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black tracking-[0.14em] uppercase text-[#5E17EB]">Lifetime Tool Access — $50</p>
                  <p className="text-[12px] font-semibold text-[#6B7280] mt-1">For Agencies & Marketers Who Need Our Company Access Tool</p>
                </div>
                <span className="bg-[#0A0A0A] text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow">Most Popular</span>
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <p className="text-[48px] font-black leading-none tracking-[-0.04em]">$50</p>
                <span className="text-[13px] font-bold text-white bg-[#5E17EB] px-2.5 py-1 rounded-full">Lifetime</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">Pay once</span>
              </div>
              <p className="text-[13px] font-medium text-[#6B7280]">Pay once, use forever — Same tool we use for our company</p>
              <div className="mt-5 grid grid-cols-1 gap-3">
                <div className="flex gap-2.5 text-[13.5px] font-medium leading-[1.4]"><span className="w-6 h-6 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-[11px] shrink-0 mt-0.5">✓</span><span className="text-[#0A0A0A]">Lifetime access to platform (pay once)</span></div>
                <div className="flex gap-2.5 text-[13.5px] font-medium leading-[1.4]"><span className="w-6 h-6 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-[11px] shrink-0 mt-0.5">✓</span><span className="text-[#0A0A0A]">Get access to real companies (Global USA/UK, not Lagos info@)</span></div>
                <div className="flex gap-2.5 text-[13.5px] font-medium leading-[1.4]"><span className="w-6 h-6 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-[11px] shrink-0 mt-0.5">✓</span><span className="text-[#0A0A0A]">Real owner emails (not info@) — Apollo + Hunter verified</span></div>
                <div className="flex gap-2.5 text-[13.5px] font-medium leading-[1.4]"><span className="w-6 h-6 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-[11px] shrink-0 mt-0.5">✓</span><span className="text-[#0A0A0A]">Vault save max 12 campaigns (fixed from 400 UUID bug)</span></div>
                <div className="flex gap-2.5 text-[13.5px] font-medium leading-[1.4]"><span className="w-6 h-6 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-[11px] shrink-0 mt-0.5">✓</span><span className="text-[#0A0A0A]">Content generation with Groq 120B own model (real, not mocked)</span></div>
                <div className="flex gap-2.5 text-[13.5px] font-medium leading-[1.4]"><span className="w-6 h-6 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-[11px] shrink-0 mt-0.5">✓</span><span className="text-[#0A0A0A]">Search any country (USA, UK, Global)</span></div>
                <div className="flex gap-2.5 text-[13.5px] font-medium leading-[1.4]"><span className="w-6 h-6 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-[11px] shrink-0 mt-0.5">✓</span><span className="text-[#0A0A0A]">Same tool we use for our own company</span></div>
                <div className="flex gap-2.5 text-[13.5px] font-medium leading-[1.4]"><span className="w-6 h-6 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-[11px] shrink-0 mt-0.5">✓</span><span className="text-[#0A0A0A]">Real Companies Database Access — Live</span></div>
              </div>
              <button onClick={handleGetAccess} className="mt-6 w-full bg-[#5E17EB] hover:bg-[#4D0FD4] text-white rounded-2xl py-4 text-[15px] font-black shadow-[0_12px_24px_rgba(94,23,235,0.28)] transition active:scale-[0.98]">Get Tool For $50 Lifetime — Pay once</button>
              <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-semibold text-[#6B7280]">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> No subscription • Vault 12 • Groq 120B • Global not Lagos
              </div>
              <p className="mt-2 text-center text-[11px] font-medium text-[#9CA3AF]">Secure checkout via Paystack — Instant access — Lifetime updates</p>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-[11px] font-medium text-[#9CA3AF]">$50 Lifetime = real companies + verified owner emails + vault 12 + Groq 120B real content. Same tool we use.</p>
      </section>

      {/* WHAT YOU GET */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-6">
        <div className="bg-white border border-[#EDEDED] rounded-[20px] p-6 md:p-7 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0A0A0A] text-white flex items-center justify-center text-[14px]">✦</div>
            <h3 className="text-[16px] font-black tracking-tight">What you get — premium, verified, global</h3>
            <span className="ml-auto hidden sm:inline text-[11px] font-bold bg-[#F0EFFF] text-[#5E17EB] border border-[#DDD6FE] px-2.5 py-1 rounded-full">Real, not mock</span>
          </div>
          <div className="mt-5 grid md:grid-cols-4 gap-6 text-[13.5px] leading-[1.6] text-[#4B5563]">
            <div className="bg-[#FFFCF8] border border-[#F3F4F6] rounded-2xl p-4"><b className="text-[#0A0A0A]">Real, not mock.</b> Apollo + Hunter + Places. No info@ guess. Every email verified, Global not Lagos only.</div>
            <div className="bg-[#FFFCF8] border border-[#F3F4F6] rounded-2xl p-4"><b className="text-[#0A0A0A]">You control outreach.</b> Find companies, save to vault (max 12), generate real Groq 120B content, track replies.</div>
            <div className="bg-[#FFFCF8] border border-[#F3F4F6] rounded-2xl p-4"><b className="text-[#0A0A0A]">Same tool we use.</b> People use our tool, we also use same tool for Alpha Agency — real database.</div>
            <div className="bg-[#F0EFFF] border border-[#DDD6FE] rounded-2xl p-4"><b className="text-[#5E17EB]">Pay once.</b> <span className="text-[#4B5563]">$50 lifetime, no monthly, lifetime access. Vault fixed, Global search.</span></div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-6 py-10">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6 items-start">
          <div className="lg:sticky lg:top-[88px]">
            <p className="text-[#5E17EB] text-[11px] font-black tracking-[0.16em] uppercase">FAQ — Clear answers</p>
            <h2 className="mt-2 text-[28px] md:text-[38px] font-black tracking-[-0.03em] leading-[0.95]">Questions?<br /><span className="bg-gradient-to-r from-[#5E17EB] to-[#7C3AED] bg-clip-text text-transparent">Clear answers.</span></h2>
            <p className="mt-3 text-[#4B5563] md:text-[14.5px] leading-[1.6]"><strong className="text-[#0A0A0A]">$50 Lifetime</strong> gives you real companies tool — same tool we use. Global USA/UK, real owner emails not info@, vault 12, Groq 120B real.</p>
            <button onClick={handleGetAccess} className="mt-6 bg-[#0A0A0A] hover:bg-black text-white rounded-xl px-6 py-3.5 text-[14px] font-black shadow-[0_8px_20px_rgba(0,0,0,0.16)]">Get Access — $50 →</button>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-[#6B7280]">
              <span className="w-7 h-7 bg-white border border-[#EDEDED] rounded-full flex items-center justify-center">?</span> Real owner emails • Global • Vault 12 • Groq 120B
            </div>
          </div>
          <div className="bg-white border border-[#EDEDED] rounded-2xl overflow-hidden shadow-sm divide-y divide-[#F3F4F6]">
            {[
              {q:"What does $50 Lifetime give me?", a:"Lifetime access to real companies tool: search any niche + location (USA/UK/Global), get verified owner emails (Apollo, not info@), product, save to vault max 12. Groq 120B own model for real content (not mocked). Pay once, use forever. Same tool we use for our company."},
              {q:"How do you find companies?", a:"Apollo mixed_people + Hunter domain-search (Global: USA/UK/Global, not Lagos only), plus Tavily/Serply/Overpass fallback, cached 24h. All real, no mock lists. You can also CSV import. Real owner emails, verified."},
              {q:"Do you use same tool for your company?", a:"Yes — People use our tool to get access to companies, we also use same tool to get companies for Alpha Agency. Same platform, same database, same live search. No hidden dataset."},
              {q:"Is it really $50 lifetime?", a:"Yes — $50 one-time, no subscription, no renewal. Pay once, use forever. Vault max 12 campaigns fixed from 400 UUID bug. Lifetime updates included."},
              {q:"What about Global search?", a:"Global means you choose USA, UK, or Global worldwide. Not Lagos hardcoded. Real owner emails, verified via Apollo/Hunter. Search any country you target."},
            ].map((f,i)=>(
              <div key={f.q} className="group">
                <button onClick={()=> setActiveFaq(i)} className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#FFFCF8]">
                  <span className="text-[14px] font-bold text-[#0A0A0A]">{f.q}</span>
                  <span className={`w-8 h-8 rounded-full border flex items-center justify-center text-[13px] font-bold shrink-0 transition ${activeFaq===i?'bg-[#0A0A0A] text-white border-[#0A0A0A]':'bg-white text-[#0A0A0A] border-[#EDEDED] group-hover:border-[#5E17EB]/20'}`}>{activeFaq===i?'—':'+'}</span>
                </button>
                {activeFaq===i && <div className="px-6 pb-4 text-[13.5px] leading-[1.6] text-[#4B5563] bg-[#FFFCF8]/50">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-6 pb-8">
        <div className="bg-[#0A0A0A] rounded-[28px] p-[1px] shadow-[0_24px_64px_rgba(0,0,0,0.18)]">
          <div className="bg-gradient-to-br from-[#0A0A0A] via-[#1A0A4A] to-[#5E17EB] rounded-[27px] p-8 md:p-10 lg:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[640px] h-[640px] bg-white/10 rounded-full blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 w-[420px] h-[420px] bg-[#5E17EB] rounded-full blur-[70px] opacity-30" />
            <div className="relative grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
              <div>
                <p className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.14em] uppercase text-white/70"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Lifetime access — $50 once</p>
                <h2 className="mt-2 text-[32px] md:text-[46px] font-black leading-[0.9] tracking-[-0.03em]">Get access to<br />real companies today</h2>
                <p className="mt-4 text-white/70 md:text-[15px] leading-[1.6] max-w-[520px]">Pay <strong className="text-white">$50 Lifetime</strong> once, search any niche globally (USA/UK/Global), get verified owner emails. Same tool we use. No subscription.</p>
                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button onClick={handleGetAccess} className="bg-white text-[#0A0A0A] rounded-2xl px-7 py-4 text-[15px] font-black hover:bg-[#F3F4F6] shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition active:scale-[0.98]">Get Access For $50 →</button>
                  <button onClick={handleLogin} className="bg-white/10 border border-white/20 text-white rounded-2xl px-7 py-4 text-[14px] font-bold hover:bg-white/15 backdrop-blur">Log in</button>
                </div>
                <p className="mt-3 text-[11px] font-medium text-white/60">Pay once, use forever — No subscription — Real owner emails — Global • Vault 12 • Groq 120B</p>
              </div>
              <div className="bg-white text-[#0A0A0A] rounded-2xl p-6 shadow-[0_16px_40px_rgba(0,0,0,0.22)] border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-black tracking-wide text-[#5E17EB]">YOU GET TODAY — $50 LIFETIME</div>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full">Instant access</span>
                </div>
                <ul className="mt-4 space-y-2.5 text-[13.5px] font-semibold">
                  <li className="flex gap-2.5"><span className="w-5 h-5 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span><span className="leading-tight">Search any niche + location (USA/UK/Global)</span></li>
                  <li className="flex gap-2.5"><span className="w-5 h-5 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span><span className="leading-tight">Verified owner + email + product</span></li>
                  <li className="flex gap-2.5"><span className="w-5 h-5 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span><span className="leading-tight">Vault max 12 (fixed from 400)</span></li>
                  <li className="flex gap-2.5"><span className="w-5 h-5 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span><span className="leading-tight">Groq 120B real content (not mocked)</span></li>
                </ul>
                <div className="mt-5 bg-[#0A0A0A] text-white rounded-xl p-3.5 flex items-center justify-between">
                  <span className="text-[12px] font-bold">Lifetime Access</span><div className="text-right leading-none"><span className="text-[20px] font-black">$50</span> <span className="text-[11px] font-semibold text-white/60 ml-1">pay once</span></div>
                </div>
                <p className="mt-2 text-[11px] font-medium text-center text-[#6B7280]">Secure • Paystack • Instant • Same tool we use</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-[#EDEDED] mt-2">
        <div className="max-w-[1360px] mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[12px] text-[#6B7280]">
            <span className="font-medium">© 2024 ALPHATEKX — Alpha Agency OS — $50 Lifetime Real Companies Access</span>
            <span className="flex items-center gap-3"><a href="mailto:alphatekxcompany@gmail.com" className="hover:text-[#0A0A0A] font-bold">Contact</a> <span className="w-1 h-1 bg-[#E5E7EB] rounded-full" /> <span className="text-[#5E17EB] font-black">Real data — No mock — Global not Lagos</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
};
