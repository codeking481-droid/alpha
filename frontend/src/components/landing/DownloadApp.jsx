import { useState, useEffect } from 'react';

export const DownloadApp = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    });
    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
    });
    // iOS fallback: if standalone display not available but user on iOS, show button anyway after 1s
    const t = setTimeout(()=> {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (isIOS && !isStandalone) setIsInstallable(true);
    }, 1500);
    return ()=> clearTimeout(t);
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        setDeferredPrompt(null);
        if (choiceResult.outcome === 'accepted') {
          setIsInstallable(false);
        }
      });
    } else {
      alert('To install: On Android tap ⋮ → Install app. On iOS tap Share → Add to Home Screen.');
    }
  };

  if (!isInstallable) return null;

  return (
    <section id="download-app" className="py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mature-card rounded-[20px] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-xl shrink-0">📱</div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-black tracking-tight text-white">Take Alpha with you</h3>
            <p className="text-sm text-white/50 mt-1">Install as app — standalone, offline-ready, 0.8 MB. No store.</p>
          </div>
          <button onClick={handleInstall} className="bg-white text-[#0B0215] px-6 py-3 rounded-full font-black text-xs tracking-widest uppercase hover:bg-white/90 shrink-0">
            📲 Download AlphaTekX App
          </button>
        </div>
        <p className="text-center text-[11px] text-white/20 mt-3">PWA • Works on Android • iOS • Desktop • Offline cache</p>
      </div>
    </section>
  );
};

export default DownloadApp;
