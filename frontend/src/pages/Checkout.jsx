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
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{background:'#FFFCF8'}}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/access" className="inline-flex items-center gap-2 text-xs tracking-widest uppercase font-bold" style={{color:'#6B7280'}}>← Back to token</Link>
        </div>
        <div className="card rounded-[16px] p-7 sm:p-8 text-center" style={{background:'#FFFFFF', border:'1px solid #EDEDED'}}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-xl" style={{background:'#F5F3FF', border:'1px solid #EDE9FF'}}>💳</div>
          <h1 className="text-xl font-bold tracking-tight mt-4" style={{color:'#0A0A0A'}}>Purchase access token</h1>
          <p className="text-xs mt-2 leading-5" style={{color:'#6B7280'}}>Real Paystack payment in USD — token issued only after verified success. Single-use, 30-day expiry. {isMock && <span style={{color:'#D97706', fontWeight:700}}>(Test mode)</span>}</p>

          {refParam && (
            <div className="mt-4 p-3 rounded-xl text-xs text-left" style={{background:'#FFFBEB', border:'1px solid #FDE68A', color:'#92400E'}}>
              <div>Reference detected: <span className="font-mono font-bold break-all">{refParam}</span></div>
              {!code && <button onClick={handleManualVerify} disabled={verifying} className="mt-2 px-3 py-1.5 rounded-full font-bold text-xs disabled:opacity-50" style={{background:'#0A0A0A', color:'#FFFFFF'}}>{verifying ? 'Verifying…' : 'Verify now →'}</button>}
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={()=> setPrice(50)} className="p-3 rounded-xl border text-center" style={price===50?{background:'#5E17EB', color:'#FFFFFF', border:'2px solid #5E17EB'}:{background:'#FFFFFF', border:'1px solid #EDEDED', color:'#6B7280'}}>
              <div className="font-bold text-sm">$50 <span className="font-normal text-[11px] opacity-60">USD</span></div>
              <div className="text-[11px]">Standard • $50 USD</div>
            </button>
            <button onClick={()=> setPrice(99)} className="p-3 rounded-xl border text-center" style={price===99?{background:'#5E17EB', color:'#FFFFFF', border:'2px solid #5E17EB'}:{background:'#FFFFFF', border:'1px solid #EDEDED', color:'#6B7280'}}>
              <div className="font-bold text-sm">$99 <span className="font-normal text-[11px] opacity-80">USD</span></div>
              <div className="text-[11px]">Premium • $99 USD</div>
            </button>
          </div>

          {!refParam && (
            <div className="mt-6 text-left space-y-3">
              <label style={{color:'#6B7280', fontSize:'11px', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase'}}>Email for receipt + code</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e)=> setEmail(e.target.value)}
                className="input"
                style={{background:'#FFFFFF', border:'1px solid #EDEDED', color:'#0A0A0A'}}
              />
              <button
                onClick={handlePayment}
                disabled={loading || verifying}
                className="w-full inline-flex items-center justify-center"
                style={{background:'#5E17EB', color:'#FFFFFF', height:'48px', borderRadius:'10px', fontWeight:800, fontSize:'13px', border:'none', cursor:'pointer', opacity: loading||verifying?0.7:1}}
              >
                {loading ? 'Redirecting…' : verifying ? 'Verifying…' : `Pay $${price} USD via Paystack →`}
              </button>
              <p className="text-[11px] text-center" style={{color:'#9CA3AF'}}>You’ll be charged in USD ($50 or $99). Test mode works without key. After success you return here automatically.</p>
            </div>
          )}

          {(message || code) && (
            <div className="mt-4 text-center">
              {message && <p className="text-xs leading-5 whitespace-pre-wrap break-words px-3 py-2 rounded-xl border" style={message.startsWith('✅')?{background:'#F0FDF4', borderColor:'#BBF7D0', color:'#166534'}:message.startsWith('⚠️')?{background:'#FFFBEB', borderColor:'#FDE68A', color:'#92400E'}:{background:'#F9FAFB', borderColor:'#EDEDED', color:'#6B7280'}}>{message}</p>}
              {code && (
                <div className="mt-3 p-4 rounded-xl text-center" style={{background:'#F5F3FF', border:'1px solid #EDE9FF'}}>
                  <div style={{color:'#6B7280', fontSize:'11px', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase'}}>Your {price===99?'Premium':'Standard'} code (${price}) {isMock && <span style={{color:'#D97706'}}>(test)</span>}</div>
                  <div className="font-bold tracking-[0.18em] mt-1 break-all" style={{color:'#0A0A0A', fontSize:'22px'}}>{code}</div>
                  <button onClick={()=> navigator.clipboard.writeText(code)} className="mt-2 text-xs font-bold" style={{color:'#5E17EB', textDecoration:'underline', background:'none', border:'none', cursor:'pointer'}}>Copy</button>
                  <div className="mt-3">
                    <button onClick={()=> navigate('/access')} className="w-full inline-flex items-center justify-center" style={{background:'#5E17EB', color:'#FFFFFF', height:'44px', borderRadius:'10px', fontWeight:800, fontSize:'13px', border:'none', cursor:'pointer'}}>Enter token →</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-2 flex-wrap" style={{color:'#9CA3AF', fontSize:'11px'}}>
            <span>Secure by Paystack</span>
            <span>•</span>
            <span>Token only after success</span>
            <span>•</span>
            <span style={{color:'#059669'}}>Test mode ready</span>
          </div>
          <p className="mt-2" style={{color:'#9CA3AF', fontSize:'10px', lineHeight:'1.4'}}>Missing key? Add <span className="font-mono" style={{color:'#6B7280'}}>PAYSTACK_SECRET_KEY=sk_test_...</span> to backend/.dev.vars then <span className="font-mono" style={{color:'#6B7280'}}>npx wrangler secret put PAYSTACK_SECRET_KEY</span></p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
