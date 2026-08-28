import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../lib/api.js';

export const Checkout = () => {
  const [searchParams] = useSearchParams();
  const priceParam = searchParams.get('price');
  const initialPrice = priceParam === '99' ? 99 : 50;
  const initialEmail = searchParams.get('email') || localStorage.getItem('alpha.pending_email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [price, setPrice] = useState(initialPrice);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  useEffect(()=>{ setPrice(initialPrice); }, [initialPrice]);

  const handlePayment = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('❌ Enter a valid email');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const amount = price === 99 ? 9900 : 5000;
      const res = await fetch(`${API_URL}/api/payment/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), amount, price }),
      });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data.error || 'Initialization failed');
      if (data.checkoutUrl) {
        if (String(data.checkoutUrl).includes('paystack.mock')) {
          const url = new URL(data.checkoutUrl);
          const ref = url.searchParams.get('reference') || 'mock_' + Date.now();
          setMessage(`✅ Mock payment $${price} — verifying...`);
          const vRes = await fetch(`${API_URL}/api/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference: ref, email, amount, price }),
          });
          const vData = await vRes.json().catch(()=>({}));
          if (vRes.ok && vData.success) {
            const c = vData.code || vData.row?.code || '';
            setCode(c);
            if (c) localStorage.setItem('alpha.pending_code', c);
            setMessage(`✅ Payment $${price} verified (mock) — code: ${c || ''} — ${price===99?'Premium':'Standard'} access`);
          } else {
            throw new Error(vData.error || 'Verify failed');
          }
        } else {
          window.location.href = data.checkoutUrl;
        }
      } else {
        setMessage('❌ ' + (data.error || 'No checkout URL'));
      }
    } catch (e) {
      setMessage('❌ ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0215] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/access-code" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs tracking-widest uppercase font-bold">← Back to token</Link>
        </div>
        <div className="mature-card rounded-[20px] p-7 sm:p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto text-xl">💳</div>
          <h1 className="text-xl font-black tracking-tight text-white mt-4">Purchase access token</h1>
          <p className="text-white/40 text-xs mt-2">One-time. Single-use. 30-day expiry. Choose tier.</p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={()=> setPrice(50)} className={`p-3 rounded-xl border text-center ${price===50?'bg-white text-[#0B0215] border-white':'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}>
              <div className="font-black text-sm">$50</div>
              <div className="text-[11px]">Standard</div>
            </button>
            <button onClick={()=> setPrice(99)} className={`p-3 rounded-xl border text-center ${price===99?'bg-[#FFD700] text-[#0B0215] border-[#FFD700]':'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}>
              <div className="font-black text-sm">$99</div>
              <div className="text-[11px]">Premium</div>
            </button>
          </div>

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
              disabled={loading}
              className="w-full bg-white text-[#0B0215] py-3 rounded-full font-black text-xs tracking-widest uppercase hover:bg-white/90 disabled:opacity-50"
            >
              {loading ? 'Processing…' : `💳 Pay $${price} — Get token`}
            </button>
          </div>

          {message && <p className="mt-4 text-xs leading-5 whitespace-pre-wrap break-words text-white/70 text-center">{message}</p>}
          {code && (
            <div className="mt-4 p-4 rounded-xl bg-white text-[#0B0215] text-center">
              <div className="eyebrow text-[#0B0215]/50">Your {price===99?'Premium':'Standard'} code (${price})</div>
              <div className="text-2xl font-black tracking-[0.3em] mt-1">{code}</div>
              <button onClick={()=> navigator.clipboard.writeText(code)} className="mt-2 text-xs font-bold underline">Copy</button>
              <div className="mt-3">
                <button onClick={()=> navigate('/access-code')} className="w-full bg-[#0B0215] text-white py-2.5 rounded-full font-black text-xs tracking-widest uppercase">Enter token →</button>
              </div>
            </div>
          )}

          <p className="mt-6 text-[11px] text-white/20 text-center">Admin alphatekxcompany@gmail.com uses <span className="font-mono text-white/40">126213JESUS</span> once → then generates for team at /admin (free, price 0).</p>
          <div className="mt-2 text-center text-[11px] text-white/20">
            <Link to="/dashboard" className="hover:text-white underline">Dev mock: no Paystack key → instant code</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
