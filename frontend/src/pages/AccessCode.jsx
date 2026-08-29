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

  // Get logged in user email + protected redirect + auto-verify
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      } else {
        // Check session as fallback
        supabase.auth.getSession().then(({ data: sessionData }) => {
          if (sessionData?.session?.user?.email) {
            setUserEmail(sessionData.session.user.email);
          } else if (!data?.user) {
            // Protected: redirect to / if not logged in (allow brief delay for OAuth)
            // Only redirect if no reference param (payment callback may still be processing)
            const reference = searchParams.get('reference');
            if (!reference) {
              // give supabase a moment to restore session from redirect
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

    // AUTO-VERIFY if coming from Paystack checkout ?reference=xxx
    const reference = searchParams.get('reference');
    if (reference) {
      handleAutoVerify(reference);
    }
  }, []);

  const handleAutoVerify = async (reference) => {
    setLoading(true);
    setMessage('Verifying payment...');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/verify?reference=${reference}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success && data.accessCode) {
        setCode(data.accessCode);
        setMessage(`✅ Payment verified! Your code: ${data.accessCode}. Redirecting...`);
        setTimeout(() => navigate('/dashboard'), 2000);
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
        setMessage('❌ ' + data.error);
      }
    } catch (err) {
      setMessage('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!userEmail) {
      setMessage('❌ Please sign up first');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail })
      });
      const data = await res.json();
      if (data.checkoutUrl || data.authorization_url) {
        window.location.href = data.checkoutUrl || data.authorization_url;
      } else {
        setMessage('❌ ' + (data.error || 'Could not start payment'));
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
        {/* Top icon */}
        <div className="text-4xl text-center mb-4">🔑</div>

        {/* Title */}
        <h1 className="font-semibold text-2xl text-[#0A0A0A] text-center tracking-tight">Access Alpha Agency</h1>
        <p className="text-sm text-[#6B7280] text-center mt-2">Buy a token or enter one you already have.</p>

        <div className="mt-8">
          {/* Section 1 - BUY BUTTON */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-[#0A0A0A] text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-[15px]"
          >
            Buy Access Token — $50
          </button>
          <p className="text-center text-xs text-[#6B7280] mt-2">One-time payment, lifetime access</p>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-[#EDEDED]"></div>
            <span className="text-sm text-[#6B7280]">or</span>
            <div className="flex-1 h-px bg-[#EDEDED]"></div>
          </div>

          {/* Section 2 - ENTER TOKEN FORM */}
          <form onSubmit={handleVerify}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ALPHA-XXXX-XXXX"
              className="w-full border border-[#EDEDED] rounded-lg px-4 py-3 text-center text-xl tracking-widest uppercase focus:border-[#5E17EB] focus:outline-none placeholder:text-[#9CA3AF] text-[#0A0A0A] bg-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black border border-[#EDEDED] py-4 rounded-lg font-semibold hover:bg-gray-50 mt-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-[15px]"
            >
              {loading ? 'Verifying...' : 'Unlock Platform →'}
            </button>
          </form>

          {/* Message area */}
          {message && (
            <p className={`mt-4 text-center text-sm ${isSuccess ? 'text-green-600' : isError ? 'text-red-600' : 'text-[#6B7280]'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
