import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { API_URL } from '../lib/api';

export const AccessCode = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      } else {
        supabase.auth.getSession().then(({ data: sessionData }) => {
          if (sessionData?.session?.user?.email) {
            setUserEmail(sessionData.session.user.email);
          } else if (!data?.user) {
            const reference = searchParams.get('reference');
            if (!reference) {
              setTimeout(() => {
                supabase.auth.getSession().then(({ data: { session } }) => {
                  if (!session?.user) navigate('/');
                });
              }, 800);
            }
          }
        });
      }
    });
    const reference = searchParams.get('reference');
    if (reference) handleAutoVerify(reference);
  }, []);

  const handleAutoVerify = async (reference) => {
    setLoading(true);
    setMessage('Verifying payment...');
    try {
      const callbackEmail = userEmail || searchParams.get('email') || '';
      const emailParam = callbackEmail ? `&email=${encodeURIComponent(callbackEmail)}` : '';
      const res = await fetch(`${API_URL}/api/payment/verify?reference=${encodeURIComponent(reference)}${emailParam}`, { credentials: 'include' });
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text.slice(0,120) || 'Empty response' }; }
      const codeOut = data.accessCode || data.code;
      if ((data.success || data.code) && codeOut) {
        setCode(codeOut);
        localStorage.setItem('master_unlocked', 'true');
        setMessage(`✅ Payment verified! Your code: ${codeOut}. Redirecting...`);
        setTimeout(() => navigate('/dashboard'), 800);
      } else {
        setMessage('❌ ' + (data.error || 'Payment verification failed'));
      }
    } catch (e) {
      setMessage('❌ ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const upper = code.trim().toUpperCase();
    if (!upper) { setMessage('❌ Enter a code'); return; }

    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: upper })
      });
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text.slice(0,200) || `Server error ${res.status}` }; }
      if (data.success || data.ok) {
        localStorage.setItem('master_unlocked', 'true');
        setMessage('✅ Access granted! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 700);
      } else {
        setMessage('❌ ' + (data.error || 'Invalid code'));
      }
    } catch (err) {
      setMessage('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    let email = userEmail;
    if (!email) {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email) { email = data.user.email; setUserEmail(email); }
        else {
          const { data: s } = await supabase.auth.getSession();
          if (s?.session?.user?.email) { email = s.session.user.email; setUserEmail(email); }
        }
      } catch {}
    }
    const demoEmail = localStorage.getItem('demo_user') ? JSON.parse(localStorage.getItem('demo_user')||'{}').email : null;
    email = email || demoEmail || 'test@alpha.agency';
    if (!email || email === 'test@alpha.agency') {
      // still allow mock for testing - don't block
    }
    setLoading(true);
    setMessage('Starting payment...');
    try {
      const callbackUrl = window.location.origin + '/access';
      const res = await fetch(`${API_URL}/api/payment/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, price: 50, amount: 5000, callback_url: callbackUrl, callbackUrl })
      });
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text.slice(0,500) || `HTTP ${res.status} empty` }; }
      const url = data.checkoutUrl || data.authorization_url || data.url || data.data?.authorization_url;
      if (url) {
        window.location.href = url;
        return;
      }
      // Show real backend error verbatim so Paystack key issues are visible
      const detail = data.error || data.message || text.slice(0,400) || `HTTP ${res.status}`;
      if (detail.includes('PAYSTACK_SECRET_KEY') || detail.includes('Paystack')) {
        setMessage(`❌ Paystack: ${detail.slice(0,220)} — Go Worker → Settings → Add secret PAYSTACK_SECRET_KEY=sk_live_... then Save and deploy. For now use master 126213JESUSISKING`);
        return;
      }
      setMessage(`❌ ${res.status}: ${detail.slice(0,200)}`);
    } catch (err) {
      setMessage('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = message.startsWith('✅');
  const isError = message.startsWith('❌');

  return (
    <div className="min-h-screen bg-[#FFFCF8] flex items-center justify-center px-4 font-['Inter',sans-serif]">
      <div className="max-w-md w-full bg-white border border-[#EDEDED] rounded-xl p-8">
        <div className="text-4xl text-center mb-4">🔑</div>
        <h1 className="font-semibold text-2xl text-[#0A0A0A] text-center tracking-tight">Access Alpha Agency</h1>
        <p className="text-sm text-[#6B7280] text-center mt-2">Buy a token or enter one you already have.</p>
        <div className="mt-8">
          <button onClick={handlePayment} disabled={loading} className="w-full bg-[#0A0A0A] text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-[15px] cursor-pointer">
            Buy Access Token — $50
          </button>
          <p className="text-center text-xs text-[#6B7280] mt-2">One-time payment, lifetime access</p>
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-[#EDEDED]"></div>
            <span className="text-sm text-[#6B7280]">or</span>
            <div className="flex-1 h-px bg-[#EDEDED]"></div>
          </div>
          <form onSubmit={handleVerify}>
            <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ALPHA-XXXX-XXXX" className="w-full border border-[#EDEDED] rounded-lg px-4 py-3 text-center text-xl tracking-widest uppercase focus:border-[#5E17EB] focus:outline-none placeholder:text-[#9CA3AF] text-[#0A0A0A] bg-white" />
            <button type="submit" disabled={loading} className="w-full bg-white text-black border border-[#EDEDED] py-4 rounded-lg font-semibold hover:bg-gray-50 mt-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-[15px] cursor-pointer">
              {loading ? 'Verifying...' : 'Unlock Platform →'}
            </button>
          </form>
          {message && <p className={`mt-4 text-center text-sm ${isSuccess ? 'text-green-600' : isError ? 'text-red-600' : 'text-[#6B7280]'}`}>{message}</p>}
        </div>
      </div>
    </div>
  );
};
