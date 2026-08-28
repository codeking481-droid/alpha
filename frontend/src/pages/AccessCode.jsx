import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { API_URL } from '../lib/api.js';

const MASTER_HINT = '126213JESUSISKING';

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

    // Allow anonymous master code — create a token on the fly so platform opens instantly
    const isMaster = upper === '126213JESUSISKING' || upper === '126213JESUS';
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ code: upper }),
      });
      const data = await response.json().catch(()=>({}));
      if (response.ok && (data.success || data.ok)) {
        // Ensure a token exists so ProtectedRoute passes — master code grants instant access
        if (!token) {
          const payload = btoa(JSON.stringify({ sub: 'master-'+Date.now(), email: 'master@alphatekx.local', role: 'admin' }));
          token = `mock-jwt.${payload}.sig`;
          localStorage.setItem('alpha.token', token);
          localStorage.setItem('alpha.user', JSON.stringify({ email: 'master@alphatekx.local', role: 'admin' }));
        }
        localStorage.setItem('alpha.access_granted', '1');
        localStorage.setItem('alpha.access_code', upper);
        localStorage.setItem('alpha.access_at', new Date().toISOString());
        setMessage(`✅ Access granted — opening Alpha Agency…`);
        // Instant navigation, no second step
        setTimeout(() => navigate('/dashboard'), 600);
      } else {
        const err = data.error || 'Invalid or already used code — this code is single-use';
        if (isMaster && err.toLowerCase().includes('already used')) {
          setMessage('⚠️ This master code was already used once (single-use). Contact alphatekxcompany@gmail.com for a new code or use /admin to generate one.');
        } else {
          setMessage('❌ ' + err);
        }
      }
    } catch (error) {
      setMessage('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0215] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs tracking-widest uppercase font-bold">← Back to home</Link>
        </div>
        <div className="mature-card rounded-[24px] p-8 sm:p-9 text-center border border-white/[0.06] shadow-[0_24px_64px_rgba(0,0,0,0.4)]">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto text-xl shadow-gold">🔑</div>
          <h1 className="text-[22px] font-black tracking-tight text-white mt-4">Enter access token</h1>
          <p className="text-white/55 text-[13px] mt-2 leading-5">
            Single-use token. Enter <span className="text-white font-bold">126213JESUSISKING</span> to unlock instantly — no login required. Or purchase below.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Link to="/checkout?price=50" className="px-4 py-2.5 rounded-full bg-white text-[#0B0215] font-black text-xs tracking-widest uppercase hover:bg-white/90">$50 access</Link>
            <Link to="/checkout?price=99" className="px-4 py-2.5 rounded-full bg-[#FFD700] text-[#0B0215] font-black text-xs tracking-widest uppercase hover:bg-[#ffdf33]">$99 premium</Link>
          </div>
          <p className="text-white/25 text-[11px] mt-2 tracking-wide">Master code is single-use • Expires after one unlock • Admin: /admin</p>

          <form onSubmit={handleSubmit} className="mt-6">
            <input
              type="text"
              placeholder={MASTER_HINT}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full p-3.5 bg-[#0B0215] text-white rounded-xl border border-white/10 focus:border-[#E6C87A]/30 focus:outline-none focus:ring-1 focus:ring-[#E6C87A]/20 text-center text-[18px] tracking-[0.22em] font-black uppercase placeholder:tracking-normal placeholder:text-sm placeholder:text-white/25"
              required
              autoComplete="off"
              autoFocus
            />
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-white/25">Try: {MASTER_HINT}</span>
              <button type="button" onClick={()=> setCode(MASTER_HINT)} className="text-[#E6C87A] hover:text-white font-bold tracking-widest uppercase text-[11px]">Fill master →</button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-[#0B0215] py-3.5 rounded-full font-black text-xs tracking-widest uppercase mt-4 hover:bg-white/90 disabled:opacity-50 shadow-gold transition"
            >
              {loading ? 'Verifying…' : 'Unlock platform →'}
            </button>
          </form>

          {message && <p className={`mt-4 text-xs leading-5 whitespace-pre-wrap break-words px-3 py-2 rounded-xl border ${message.startsWith('✅') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : message.startsWith('⚠️') ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>{message}</p>}

          <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/5 text-left">
            <div className="eyebrow text-white/30 text-[11px]">How it works — instant</div>
            <ol className="text-xs text-white/45 mt-2 space-y-1.5 list-decimal list-inside leading-5">
              <li>Enter <span className="text-white font-bold">{MASTER_HINT}</span> → platform opens immediately</li>
              <li>Code is <span className="text-amber-300 font-bold">single-use</span> — after one unlock it is invalid</li>
              <li>Need another? Ask admin or generate at <Link to="/admin" className="text-[#E6C87A] underline">/admin</Link></li>
            </ol>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-white/25 flex-wrap">
            <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"/> Encrypted</span>
            <span>•</span>
            <span>Trusted by 215+ community</span>
            <span>•</span>
            <a href="mailto:alphatekxcompany@gmail.com" className="hover:text-white underline">Support</a>
          </div>
        </div>
        <p className="text-center text-[11px] text-white/20 mt-4">By unlocking you agree to Privacy & Terms. No view guarantees — real access to real people.</p>
      </div>
    </div>
  );
};

export default AccessCode;
