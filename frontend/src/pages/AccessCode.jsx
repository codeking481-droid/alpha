import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { API_URL } from '../lib/api.js';

export const AccessCode = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // ensure instant signup token exists — no extra signup page
  useEffect(()=>{
    let t = localStorage.getItem('alpha.token');
    if (!t) {
      const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());
      const payload = (()=>{ try { return btoa(JSON.stringify({ sub:id, email:`user-${id.slice(0,8)}@alpha.local`, role:'member', iat:Date.now()})) } catch { return 'eyJzdWIiOiJpbnN0YW50In0' } })();
      t = `instant-jwt.${payload}.sig`;
      localStorage.setItem('alpha.token', t);
      localStorage.setItem('alpha.user', JSON.stringify({ email:`user-${id.slice(0,8)}@alpha.local`, role:'member', instant:true }));
      localStorage.setItem('alpha.signup_at', new Date().toISOString());
    }
    if (localStorage.getItem('alpha.access_granted') === '1') {
      navigate('/dashboard', { replace:true });
    }
  }, [navigate]);

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
      // Master is reusable — even if backend says already used, grant for owner
      const isMaster = ['126213JESUSISKING','126213JESUS'].includes(upper);
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
        setMessage('✅ Access granted! Opening your OS…');
        try { window.dispatchEvent(new Event('storage')); } catch {}
        setTimeout(() => navigate('/dashboard'), 400);
      } else {
        const err = data.error || 'Invalid or already used code';
        if (isMaster && err.toLowerCase().includes('already used')) {
          // Fallback for old deployed worker before master-reuse patch — still grant
          localStorage.setItem('alpha.access_granted', '1');
          localStorage.setItem('alpha.access_code', upper);
          localStorage.setItem('alpha.access_at', new Date().toISOString());
          if (!token) {
            const payload = btoa(JSON.stringify({ sub: 'master-'+Date.now(), email: 'master@alphatekx.local', role: 'admin' }));
            token = `mock-jwt.${payload}.sig`;
            localStorage.setItem('alpha.token', token);
          }
          try { window.dispatchEvent(new Event('storage')); } catch {}
          setMessage('✅ Access granted! (master reusable) Opening…');
          setTimeout(() => navigate('/dashboard'), 400);
        } else if (err.toLowerCase().includes('already used')) setMessage('⚠️ This code was already used (single-use). Contact alphatekxcompany@gmail.com or buy a new one below.');
        else setMessage('❌ ' + err);
      }
    } catch (error) {
      const isMaster = ['126213JESUSISKING','126213JESUS'].includes(upper);
      if (isMaster) {
        // Offline fallback — grant master locally if API unreachable
        localStorage.setItem('alpha.access_granted', '1');
        localStorage.setItem('alpha.access_code', upper);
        localStorage.setItem('alpha.access_at', new Date().toISOString());
        if (!token) {
          const payload = btoa(JSON.stringify({ sub: 'master-'+Date.now(), email: 'master@alphatekx.local', role: 'admin' }));
          token = `mock-jwt.${payload}.sig`;
          localStorage.setItem('alpha.token', token);
        }
        try { window.dispatchEvent(new Event('storage')); } catch {}
        setMessage('✅ Access granted! (offline master) Opening…');
        setTimeout(() => navigate('/dashboard'), 400);
      } else {
        setMessage('❌ ' + error.message + ' — check API_URL: ' + API_URL);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12" style={{background:'#FFFCF8'}}>
      <div className="max-w-[520px] w-full">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-[#0A0A0A] text-2xl" style={{background:'#5E17EB'}}>🔑</div>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full" style={{background:'#F5F3FF', border:'1px solid #EDE9FF'}}>
            <span style={{width:'6px', height:'6px', borderRadius:'999px', background:'#5E17EB', display:'inline-block'}} />
            <span style={{color:'#5E17EB', fontSize:'11px', fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase'}}>Instant signup complete • Token required</span>
          </div>
          <h1 className="mt-4" style={{color:'#0A0A0A', fontSize:'36px', fontWeight:800, letterSpacing:'-0.03em', lineHeight:'1.05'}}>Enter Access Token</h1>
          <p className="mt-3 mx-auto" style={{color:'#6B7280', fontSize:'15px', lineHeight:'1.6', maxWidth:'420px'}}>
            You’re in — <span style={{color:'#0A0A0A', fontWeight:600}}>instant signup done</span>. Now enter the token to unlock everything. <span style={{color:'#0A0A0A', fontWeight:600}}>Only I issue tokens.</span> Need one? Buy below.
          </p>
        </div>

        <div className="card" style={{background:'#FFFFFF', border:'1px solid #EDEDED', borderRadius:'16px', padding:'24px'}}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label style={{color:'#0A0A0A', fontSize:'11px', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase'}}>Access token • single-use • 30 days</label>
            <input
              type="text"
              placeholder="A1B2C3D4"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="input text-center tracking-widest"
              style={{borderColor:'#E0E0E0', fontSize:'20px', letterSpacing:'0.18em', padding:'16px', background:'#FFFFFF'}}
              required
              autoComplete="off"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center"
              style={{background:'#5E17EB', color:'#FFFFFF', height:'52px', borderRadius:'10px', fontWeight:800, fontSize:'15px', border:'none', cursor:'pointer', opacity: loading ? 0.7 : 1}}
            >
              {loading ? 'Verifying…' : '🔓 Unlock Platform'}
            </button>
          </form>

          {message && <p className="mt-4 text-center text-sm" style={{color: message.startsWith('✅') ? '#0A7A00' : message.startsWith('⚠️') ? '#92400E' : '#C00000', background: message.startsWith('✅') ? '#F0FDF4' : message.startsWith('⚠️') ? '#FFFBEB' : '#FEF2F2', border:'1px solid #EDEDED', borderRadius:'10px', padding:'10px 12px'}}>{message}</p>}
        </div>

        <div className="mt-6 card" style={{background:'#FFFFFF', border:'1px solid #EDEDED', borderRadius:'16px', padding:'20px'}}>
          <div style={{color:'#0A0A0A', fontSize:'12px', fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase'}}>Don’t have a token? Buy your plan — instant issue</div>
          <p className="mt-1" style={{color:'#6B7280', fontSize:'13px'}}>Paystack USD • Token issued instantly after verified success. One-time. Lifetime.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link to="/checkout?price=50" className="text-center inline-flex flex-col items-center justify-center" style={{background:'#0A0A0A', color:'#FFFFFF', borderRadius:'10px', padding:'14px 8px', textDecoration:'none'}}>
              <span style={{fontWeight:800, fontSize:'16px'}}>$50 USD</span><span style={{fontSize:'11px', opacity:0.7}}>Access token</span><span style={{fontSize:'11px', marginTop:'4px', background:'#5E17EB', color:'#FFFFFF', borderRadius:'999px', padding:'2px 8px', fontWeight:700}}>Buy →</span>
            </Link>
            <Link to="/checkout?price=99" className="text-center inline-flex flex-col items-center justify-center" style={{background:'#5E17EB', color:'#FFFFFF', borderRadius:'10px', padding:'14px 8px', textDecoration:'none'}}>
              <span style={{fontWeight:800, fontSize:'16px'}}>$99 USD</span><span style={{fontSize:'11px', opacity:0.9}}>Premium token</span><span style={{fontSize:'11px', marginTop:'4px', background:'#FFFFFF', color:'#5E17EB', borderRadius:'999px', padding:'2px 8px', fontWeight:800}}>Most chosen →</span>
            </Link>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2" style={{color:'#9CA3AF', fontSize:'11px'}}>
            <Link to="/pricing" style={{color:'#5E17EB', fontWeight:700, textDecoration:'none'}}>See all plans →</Link>
            <span>•</span>
            <span>Single-use • 30-day expiry</span>
          </div>
        </div>

        <p className="text-center mt-4" style={{color:'#9CA3AF', fontSize:'11px'}}>
          Secure • Single-use tokens • No view guarantees — real access to real people. Contact <a href="mailto:alphatekxcompany@gmail.com" style={{color:'#5E17EB', fontWeight:600}}>alphatekxcompany@gmail.com</a>
        </p>
      </div>
    </div>
  );
};

export default AccessCode;
