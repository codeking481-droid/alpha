import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { API_URL } from '../lib/api.js';

export const AccessCode = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const upper = code.trim().toUpperCase();
    if (!upper) { setMessage('❌ Enter a code'); setLoading(false); return; }

    let token = localStorage.getItem('alpha.token') || '';
    try {
      if (import.meta.env.VITE_SUPABASE_URL) {
        const session = await supabase.auth.getSession();
        token = session.data.session?.access_token || token;
      }
    } catch {}

    if (!token) {
      setMessage('❌ You must log in first. Go to /auth');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ code: upper }),
      });
      const data = await response.json().catch(()=>({}));
      if (response.ok && (data.success || data.ok)) {
        localStorage.setItem('alpha.access_granted', '1');
        localStorage.setItem('alpha.access_code', upper);
        setMessage(`✅ Access granted with ${upper} — opening Command Hub…`);
        setTimeout(() => navigate('/dashboard'), 900);
      } else {
        setMessage('❌ ' + (data.error || 'Invalid or already used code'));
      }
    } catch (error) {
      setMessage('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0215] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/auth" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs tracking-widest uppercase font-bold">← Back to auth</Link>
        </div>
        <div className="mature-card rounded-[20px] p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto text-xl">🔑</div>
          <h1 className="text-xl font-black tracking-tight text-white mt-4">Enter access token</h1>
          <p className="text-white/60 text-xs mt-2 leading-5">
            Put access token for this site <span className="text-white font-bold">or</span> purchase one.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Link to="/checkout?price=50" className="px-4 py-2 rounded-full bg-white text-[#0B0215] font-black text-xs tracking-widest uppercase hover:bg-white/90">$50 access</Link>
            <Link to="/checkout?price=99" className="px-4 py-2 rounded-full bg-[#FFD700] text-[#0B0215] font-black text-xs tracking-widest uppercase hover:bg-[#ffdf33]">$99 premium</Link>
          </div>
          <p className="text-white/25 text-[11px] mt-2">Tokens are single-use • Admin generates for team at /admin</p>

          <form onSubmit={handleSubmit} className="mt-6">
            <input
              type="text"
              placeholder="A1B2C3"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full p-3 bg-[#0B0215] text-white rounded-xl border border-white/10 focus:border-white/20 focus:outline-none text-center text-xl tracking-[0.3em] font-black uppercase placeholder:tracking-normal placeholder:text-sm"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-[#0B0215] py-3 rounded-full font-black text-xs tracking-widest uppercase mt-4 hover:bg-white/90 disabled:opacity-50"
            >
              {loading ? 'Verifying…' : 'Unlock dashboard →'}
            </button>
          </form>

          {message && <p className="mt-4 text-xs leading-5 whitespace-pre-wrap break-words text-white/70">{message}</p>}

          <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/5 text-left">
            <div className="eyebrow text-white/30">How it works</div>
            <ol className="text-xs text-white/40 mt-2 space-y-1 list-decimal list-inside">
              <li>Landing → <span className="text-white/60">Sign up</span> (Google) → /auth</li>
              <li>After signup you see this box — enter token or purchase</li>
              <li>Tokens are single-use and expire in 30 days • Admin manages codes at <Link to="/admin" className="text-[#FFD700] underline">/admin</Link></li>
            </ol>
          </div>

          <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-white/25">
            <Link to="/checkout?price=50" className="hover:text-white underline">Buy $50</Link>
            <span>•</span>
            <Link to="/checkout?price=99" className="hover:text-white underline">Buy $99 premium</Link>
            <span>•</span>
            <a href="mailto:hello@alphatekx.name.ng" className="hover:text-white underline">Contact admin</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessCode;
