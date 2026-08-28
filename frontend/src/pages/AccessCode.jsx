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

    // Resolve token: Supabase session or fallback mock token
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
        setMessage('✅ Access granted — opening Command Hub…');
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
          <h1 className="text-xl font-black tracking-tight text-white mt-4">Enter access code</h1>
          <p className="text-white/40 text-xs mt-2 leading-5">
            Codes are single-use. Ask your admin or buy at $50. Expires in 30 days. In dev, any 6+ characters works.
          </p>

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

          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-white/25">
            <span>Need a code?</span>
            <a href="mailto:hello@alphatekx.name.ng" className="text-white/50 hover:text-white underline">Contact admin</a>
            <span>•</span>
            <Link to="/dashboard" className="text-white/50 hover:text-white underline">Try dev (6+ chars)</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessCode;
