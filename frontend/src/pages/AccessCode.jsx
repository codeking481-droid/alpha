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
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ code: upper })
      });
      const data = await response.json().catch(()=>({}));
      if (response.ok && (data.success || data.ok)) {
        if (!token) {
          const payload = btoa(JSON.stringify({ sub: 'master-'+Date.now(), email: 'master@alphatekx.local', role: 'admin' }));
          token = `mock-jwt.${payload}.sig`;
          localStorage.setItem('alpha.token', token);
          localStorage.setItem('alpha.user', JSON.stringify({ email: 'master@alphatekx.local', role: 'admin' }));
        }
        localStorage.setItem('alpha.access_granted', '1');
        localStorage.setItem('alpha.access_code', upper);
        localStorage.setItem('alpha.access_at', new Date().toISOString());
        setMessage('✅ Access granted! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 800);
      } else {
        const err = data.error || 'Invalid or already used code';
        if (err.toLowerCase().includes('already used')) setMessage('⚠️ This code was already used (single-use). Contact alphatekxcompany@gmail.com or generate a new one.');
        else setMessage('❌ ' + err);
      }
    } catch (error) {
      setMessage('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{background:'#FFFCF8'}}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔑</div>
          <h1 className="text-3xl font-bold" style={{color:'#0A0A0A'}}>Enter Access Token</h1>
          <p className="mt-2" style={{color:'#6B7280'}}>
            Enter your token to access Alpha Agency. <span style={{color:'#0A0A0A', fontWeight:600}}>Secure • Single-use</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="A1B2C3D4"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="input text-center text-2xl tracking-widest py-4"
            style={{borderColor:'#E0E0E0'}}
            required
            autoComplete="off"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-lg justify-center"
            style={{background:'#0A0A0A'}}
          >
            {loading ? 'Verifying...' : '🔓 Unlock Platform'}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm" style={{color: message.startsWith('✅') ? '#0A7A00' : '#C00000'}}>{message}</p>}

        <div className="text-center mt-8">
          <p className="text-sm" style={{color:'#6B7280'}}>
            Don't have a token?{' '}
            <Link to="/checkout?price=50" className="font-medium hover:underline" style={{color:'#0A0A0A'}}>
              Purchase one for $50 USD
            </Link>
            {' '}<span style={{color:'#EDEDED'}}>•</span>{' '}
            <Link to="/checkout?price=99" className="font-medium hover:underline" style={{color:'#0A0A0A'}}>
              $99 Premium
            </Link>
          </p>
          <p className="text-xs mt-2" style={{color:'#6B7280'}}>
            One-time payment. Lifetime access. Paystack USD.
          </p>
          <div className="mt-4 flex gap-2 justify-center">
            <Link to="/checkout?price=50" className="px-4 py-2 rounded-lg text-xs font-semibold" style={{background:'#0A0A0A', color:'#FFFCF8', borderRadius:'8px'}}>Buy $50 →</Link>
            <Link to="/checkout?price=99" className="px-4 py-2 rounded-lg text-xs font-semibold" style={{background:'#FFFFFF', color:'#0A0A0A', border:'1px solid #EDEDED', borderRadius:'8px'}}>Buy $99 →</Link>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{color:'#AAAAAA'}}>
          Single-use tokens • 30-day expiry • No view guarantees — real access to real people.
        </p>
      </div>
    </div>
  );
};

export default AccessCode;
