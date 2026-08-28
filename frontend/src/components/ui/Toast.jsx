import { useEffect } from 'react';

export const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    error: 'border-red-500/30 bg-red-500/10 text-red-300',
    info: 'border-white/10 bg-white/[0.04] text-white/80'
  };

  return (
    <div className={`fixed bottom-6 right-6 left-6 sm:left-auto p-4 rounded-2xl border ${colors[type] || colors.info} backdrop-blur-xl z-[100] max-w-sm sm:max-w-[360px] shadow-2xl flex items-start gap-3`}>
      <span className="text-sm leading-5 flex-1">{message}</span>
      <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white shrink-0">✕</button>
    </div>
  );
};

export default Toast;
