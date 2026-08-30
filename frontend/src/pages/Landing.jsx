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
      {/* NAV */}
      <div className="w-full px-2 sm:px-3 md:px-6 pt-3 md:pt-4 sticky top-0 z-50 bg-[#FFFCF8]/85 backdrop-blur-xl">
        <nav className="max-w-[1360px] mx-auto bg-white border border-[#EDEDED] rounded-xl sm:rounded-2xl md:rounded-[20px] px-3 sm:px-4 md:px-8 py-3 sm:py-3.5 md:py-4 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.06)] gap-2 w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-br from-[#5E17EB] to-[#7C3AED] rounded-xl md:rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(94,23,235,0.3)]">
              <span className="text-white text-[22px] md:text-[26px] font-black -mt-[2px]">A</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[22px] md:text-[28px] font-black tracking-[-0.02em] text-[#0A0A0A] leading-none">ALPHATEKX</span>
                <span className="hidden sm:inline text-[10px] font-black tracking-[0.14em] text-white bg-[#0A0A0A] px-2.5 py-1 rounded-full">ALPHA AGENCY OS</span>
              </div>
              <div className="hidden md:block text-[11px] font-bold text-[#5E17EB] tracking-wide -mt-0.5">REAL COMPANIES - VERIFIED EMAILS - LIVE</div>
            </div>
          </div>
          <div className="hidden xl:flex items-center gap-7">
            <a href="#proof" onClick={(e)=>{e.preventDefault(); document.getElementById('proof')?.scrollIntoView({behavior:'smooth'})}} className="text-[14px] font-bold text-[#0A0A0A] hover:text-[#5E17EB]">Proof</a>
            <a href="#how-it-works" onClick={(e)=>{e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({behavior:'smooth'})}} className="text-[14px] font-bold text-[#0A0A0A] hover:text-[#5E17EB]">How it works</a>
            <a href="#pricing" onClick={(e)=>{e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})}} className="text-[14px] font-bold text-[#0A0A0A] hover:text-[#5E17EB]">Pricing</a>
            <button onClick={handleLogin} className="bg-white border-2 border-[#EDEDED] rounded-xl px-6 py-2.5 text-[14px] font-black hover:bg-gray-50">Log in</button>
            <button onClick={handleGetAccess} className="bg-[#5E17EB] hover:bg-[#4D0FD4] text-white rounded-xl px-7 py-3 text-[14px] font-black shadow-[0_6px_16px_rgba(94,23,235,0.3)]">Get Access - $50</button>
          </div>
          <button onClick={handleGetAccess} className="xl:hidden bg-[#5E17EB] hover:bg-[#4D0FD4] text-white rounded-xl px-4 sm:px-6 py-2.5 text-[13px] sm:text-[14px] font-black">Get Access $50</button>
        </nav>
      </div>

      {/* HERO - PUBLIC ONLY $50 */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-6 pt-6 md:pt-10 pb-6">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6 md:gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-[#EDEDED] rounded-full pl-1.5 pr-4 py-1.5 text-[11px] md:text-[12px] font-black tracking-wide shadow-sm">
              <span className="bg-[#5E17EB] text-white rounded-full px-2.5 py-1 text-[10px] font-black">LIVE</span>
              REAL COMPANIES DATABASE ACCESS - VERIFIED VIA APOLLO + HUNTER
            </div>
            <h1 className="mt-6 text-[32px] xs:text-[36px] sm:text-[42px] md:text-[58px] lg:text-[62px] font-black tracking-[-0.045em] leading-[0.9] text-[#0A0A0A] break-words">
              Get Access To Real Companies With Just $50 - Lifetime Access
            </h1>
            <p className="mt-4 text-[15px] md:text-[17px] leading-[1.6] text-[#4B5563] max-w-[620px] font-medium">
              People use our tool to get access to real companies - We also use same tool to get companies for our own company
            </p>
            <p className="mt-2 text-[14px] md:text-[15px] leading-[1.5] text-[#6B7280] max-w-[620px]">
              Not info@ emails - Real owner emails - Global USA/UK/Global search (not Lagos)
            </p>
            <p className="mt-2 text-[13px] font-bold text-[#5E17EB]">Use the same tool we use to access companies - Pay once, use forever</p>
            <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-bold">
              <span className="bg-[#F0EFFF] text-[#5E17EB] border border-[#DDD6FE] rounded-full px-3 py-1">Real owner emails (not info@)</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1">Global USA/UK/Global</span>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1">Apollo verified</span>
              <span className="bg-[#5E17EB] text-white border border-[#DDD6FE] rounded-full px-3 py-1">Real Companies Database Access</span>
            </div>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <button onClick={handleGetAccess} disabled={loading} className="bg-[#5E17EB] hover:bg-[#4D0FD4] text-white rounded-2xl px-8 py-4 text-[16px] font-black flex items-center justify-center gap-3 shadow-[0_12px_28px_rgba(94,23,235,0.3)] disabled:opacity-60">
                <span className="w-7 h-7 bg-white rounded-full flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg></span>
                {loading ? "Connecting..." : "Get Lifetime Access - $50"}
                <span className="text-white/70">-&gt;</span>
              </button>
            </div>
            <p className="mt-3 text-[12px] text-[#9CA3AF]">Pay <strong>$50 once</strong> - Lifetime access - Same tool we use for our company - No subscription</p>
          </div>

          {/* MOCK - REAL COMPANIES PROOF */}
          <div className="relative" id="proof">
            <div className="bg-white border border-[#E5E7EB] rounded-[24px] md:rounded-[28px] shadow-[0_24px_64px_rgba(0,0,0,0.12)] overflow-hidden">
              <div className="bg-[#0A0A0A] px-4 md:px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#FF5F56] rounded-full"/><span className="w-3 h-3 bg-[#FFBD2E] rounded-full"/><span className="w-3 h-3 bg-[#27C93F] rounded-full"/>
                </div>
                <span className="text-white/80 text-[11px] font-bold tracking-wide">REAL COMPANIES DATABASE - LIVE SEARCH</span>
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"/>
              </div>
              <div className="p-4 md:p-6 bg-[#FFFCF8]">
                <div className="bg-white border border-[#EDEDED] rounded-2xl p-3 flex items-center gap-3">
                  <span className="text-[#9CA3AF]">#</span>
                  <span className="text-[14px] font-bold text-[#0A0A0A]">skincare USA</span>
                  <span className="ml-auto bg-[#0A0A0A] text-white rounded-full px-3 py-1 text-[11px] font-black">Search</span>
                </div>
                <div className="mt-1 text-[10px] font-bold text-[#5E17EB] text-center">Global search - USA, UK, Global (not Lagos) - Real owner emails</div>
                <div className="mt-3 space-y-2">
                  {[
                    {n:"Glow Skin Co", w:"glowskin.co", e:"sarah@glowskin.co", s:"Apollo verified"},
                    {n:"Pure Botanics", w:"purebotanics.com", e:"james@purebotanics.com", s:"Hunter verified"},
                    {n:"Luxe Beauty Lab", w:"luxebeauty.co", e:"emma@luxebeauty.co", s:"Verified owner"},
                  ].map(r=>(
                    <div key={r.n} className="bg-white border border-[#EDEDED] rounded-xl p-3 flex items-center justify-between">
                      <div><div className="text-[13px] font-black">{r.n}</div><div className="text-[11px] text-[#6B7280]">{r.w} - {r.e}</div></div>
                      <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full">{r.s}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-bold text-center">
                  <span className="bg-white border rounded-full py-2">Apollo verified</span>
                  <span className="bg-white border rounded-full py-2">Hunter checked</span>
                  <span className="bg-white border rounded-full py-2">Not info@</span>
                </div>
                <div className="mt-3 text-center">
                  <span className="bg-[#5E17EB] text-white rounded-full px-3 py-1 text-[10px] font-black">Real Companies Database Access</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-[#0A0A0A] text-white rounded-2xl px-4 py-3 shadow-xl hidden md:block">
              <div className="text-[11px] font-bold opacity-60">YOU GET</div>
              <div className="text-[13px] font-black">Company - Owner - Email - Verified</div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-6 py-4">
        <p className="text-center text-[10px] md:text-[11px] font-black tracking-[0.16em] text-[#9CA3AF] uppercase">For agencies, freelancers, marketers who need real companies</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2 md:gap-3">
          {["SKINCARE","FITNESS","SHOPIFY","SAAS","AMAZON","COACHING","REAL ESTATE","CLINICS","E-COM","LOCAL"].map(t=>(
            <span key={t} className="bg-white border border-[#EDEDED] rounded-full px-3.5 md:px-4 py-1.5 md:py-2 text-[11px] md:text-[12px] font-black tracking-wide text-[#0A0A0A]/70">{t}</span>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-[1360px] mx-auto px-4 md:px-6 pt-10">
        <div className="text-center">
          <p className="text-[#5E17EB] text-[11px] font-black tracking-[0.18em] uppercase">How It Works - Same Tool Both Sides</p>
          <h2 className="mt-3 text-[30px] md:text-[44px] font-black tracking-[-0.03em] text-[#0A0A0A]">People Use Our Tool + We Use Same Tool</h2>
          <p className="mt-2 text-[#6B7280] max-w-[720px] mx-auto md:text-[16px]">Anyone can pay $50 lifetime to use our tool to get real companies (Global USA/UK). We also use same tool to find companies for Alpha Agency privately.</p>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {[
            {n:"1", t:"People Use Our Tool ($50)", d:"Pay $50 lifetime, search any niche + country (USA/UK/Global), get real owner emails via Apollo/Hunter. Not info@, verified.", c:"from-[#5E17EB] to-[#7C3AED]"},
            {n:"2", t:"We Also Use Same Tool", d:"We use same tool to get access to companies for Alpha Agency. Same database, same Apollo verification.", c:"from-[#0A0A0A] to-[#272727]"},
            {n:"3", t:"Real Companies Only", d:"Global search, real owner emails, not Lagos hardcoded. Vault max 12, Groq 120B content real not mocked.", c:"from-[#059669] to-[#047857]"},
          ].map(card=>(
            <div key={card.n} className="bg-white border border-[#EDEDED] rounded-2xl p-7 md:p-8 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.c} flex items-center justify-center text-white font-black text-[18px]`}>{card.n}</div>
              <h3 className="mt-5 text-[18px] font-black text-[#0A0A0A]">{card.t}</h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-[#4B5563]">{card.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING - ONLY ONE CARD CENTERED $50 */}
      <section id="pricing" className="max-w-[1360px] mx-auto px-4 md:px-6 py-10">
        <div className="text-center">
          <p className="text-[#5E17EB] text-[11px] font-black tracking-[0.16em] uppercase">Pay Once, Use Forever - Same Tool We Use</p>
          <h2 className="mt-2 text-[30px] md:text-[44px] font-black tracking-tight">Get Access To Real Companies - <span className="text-[#5E17EB]">$50 Lifetime</span></h2>
          <p className="mt-2 text-[#6B7280]">Lifetime Tool Access - For Agencies & Marketers Who Need Our Company Access Tool</p>
        </div>
        <div className="mt-8 flex justify-center">
          <div className="bg-white border-2 border-[#5E17EB] rounded-2xl p-7 md:p-8 relative overflow-hidden shadow-[0_8px_30px_rgba(94,23,235,0.15)] max-w-[520px] w-full">
            <div className="absolute top-3 right-3 bg-[#5E17EB] text-white text-[10px] font-black px-2.5 py-1 rounded-full">Most Popular</div>
            <p className="text-[11px] font-black tracking-[0.14em] uppercase text-[#5E17EB]">Lifetime Tool Access - $50</p>
            <p className="text-[12px] font-bold text-[#6B7280] mt-1">For Agencies & Marketers Who Need Our Company Access Tool</p>
            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-[44px] font-black leading-none">$50</p>
              <span className="text-[14px] font-bold text-[#6B7280]">Lifetime</span>
              <span className="text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">Pay once</span>
            </div>
            <p className="text-[13px] text-[#6B7280]">Pay once, use forever - Same tool we use for our company</p>
            <ul className="mt-6 space-y-3">
              {[
                "Lifetime access to platform (pay once)",
                "Get access to real companies (Global USA/UK, not Lagos info@)",
                "Real owner emails (not info@)",
                "Vault save max 12 campaigns (fixed from 400 UUID bug)",
                "Content generation with Groq 120B own model (real, not mocked)",
                "Search any country (USA, UK, Global)",
                "Same tool we use for our own company",
                "Real Companies Database Access"
              ].map(li=>(
                <li key={li} className="flex gap-2.5 text-[13.5px] font-medium"><span className="w-5 h-5 rounded-full bg-[#F0EFFF] border border-[#DDD6FE] flex items-center justify-center text-[#5E17EB] text-[11px] shrink-0">✓</span><span>{li}</span></li>
              ))}
            </ul>
            <button onClick={handleGetAccess} className="mt-7 w-full bg-[#5E17EB] hover:bg-[#4D0FD4] text-white rounded-xl py-3.5 text-[14px] font-black">Get Tool For $50 Lifetime</button>
            <p className="mt-2 text-center text-[11px] text-[#9CA3AF]">Pay once, use forever - No subscription</p>
            <p className="mt-1 text-center text-[11px] font-bold text-[#5E17EB]">Real owner emails - Global search - Not Lagos</p>
          </div>
        </div>
        <p className="mt-4 text-center text-[11px] text-[#9CA3AF]">$50 Lifetime = real companies + verified owner emails + vault 12 + Groq 120B real content. Same tool we use.</p>
      </section>

      {/* TESTIMONIALS / WHAT YOU GET */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-6">
        <div className="bg-white border border-[#EDEDED] rounded-2xl p-6 md:p-8">
          <h3 className="text-[18px] font-black">What you get</h3>
            <div className="mt-4 grid md:grid-cols-4 gap-6 text-[13.5px] leading-[1.6] text-[#4B5563]">
              <div><b className="text-[#0A0A0A]">Real, not mock.</b> Apollo + Hunter + Places. No info@ guess. Every email verified, Global not Lagos only.</div>
              <div><b className="text-[#0A0A0A]">You control outreach.</b> Find companies, save to vault (max 12), generate real Groq 120B content, track replies.</div>
              <div><b className="text-[#0A0A0A]">Same tool we use.</b> People use our tool, we also use same tool for Alpha Agency - real database.</div>
              <div><b className="text-[#0A0A0A]">Pay once.</b> $50 lifetime, no monthly, lifetime access. Vault fixed, Global search.</div>
            </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-6 py-10">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6 items-start">
          <div>
            <h2 className="text-[28px] md:text-[36px] font-black tracking-tight leading-[0.95]">Questions?<br/><span className="text-[#5E17EB]">Clear answers.</span></h2>
            <p className="mt-3 text-[#4B5563] md:text-[15px]"><strong>$50 Lifetime</strong> gives you real companies tool - same tool we use. Global USA/UK, real owner emails not info@, vault 12, Groq 120B real.</p>
            <button onClick={handleGetAccess} className="mt-6 bg-[#5E17EB] hover:bg-[#4D0FD4] text-white rounded-xl px-7 py-3.5 text-[14px] font-black">Get Access - $50 -&gt;</button>
          </div>
          <div className="bg-white border border-[#EDEDED] rounded-2xl overflow-hidden">
            {[
              {q:"What does $50 Lifetime give me?", a:"Lifetime access to real companies tool: search any niche + location (USA/UK/Global), get verified owner emails (Apollo, not info@), product, save to vault max 12. Groq 120B own model for real content (not mocked). Pay once, use forever. Same tool we use for our company."},
              {q:"How do you find companies?", a:"Apollo mixed_people + Hunter domain-search (Global: USA/UK/Global, not Lagos only), plus Tavily/Serply/Overpass fallback, cached 24h. All real, no mock lists. You can also CSV import. Real owner emails."},
              {q:"Do you use same tool for your company?", a:"Yes - People use our tool to get access to companies, we also use same tool to get companies for Alpha Agency. Same platform, same database."},
              {q:"Is it really $50 lifetime?", a:"Yes - $50 one-time, no subscription, no renewal. Pay once, use forever. Vault max 12 campaigns fixed from 400 UUID bug."},
              {q:"What about Global search?", a:"Global means you choose USA, UK, or Global worldwide. Not Lagos hardcoded. Real owner emails, verified via Apollo/Hunter."},
            ].map((f,i)=>(
              <div key={f.q} className="border-b last:border-0 border-[#F3F4F6]">
                <button onClick={()=> setActiveFaq(i)} className="w-full text-left px-6 py-4 flex items-center justify-between gap-4">
                  <span className="text-[14px] font-black text-[#0A0A0A]">{f.q}</span>
                  <span className={`w-7 h-7 rounded-full border flex items-center justify-center text-[14px] font-bold shrink-0 ${activeFaq===i?'bg-[#0A0A0A] text-white border-[#0A0A0A]':'bg-white text-[#0A0A0A] border-[#EDEDED]'}`}>{activeFaq===i?'^':'+'}</span>
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
              <h2 className="text-[32px] md:text-[48px] font-black leading-[0.9] tracking-tight">Get access to<br/>real companies today</h2>
              <p className="mt-4 text-white/70 md:text-[16px] leading-[1.6]">Pay <strong>$50 Lifetime</strong> once, search any niche globally (USA/UK/Global), get verified owner emails. Same tool we use.</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button onClick={handleGetAccess} className="bg-white text-[#0A0A0A] rounded-2xl px-8 py-4 text-[16px] font-black hover:bg-[#F3F4F6]">Get Access For $50 -&gt;</button>
                <button onClick={handleLogin} className="bg-white/10 border border-white/20 text-white rounded-2xl px-8 py-4 text-[15px] font-bold hover:bg-white/20">Log in</button>
              </div>
              <p className="mt-3 text-[11px] text-white/60">Pay once, use forever - No subscription - Real owner emails - Global</p>
            </div>
            <div className="bg-white text-[#0A0A0A] rounded-2xl p-6">
              <div className="text-[11px] font-black tracking-wide text-[#5E17EB]">YOU GET TODAY</div>
              <ul className="mt-3 space-y-2.5 text-[13.5px] font-semibold">
                {["Search any niche + location (USA/UK/Global)","Verified owner + email + product","Vault max 12 (fixed)","Groq 120B real content (not mocked)"].map(li=>(
                  <li key={li} className="flex gap-2"><span className="text-emerald-500">✓</span>{li}</li>
                ))}
              </ul>
              <div className="mt-4 bg-[#FFFCF8] border rounded-xl p-3 flex items-center justify-between">
                <span className="text-[12px] font-bold">Lifetime Access</span><div className="text-right"><span className="text-[18px] font-black">$50</span> <span className="text-[12px] text-[#6B7280]">pay once</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center border-t border-[#EDEDED] mt-2">
        <div className="max-w-[1360px] mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[12.5px] text-[#6B7280]">
            <span>© 2024 ALPHATEKX - Alpha Agency OS - $50 Lifetime Real Companies Access</span>
            <span className="flex gap-4"><a href="mailto:alphatekxcompany@gmail.com" className="hover:text-[#0A0A0A] font-bold">Contact</a> <span>-</span> <span className="text-[#5E17EB] font-black">Real data - No mock - Global not Lagos</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
};
