import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../lib/api.js';

export const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const priceParam = searchParams.get('price');
  const refParam = searchParams.get('reference') || searchParams.get('trxref');
  const initialPrice = priceParam === '99' ? 99 : 50;
  const initialEmail = searchParams.get('email') || localStorage.getItem('alpha.pending_email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [price, setPrice] = useState(initialPrice);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState('');
  const [code, setCode] = useState('');
  const [isMock, setIsMock] = useState(false);

  useEffect(()=>{ setPrice(initialPrice); }, [initialPrice]);

  // Auto-verify when Paystack redirects back with ?reference=
  useEffect(()=>{
    if (refParam) {
      const verifyEmail = searchParams.get('email') || email || initialEmail || localStorage.getItem('alpha.pending_email') || '';
      if (!verifyEmail) {
        setMessage('Payment reference found — enter the email you used to verify.');
        return;
      }
      (async()=>{
        setVerifying(true);
        setMessage('Verifying Paystack payment…');
        try {
          // Try GET first (works even if CORS preflight fails), fallback to POST
          let vRes = await fetch(`${API_URL}/api/payment/verify?reference=${encodeURIComponent(refParam)}&email=${encodeURIComponent(verifyEmail)}`);
          let vData = await vRes.json().catch(()=>({}));
          if (!vRes.ok) {
            vRes = await fetch(`${API_URL}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reference: refParam, email: verifyEmail }),
            });
            vData = await vRes.json().catch(()=>({}));
          }
          if (!vRes.ok) throw new Error(vData.error || 'Verification failed');
          const c = vData.code || vData.row?.code || '';
          setCode(c);
          setIsMock(!!vData.mock);
          if (c) localStorage.setItem('alpha.pending_code', c);
          setMessage(`✅ Payment verified — ${verifyEmail} — code: ${c || '(issued)'} ${vData.mock ? '(test mode — no Paystack key)' : ''} — keep it safe, single-use.`);
        } catch (e) {
          setMessage('❌ ' + e.message + ' — If you paid, contact alphatekxcompany@gmail.com with reference ' + refParam);
        } finally { setVerifying(false); }
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refParam]);

  const handlePayment = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+\.[^\s@]*$/.test(email)) {
      setMessage('❌ Enter a valid email');
      return;
    }
    localStorage.setItem('alpha.pending_email', email.trim());
    setLoading(true);
    setMessage('');
    try {
      const amount = price === 99 ? 9900 : 5000;
      const callbackUrl = `${window.location.origin}/checkout`;
      const res = await fetch(`${API_URL}/api/payment/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), amount, price, callback_url: callbackUrl }),
      });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data.error || 'Initialization failed');
      if (data.checkoutUrl) {
        if (data.mock) {
          setIsMock(true);
          setMessage('⚠️ Paystack not configured — using test checkout (no card needed). Redirecting…');
        } else {
          setMessage('Redirecting to Paystack — complete payment, then you’ll return here with your code.');
        }
        setTimeout(()=> { window.location.href = data.checkoutUrl; }, 700);
      } else {
        setMessage('❌ ' + (data.error || 'No checkout URL'));
      }
    } catch (e) {
      const isKeyMissing = /PAYSTACK_SECRET_KEY/.test(e.message);
      setMessage('❌ ' + e.message + (isKeyMissing ? ' — Admin: set PAYSTACK_SECRET_KEY via npx wrangler secret put PAYSTACK_SECRET_KEY  (or add to backend/.dev.vars: PAYSTACK_SECRET_KEY=sk_test_...) and redeploy. For testing, initialization still works in mock mode — reload and try again.' : ''));
    } finally {
      setLoading(false);
    }
  };

  // Manual verify helper — if user has reference but auto-verify missed email
  const handleManualVerify = async () => {
    if (!refParam) return;
    const verifyEmail = email || initialEmail || localStorage.getItem('alpha.pending_email') || '';
    if (!verifyEmail) { setMessage('❌ Enter email to verify'); return; }
    setVerifying(true);
    setMessage('Verifying…');
    try {
      const vRes = await fetch(`${API_URL}/api/payment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: refParam, email: verifyEmail }),
      });
      const vData = await vRes.json().catch(()=>({}));
      if (!vRes.ok) throw new Error(vData.error || 'Verification failed');
      setCode(vData.code || vData.row?.code || '');
      setIsMock(!!vData.mock);
      setMessage(`✅ Verified — code: ${vData.code || ''}`);
    } catch (e) { setMessage('❌ ' + e.message); } finally { setVerifying(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0215] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/access-code" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs tracking-widest uppercase font-bold">← Back to token</Link>
        </div>
        <div className="mature-card rounded-[20px] p-7 sm:p-8 text-center border border-white/[0.06]">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto text-xl">💳</div>
          <h1 className="text-xl font-black tracking-tight text-white mt-4">Purchase access token</h1>
          <p className="text-white/40 text-xs mt-2 leading-5">Real Paystack payment in USD — token issued only after verified success. Single-use, 30-day expiry. {isMock && <span className="text-amber-400 font-bold">(Test mode)</span>}</p>

          {refParam && (
            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 text-left">
              <div>Reference detected: <span className="font-mono font-bold break-all">{refParam}</span></div>
              {!code && <button onClick={handleManualVerify} disabled={verifying} className="mt-2 px-3 py-1.5 rounded-full bg-white text-[#0B0215] font-bold text-xs disabled:opacity-50">{verifying ? 'Verifying…' : 'Verify now →'}</button>}
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={()=> setPrice(50)} className={`p-3 rounded-xl border text-center ${price===50?'bg-white text-[#0B0215] border-white':'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}>
              <div className="font-black text-sm">$50 <span className="font-normal text-[11px] opacity-60">USD</span></div>
              <div className="text-[11px]">Standard • $50 USD</div>
            </button>
            <button onClick={()=> setPrice(99)} className={`p-3 rounded-xl border text-center ${price===99?'bg-[#FFD700] text-[#0B0215] border-[#FFD700]':'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}>
              <div className="font-black text-sm">$99 <span className="font-normal text-[11px] opacity-60">USD</span></div>
              <div className="text-[11px]">Premium • $99 USD</div>
            </button>
          </div>

          {!refParam && (
            <div className="mt-6 text-left space-y-3">
              <label className="eyebrow text-white/30">Email for receipt + code</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e)=> setEmail(e.target.value)}
                className="w-full p-3 bg-[#0B0215] text-white rounded-xl border border-white/10 focus:border-white/20 focus:outline-none placeholder:text-white/30 text-sm"
              />
              <button
                onClick={handlePayment}
                disabled={loading || verifying}
                className="w-full bg-white text-[#0B0215] py-3 rounded-full font-black text-xs tracking-widest uppercase hover:bg-white/90 disabled:opacity-50"
              >
                {loading ? 'Redirecting…' : verifying ? 'Verifying…' : `Pay $${price} USD via Paystack →`}
              </button>
              <p className="text-[11px] text-white/20 text-center">You’ll be charged in USD ($50 or $99). Test mode works without key. After success you return here automatically.</p>
            </div>
          )}

          {(message || code) && (
            <div className="mt-4 text-center">
              {message && <p className={`text-xs leading-5 whitespace-pre-wrap break-words px-3 py-2 rounded-xl border ${message.startsWith('✅') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : message.startsWith('⚠️') ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-white/[0.04] border-white/10 text-white/70'}`}>{message}</p>}
              {code && (
                <div className="mt-3 p-4 rounded-xl bg-white text-[#0B0215] text-center">
                  <div className="eyebrow text-[#0B0215]/50">Your {price===99?'Premium':'Standard'} code (${price}) {isMock && <span className="text-amber-600">(test)</span>}</div>
                  <div className="text-2xl font-black tracking-[0.28em] mt-1 break-all">{code}</div>
                  <button onClick={()=> navigator.clipboard.writeText(code)} className="mt-2 text-xs font-bold underline">Copy</button>
                  <div className="mt-3">
                    <button onClick={()=> navigate('/access-code')} className="w-full bg-[#0B0215] text-white py-2.5 rounded-full font-black text-xs tracking-widest uppercase">Enter token →</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-white/25 flex-wrap">
            <span>Secure by Paystack</span>
            <span>•</span>
            <span>Token only after success</span>
            <span>•</span>
            <span className="text-emerald-400/70">Test mode ready</span>
          </div>
          <p className="text-[10px] text-white/20 mt-2 leading-4">Missing key? Add <span className="font-mono text-white/40">PAYSTACK_SECRET_KEY=sk_test_...</span> to backend/.dev.vars and run <span className="font-mono text-white/40">npm run dev</span>. Then set prod secret: <span className="font-mono text-white/40">npx wrangler secret put PAYSTACK_SECRET_KEY</span></p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
