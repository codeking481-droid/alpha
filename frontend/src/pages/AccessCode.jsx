import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

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
      const emailParam = userEmail ? `&email=${encodeURIComponent(userEmail)}` : '';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/verify?reference=${reference}${emailParam}`, { credentials: 'include' });
      const data = await res.json();
      const codeOut = data.accessCode || data.code;
      if ((data.success || data.code) && codeOut) {
        setCode(codeOut);
        localStorage.setItem('demo_hasAccess', 'true');
        setMessage(`✅ Payment verified! Your code: ${codeOut}. Redirecting...`);
        setTimeout(() => navigate('/dashboard'), 1200);
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
    if (!code.trim()) { setMessage('❌ Enter a code'); return; }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ Access granted! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 1000);
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
    if (!userEmail) { setMessage('❌ Please sign in with Google first'); return; }
    setLoading(true);
    setMessage('Starting payment...');
    try {
      const callbackUrl = window.location.origin + '/access';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail, price: 50, amount: 5000, callback_url: callbackUrl, callbackUrl })
      });
      const data = await res.json();
      const url = data.checkoutUrl || data.authorization_url || data.url;
      if (url) {
        // Real Paystack: redirect to authorization_url
        window.location.href = url;
      } else if (data.mock && data.reference) {
        // Mock fallback: show code directly
        localStorage.setItem('demo_hasAccess', 'true');
        setMessage(`✅ Mock payment ready! Your code: ALPHA-TEST-${data.reference.slice(-4).toUpperCase()}. Redirecting...`);
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setMessage('❌ ' + (data.error || 'Could not start payment. Set PAYSTACK_SECRET_KEY in Worker secrets for real payments.'));
      }
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