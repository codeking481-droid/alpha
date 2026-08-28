import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { API_URL } from '../lib/api.js';

export const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const hasSupabase = !!import.meta.env.VITE_SUPABASE_URL;
    try {
      if (hasSupabase) {
        let result;
        if (isLogin) {
          result = await supabase.auth.signInWithPassword({ email, password });
        } else {
          result = await supabase.auth.signUp({ email, password });
        }
        const { error, data } = result;
        if (error) {
          setMessage('❌ ' + error.message);
        } else if (data.user && !isLogin) {
          setMessage('✅ Check your email for confirmation! Now log in.');
        } else if (data.session?.access_token) {
          localStorage.setItem('alpha.token', data.session.access_token);
          // Everyone (including admin) goes to access-code first time — seed is 126213JESUS
          const isAdmin = String(email).toLowerCase() === 'alphatekxcompany@gmail.com';
          if (isAdmin && localStorage.getItem('alpha.access_granted') === '1') {
            setMessage('✅ Admin — welcome back to dashboard...');
            setTimeout(() => navigate('/dashboard'), 800);
          } else {
            setMessage(isAdmin ? '✅ Admin — enter code 126213JESUS (one-time)…' : '✅ Welcome — enter your access code...');
            setTimeout(() => navigate('/access-code'), 800);
          }
        } else if (data.user && isLogin) {
          navigate('/access-code');
        }
      } else {
        // Fallback to backend mock login (works without Supabase)
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json().catch(()=>({}));
        if (!res.ok) throw new Error(data.error || 'Login failed');
        if (data.token) localStorage.setItem('alpha.token', data.token);
        if (data.user) localStorage.setItem('alpha.user', JSON.stringify(data.user));
        const isAdminDev = String(email).toLowerCase() === 'alphatekxcompany@gmail.com';
        if (isAdminDev && localStorage.getItem('alpha.access_granted') === '1') {
          setMessage('✅ Admin (dev) — welcome back...');
          setTimeout(() => navigate('/dashboard'), 600);
        } else {
          setMessage(isAdminDev ? '✅ Admin (dev) — enter code 126213JESUS at next step' : '✅ Signed in (dev) — enter your access code');
          setTimeout(() => navigate('/access-code'), 600);
        }
      }
    } catch (err) {
      setMessage('❌ ' + (err.message || 'Failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL) {
      setMessage('❌ Google OAuth requires Supabase config');
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/access-code' } });
    if (error) setMessage('❌ ' + error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0215] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs tracking-widest uppercase font-bold">
            ← Back to alphatekx.name.ng
          </Link>
        </div>
        <div className="mature-card rounded-[20px] p-7 sm:p-8">
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-white text-[#0B0215] flex items-center justify-center font-black mx-auto">α</div>
            <h1 className="text-xl font-black tracking-tight text-white mt-3">Access Alpha Agency</h1>
            <p className="text-white/40 text-xs mt-1 tracking-wide">
              {isLogin ? 'Log in to continue — proof waits inside.' : 'Create your account — 2-minute setup.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <input
              type="email"
              placeholder="Work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-[#0B0215] text-white rounded-xl border border-white/10 focus:border-white/20 focus:outline-none placeholder:text-white/30 text-sm"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-[#0B0215] text-white rounded-xl border border-white/10 focus:border-white/20 focus:outline-none placeholder:text-white/30 text-sm"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-[#0B0215] py-3 rounded-full font-black text-xs tracking-widest uppercase hover:bg-white/90 transition disabled:opacity-50"
            >
              {loading ? 'Please wait…' : isLogin ? 'Log In →' : 'Create account →'}
            </button>
          </form>

          <button onClick={handleGoogle} className="w-full mt-3 py-3 rounded-full hairline text-white/70 font-bold text-xs tracking-widest uppercase hover:bg-white/[0.04]">Continue with Google</button>

          {message && <p className="mt-4 text-center text-xs leading-5 whitespace-pre-wrap break-words text-white/70">{message}</p>}

          <p className="mt-6 text-center text-white/30 text-xs">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setIsLogin(!isLogin); setMessage(''); }}
              className="text-white font-bold hover:underline"
            >
              {isLogin ? 'Create one' : 'Log in'}
            </button>
          </p>

          <p className="mt-4 text-center text-[11px] text-white/20">
            By continuing you agree to Privacy & Terms. Access codes are single-use and expire in 30 days.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
