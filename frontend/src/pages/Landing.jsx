import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export const Landing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // PWA install prompt logic
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

  // Supabase session check - redirect if already logged in
  useEffect(() => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.warn("Supabase env missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local");
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/access");
      }
    });
  }, [navigate]);

  const handleGoogleSignup = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/access",
      },
    });
    if (error) {
      console.error(error);
      alert("Signup failed: " + error.message);
      setLoading(false);
    }
  };

  const handleDownloadApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    } else {
      alert(
        "To install: \n\nOn iPhone: Tap Share button → Add to Home Screen\nOn Android: Tap menu (⋮) → Install app\nOn Desktop: Look for install icon in address bar"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFCF8] font-['Inter',sans-serif] antialiased">
      {/* NAVBAR WRAPPER */}
      <div className="w-full px-4 pt-4">
        <nav className="max-w-[1120px] mx-auto bg-white border border-[#EDEDED] rounded-xl px-5 py-3.5 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#5E17EB] rounded-[10px] flex items-center justify-center shrink-0">
              <span className="text-white text-[26px] font-medium leading-none -mt-[2px]">α</span>
            </div>
            <span className="text-[30px] font-bold tracking-tight text-[#0A0A0A] leading-none">Alpha</span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-7">
            <a href="#" className="text-[14px] font-medium text-[#0A0A0A] hover:opacity-70 transition-opacity">Product</a>
            <a href="#" className="text-[14px] font-medium text-[#0A0A0A] hover:opacity-70 transition-opacity">How it works</a>
            <a href="#" className="text-[14px] font-medium text-[#0A0A0A] hover:opacity-70 transition-opacity">Pricing</a>
            <a href="#" className="text-[14px] font-medium text-[#0A0A0A] hover:opacity-70 transition-opacity">Platforms</a>
            <button className="ml-2 bg-white border border-[#0A0A0A]/15 rounded-lg px-4 py-[6px] text-[14px] font-medium text-[#0A0A0A] hover:bg-[#FAFAFA] transition-colors">
              Log in
            </button>
          </div>

          {/* Mobile Log in */}
          <button className="md:hidden bg-white border border-[#0A0A0A]/15 rounded-lg px-4 py-[6px] text-[14px] font-medium text-[#0A0A0A]">Log in</button>
        </nav>
      </div>

      {/* HERO */}
      <section className="max-w-[1120px] mx-auto px-4 text-center pt-10 md:pt-14 pb-6">
        <h1 className="text-[32px] md:text-[52px] font-bold tracking-[-0.03em] leading-[1.05] text-[#0A0A0A]">
          The Invisible OS for Modern Agencies
        </h1>
        <p className="mt-3 text-[16px] md:text-[18px] leading-[1.5] text-[#0A0A0A]/80 font-normal max-w-[780px] mx-auto">
          We find companies. We send outreach. We run your entire advertisement campaign
        </p>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Sign up with Google */}
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full sm:w-auto bg-[#0A0A0A] hover:bg-black text-white rounded-[10px] px-6 py-[13px] text-[15px] font-medium flex items-center justify-center gap-2.5 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {/* Google G - multicolor */}
            <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </span>
            {loading ? "Signing up..." : <>Sign up with Google <span className="text-white/90">→</span></>}
          </button>

          {/* Download App */}
          <button
            onClick={handleDownloadApp}
            className="w-full sm:w-auto bg-white hover:bg-[#FFFCF8] text-[#0A0A0A] border border-[#5E17EB] rounded-[10px] px-8 py-[13px] text-[15px] font-semibold transition-colors"
          >
            {isInstallable ? "Install App" : "Download App"}
          </button>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-[1120px] mx-auto px-4 pt-8 pb-6">
        <div className="text-center">
          <p className="text-[#5E17EB] text-[13px] font-semibold tracking-[0.14em] uppercase">HOW IT WORKS</p>
          <h2 className="mt-1.5 text-[22px] md:text-[22px] font-bold tracking-tight text-[#0A0A0A]">Three steps to automate your marketing</h2>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="bg-white border border-[#EDEDED] rounded-xl px-6 py-7 text-center">
            <div className="w-11 h-11 bg-[#5E17EB] rounded-full flex items-center justify-center mx-auto">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M15.5 15.5L20 20" />
                <path d="M8.5 11a2.5 2.5 0 0 1 5 0" opacity="0.9" />
              </svg>
            </div>
            <h3 className="mt-3 text-[18px] font-bold text-[#0A0A0A]">1. Discover</h3>
            <p className="mt-1.5 text-[13.5px] leading-[1.5] text-[#0A0A0A]/80">We identify high-fit companies using intent signals and public data points</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-[#EDEDED] rounded-xl px-6 py-7 text-center">
            <div className="w-11 h-11 bg-[#5E17EB] rounded-full flex items-center justify-center mx-auto">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </div>
            <h3 className="mt-3 text-[18px] font-bold text-[#0A0A0A]">2. Outreach</h3>
            <p className="mt-1.5 text-[13.5px] leading-[1.5] text-[#0A0A0A]/80">Automated personalized outreach sent via LinkedIn, WhatsApp, and Telegram</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-[#EDEDED] rounded-xl px-6 py-7 text-center">
            <div className="w-11 h-11 bg-[#5E17EB] rounded-full flex items-center justify-center mx-auto">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7">
                <path d="M9 11L12 2L13 9L21 10L12 13L9 21L9 11Z" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="2.5" fill="white" stroke="none" />
                <path d="M7 17L5.5 19.5M17 7L19 5" strokeLinecap="round" opacity="0.9" />
              </svg>
            </div>
            <h3 className="mt-3 text-[18px] font-bold text-[#0A0A0A]">3. Launch & Optimize</h3>
            <p className="mt-1.5 text-[13.5px] leading-[1.5] text-[#0A0A0A]/80">We run your ad campaigns, monitor performance, and optimize daily</p>
          </div>
        </div>
      </section>

      {/* BOTTOM 2 COLS */}
      <section className="max-w-[1120px] mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.75fr_0.95fr] gap-5 items-start">
          {/* Left - 10 Posts System */}
          <div className="bg-white border border-[#EDEDED] rounded-xl p-4 md:p-5">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-[20px] font-bold text-[#0A0A0A] tracking-tight">10 Posts System</h3>
              <span className="bg-[#5E17EB] text-white rounded-full px-3 py-[3px] text-[12px] font-semibold leading-none">Active</span>
            </div>

            {/* Table wrapper */}
            <div className="border border-[#EDEDED] rounded-xl overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[1.2fr_0.7fr_1.6fr_0.85fr] gap-2 px-3 py-3 bg-[#FFFCF8] border-b border-[#EDEDED] text-[13px] font-semibold text-[#0A0A0A]">
                <span>Platform</span>
                <span>Post Count</span>
                <span>Format</span>
                <span className="text-right pr-1">Status</span>
              </div>

              {/* Row LinkedIn */}
              <div className="grid grid-cols-[1.2fr_0.7fr_1.6fr_0.85fr] gap-2 items-center px-3 py-3 border-b border-[#EDEDED] text-[13px]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-[#0A66C2] rounded-md flex items-center justify-center shrink-0">
                    <span className="text-white text-[13px] font-bold leading-none tracking-tighter">in</span>
                  </div>
                  <span className="font-semibold text-[#0A0A0A]">LinkedIn</span>
                </div>
                <span className="text-[#0A0A0A]/80">4 posts</span>
                <span className="text-[#0A0A0A]/80 leading-tight">Thought leadership + Case study</span>
                <div className="flex justify-end">
                  <span className="bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] rounded-md px-2.5 py-1 text-[12px] font-medium leading-none">Scheduled</span>
                </div>
              </div>

              {/* Row WhatsApp */}
              <div className="grid grid-cols-[1.2fr_0.7fr_1.6fr_0.85fr] gap-2 items-center px-3 py-3 border-b border-[#EDEDED] text-[13px]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-[#25D366] rounded-md flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2C6.55 2 2.07 6.47 2.07 11.95c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.82 9.82 0 0 0 4.78 1.22h.01c5.48 0 9.95-4.47 9.95-9.95 0-2.66-1.03-5.15-2.94-7.04zm-7.02 14.5h-.01a8.13 8.13 0 0 1-4.14-1.13l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.42 5.82c0 4.54-3.7 8.24-8.25 8.24zm6.88-11.33a6.56 6.56 0 0 0-4.67-1.93c-3.63 0-6.59 2.95-6.59 6.58 0 1.15.3 2.28.87 3.27l.12.2-.7 2.57 2.64-.69.2.12a6.56 6.56 0 0 0 3.46.97c3.63 0 6.59-2.95 6.59-6.58 0-1.76-.69-3.42-1.92-4.51z" />
                      <path d="M14.67 13.27c-.2-.1-1.18-.58-1.36-.65-.18-.07-.31-.1-.44.1-.13.2-.5.65-.62.78-.11.13-.22.15-.42.05-.2-.1-.84-.31-1.6-.99-.59-.52-.99-1.17-1.11-1.37-.11-.2-.01-.31.09-.41.09-.09.2-.22.3-.33.1-.11.13-.2.2-.33.07-.13.03-.24-.02-.34-.05-.1-.44-1.06-.6-1.45-.16-.38-.32-.33-.44-.33h-.38c-.13 0-.34.05-.52.24-.18.2-.68.66-.68 1.62s.7 1.88.79 2.01c.1.13 1.37 2.09 3.32 2.93.46.2.82.32 1.1.41.46.15.88.13 1.21.08.37-.06 1.18-.48 1.35-.95.17-.47.17-.87.12-.95-.05-.08-.18-.13-.38-.23z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-[#0A0A0A]">WhatsApp</span>
                </div>
                <span className="text-[#0A0A0A]/80">3 posts</span>
                <span className="text-[#0A0A0A]/80 leading-tight">Direct message + Offer</span>
                <div className="flex justify-end">
                  <span className="bg-[#5E17EB] text-white rounded-md px-2.5 py-1 text-[12px] font-medium leading-none">In progress</span>
                </div>
              </div>

              {/* Row Telegram */}
              <div className="grid grid-cols-[1.2fr_0.7fr_1.6fr_0.85fr] gap-2 items-center px-3 py-3 text-[13px]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-[#229ED9] rounded-full flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2L11 13" />
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-[#0A0A0A]">Telegram</span>
                </div>
                <span className="text-[#0A0A0A]/80">3 posts</span>
                <span className="text-[#0A0A0A]/80 leading-tight">Community broadcast + Poll</span>
                <div className="flex justify-end">
                  <span className="bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB] rounded-md px-3 py-1 text-[12px] font-medium leading-none">Queued</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Pricing */}
          <div className="bg-white border border-[#EDEDED] rounded-xl p-5">
            <p className="text-[#5E17EB] text-[12px] font-semibold tracking-[0.12em] uppercase">PRICING</p>
            <p className="mt-1 text-[36px] font-bold leading-none tracking-tight text-[#0A0A0A]">$500</p>
            <h3 className="mt-1 text-[18px] font-bold leading-tight text-[#0A0A0A]">One-Week Campaign</h3>

            <ul className="mt-4 space-y-2">
              <li className="flex items-center gap-2.5 text-[13px] text-[#0A0A0A]">
                <span className="w-[18px] h-[18px] rounded-full bg-[#5E17EB] flex items-center justify-center shrink-0">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                10 posts across 3 platforms
              </li>
              <li className="flex items-center gap-2.5 text-[13px] text-[#0A0A0A]">
                <span className="w-[18px] h-[18px] rounded-full bg-[#5E17EB] flex items-center justify-center shrink-0">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Full outreach automation
              </li>
              <li className="flex items-center gap-2.5 text-[13px] text-[#0A0A0A]">
                <span className="w-[18px] h-[18px] rounded-full bg-[#5E17EB] flex items-center justify-center shrink-0">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Daily performance report
              </li>
              <li className="flex items-center gap-2.5 text-[13px] text-[#0A0A0A]">
                <span className="w-[18px] h-[18px] rounded-full bg-[#5E17EB] flex items-center justify-center shrink-0">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Dedicated account manager
              </li>
            </ul>

            <button className="mt-5 w-full bg-[#5E17EB] hover:bg-[#4F0FE0] text-white rounded-lg py-[11px] text-[14px] font-semibold transition-colors">
              Start now — $500
            </button>
            <p className="mt-3 text-center text-[12px] text-[#6B7280]">Cancel anytime. No hidden fees.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-6 text-center">
        <p className="text-[13px] text-[#6B7280] tracking-wide">© 2024 ALPHA AGENCY &nbsp;·&nbsp; Privacy &nbsp;·&nbsp; Terms &nbsp;·&nbsp; Contact</p>
      </footer>
    </div>
  );
};