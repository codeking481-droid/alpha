import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../lib/api.js';

export const Checkout = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || localStorage.getItem('alpha.pending_email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handlePayment = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('❌ Enter a valid email');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/payment/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data.error || 'Initialization failed');
      if (data.checkoutUrl) {
        if (String(data.checkoutUrl).includes('paystack.mock')) {
          // Dev mock — auto-verify immediately
          const url = new URL(data.checkoutUrl);
          const ref = url.searchParams.get('reference') || data.checkoutUrl.split('reference=')[1] || 'mock_' + Date.now();
          setMessage('✅ Mock payment — verifying...');
          const vRes = await fetch(`${API_URL}/api/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference: ref, email }),
          });
          const vData = await vRes.json().catch(()=>({}));
          if (vRes.ok && vData.success) {
            const c = vData.code || vData.row?.code || vData.row?.code;
            setCode(c || vData.row?.code || '');
            // Auto-store and offer to continue
            if (c) localStorage.setItem('alpha.pending_code', c);
            setMessage(`✅ Payment verified (mock) — your code: ${c || '(see below)'}`);
          } else {
            throw new Error(vData.error || 'Verify failed');
          }
        } else {
          // Real Paystack — redirect
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
          <Link to="/access-code" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs tracking-widest uppercase font-bold">← Back to access code</Link>
        </div>
        <div className="mature-card rounded-[20px] p-7 sm:p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto text-xl">💳</div>
          <h1 className="text-xl font-black tracking-tight text-white mt-4">Get access — $50</h1>
          <p className="text-white/40 text-xs mt-2 leading-5">One-time. Single-use. Expires in 30 days. Pay via Paystack, code sent to your email.</p>

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
              {loading ? 'Processing…' : '💳 Pay $50 — Get code'}
            </button>
          </div>

          {message && <p className="mt-4 text-xs leading-5 whitespace-pre-wrap break-words text-white/70 text-center">{message}</p>}
          {code && (
            <div className="mt-4 p-4 rounded-xl bg-white text-[#0B0215] text-center">
              <div className="eyebrow text-[#0B0215]/50">Your code</div>
              <div className="text-2xl font-black tracking-[0.3em] mt-1">{code}</div>
              <button onClick={()=> navigator.clipboard.writeText(code)} className="mt-2 text-xs font-bold underline">Copy</button>
              <div className="mt-3">
                <button onClick={()=> navigate('/access-code')} className="w-full bg-[#0B0215] text-white py-2.5 rounded-full font-black text-xs tracking-widest uppercase">Enter code →</button>
              </div>
            </div>
          )}

          <p className="mt-6 text-[11px] text-white/20 text-center">Admin? <a href="/auth" className="text-white/40 hover:text-white underline">Log in as alphatekxcompany@gmail.com</a> — bypasses payment. Codes are admin-generated free.</p>
          <div className="mt-2 text-center text-[11px] text-white/20">
            <Link to="/dashboard" className="hover:text-white underline">Dev mock: no Paystack key → instant code</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
