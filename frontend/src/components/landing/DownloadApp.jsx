import { useState, useEffect } from 'react';

export const DownloadApp = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    const onBefore = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.__alphaDeferredPrompt = e;
      setIsInstallable(true);
    };
    const onInstalled = () => {
      setIsInstallable(false);
      window.__alphaDeferredPrompt = null;
    };
    window.addEventListener('beforeinstallprompt', onBefore);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBefore);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('✅ App installed');
        }
        setDeferredPrompt(null);
        window.__alphaDeferredPrompt = null;
      });
    } else if (isIOS) {
      alert('To install Alpha Agency on your iPhone: Tap the share button (⬆️) and select "Add to Home Screen".');
    } else {
      alert('Your browser does not support app installation. Try using Chrome or Edge.');
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="glass p-8 border border-gold/20">
          <div className="text-5xl mb-4">📱</div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Take Alpha with you
          </h2>
          <p className="text-gray-400 text-lg mb-6">
            Fix sites. Restore hope. Anywhere.
          </p>
          <button
            onClick={handleInstall}
            className="btn-primary text-xl px-10 py-4"
          >
            📲 Download AlphaTekX App
          </button>
          <p className="text-gray-500 text-sm mt-4">
            Works on Android · iOS · Web · No account needed to try.
          </p>
          {isIOS && !isInstallable && (
            <p className="text-gray-500 text-xs mt-2">
              💡 Tap the share button (⬆️) and select "Add to Home Screen".
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default DownloadApp;
