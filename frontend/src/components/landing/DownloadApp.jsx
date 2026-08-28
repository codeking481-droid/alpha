import { useState, useEffect } from 'react';

export const DownloadApp = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = () => setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);
    checkStandalone();

    const onBefore = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.__alphaDeferredPrompt = e;
      setIsInstallable(true);
    };
    const onInstalled = () => {
      setIsInstallable(false);
      window.__alphaDeferredPrompt = null;
      setIsStandalone(true);
    };
    window.addEventListener('beforeinstallprompt', onBefore);
    window.addEventListener('appinstalled', onInstalled);

    // Fallback: show button after 800ms even if not installable, with instructions
    const t = setTimeout(()=> {
      if (!isInstallable) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        // Show button anyway for all, with instruction fallback
        setIsInstallable(true);
      }
    }, 900);

    return ()=> {
      window.removeEventListener('beforeinstallprompt', onBefore);
      window.removeEventListener('appinstalled', onInstalled);
      clearTimeout(t);
    };
  }, []);

  const handleInstall = async () => {
    const dp = deferredPrompt || window.__alphaDeferredPrompt;
    if (dp) {
      dp.prompt();
      try {
        const choice = await dp.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstallable(false);
        }
      } catch {}
      setDeferredPrompt(null);
      window.__alphaDeferredPrompt = null;
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        alert('iPhone: Tap Share (square with arrow) → Add to Home Screen → Add');
      } else if (isStandalone) {
        alert('Already installed — open from your home screen.');
      } else {
        alert('To install: Chrome → ⋮ (top right) → Install app / Add to Home Screen. Or use Add to Home Screen from browser menu.');
      }
    }
  };

  if (isStandalone) {
    return (
      <section id="download-app" className="py-8 px-4">
        <div className="max-w-4xl mx-auto mature-card rounded-[20px] p-6 text-center">
          <p className="font-black text-white">✓ Already installed — running as app</p>
          <p className="text-xs text-white/40 mt-1">You can open Alpha from your home screen anytime.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="download-app" className="py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mature-card rounded-[20px] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-xl shrink-0">📱</div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-black tracking-tight text-white">Take Alpha with you</h3>
            <p className="text-sm text-white/50 mt-1">Install as app — standalone, offline-ready, 0.8 MB. No store needed.</p>
            <p className="text-[11px] text-white/25 mt-1">Android • iOS • Desktop • Works offline</p>
          </div>
          <button onClick={handleInstall} className="bg-white text-[#0B0215] px-6 py-3 rounded-full font-black text-xs tracking-widest uppercase hover:bg-white/90 shrink-0">
            📲 Download AlphaTekX App
          </button>
        </div>
        <p className="text-center text-[11px] text-white/20 mt-3">Tap Download — if prompt doesn’t appear, use browser menu → Install / Add to Home Screen</p>
      </div>
    </section>
  );
};

export default DownloadApp;
