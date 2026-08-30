// ============================================================
// PAYMENT — Paystack Integration (Worker-compatible) — REAL + MOCK FALLBACK
// - Real mode: needs PAYSTACK_SECRET_KEY (test sk_test_... or live sk_live_...)
// - Mock mode: when key missing in dev, returns local checkout that still issues code
// - Amount handling: Paystack requires kobo (NGN*100) or cents (USD*100)
// ============================================================

function getPaystackKey(env) {
  return env.PAYSTACK_SECRET_KEY
    || env.PAYSTACK_SECRET
    || env.PAYSTACK_LIVE_SECRET_KEY
    || env.PAYSTACK_LIVE_SECRET
    || env.PAYSTACK_KEY
    || env.PAYSTACK_SK
    || env.VITE_PAYSTACK_SECRET_KEY
    || null;
}

function resolveAmount(env, price, amount) {
  // Pricing: $50 Lifetime (Access) vs $250 Founding vs $500 Regular vs $99
  const rawPrice = Number(price)
  let p = 250
  if (rawPrice === 50 || rawPrice === 99 || rawPrice === 500 || rawPrice === 250) p = rawPrice
  else if (Number(amount) === 5000) p = 50
  else if (Number(amount) === 9900) p = 99
  else if (Number(amount) === 50000) p = 500
  else if (Number(amount) === 25000) p = 250
  else if (Number(amount) >= 100) p = rawPrice || 250
  const currency = (env.PAYSTACK_CURRENCY || env.CURRENCY || 'USD').toUpperCase();
  if (currency === 'NGN') {
    const rate = Number(env.PAYSTACK_NGN_RATE || env.NGN_RATE || 1500);
    const ngn = Math.round(p * rate);
    return ngn * 100;
  }
  // USD cents: $250 -> 25000, $500 -> 50000, $99 -> 9900
  return p * 100;
}

function isMockAllowed(env) {
  // A missing production secret must never turn into free access.  Mock
  // transactions are only useful for local/development testing.
  return String(env.ENV || 'development').toLowerCase() !== 'production';
}

export async function initializePayment(env, email, amount = 25000, callbackUrl = null, price = null) {
  const key = getPaystackKey(env);
  const currency = (env.PAYSTACK_CURRENCY || 'USD').toUpperCase();

  // Resolve amount correctly — default $250 founding
  const resolvedAmount = resolveAmount(env, price || (amount === 9900 ? 99 : amount === 50000 ? 500 : 250), amount);

  // Mock fallback — when no key in dev/test, allow local testing without Paystack ($250/$500/$99)
  if (!key) {
    if (isMockAllowed(env)) {
      const pForMock = Number(price) || 250;
      const mockRef = `mock_${pForMock}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const cb = callbackUrl || env.PAYSTACK_CALLBACK_URL || (env.FRONTEND_URL ? `${env.FRONTEND_URL.replace(/\/$/,'')}/access` : 'http://localhost:5173/access');
      // Use URL with reference so frontend verify picks it up
      const separator = cb.includes('?') ? '&' : '?';
      const mockUrl = `${cb}${separator}reference=${encodeURIComponent(mockRef)}&email=${encodeURIComponent(email)}`;
      return { url: mockUrl, mock: true, reference: mockRef, note: 'Mock checkout — PAYSTACK_SECRET_KEY not set. Set it for real payments: npx wrangler secret put PAYSTACK_SECRET_KEY' };
    }
    const keys = Object.keys(env || {}).join(', ');
    throw new Error(`PAYSTACK_SECRET_KEY not set. Available env keys: [${keys || 'none'}]. Fix: npx wrangler secret put PAYSTACK_SECRET_KEY  (get key: https://dashboard.paystack.com/#/settings/developer ) — or add to backend/.dev.vars for local.`);
  }

  const cb = callbackUrl || env.PAYSTACK_CALLBACK_URL || (env.FRONTEND_URL ? `${env.FRONTEND_URL.replace(/\/$/,'')}/access` : 'https://alphatekx.name.ng/access');

  const body = {
    email,
    amount: resolvedAmount,
    currency,
    callback_url: cb,
    metadata: { type: 'access_code', price: price || (resolvedAmount === 9900 ? 99 : resolvedAmount === 50000 ? 500 : 250), originalPrice: 500, founding: true, source: 'alpha-agency' },
  };

  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const text = await response.text().catch(()=>'');
  let data = {};
  try { data = JSON.parse(text); } catch { data = { status: false, message: text.slice(0,300) }; }

  if (!response.ok || !data.status) {
    // Surface Paystack message clearly
    const msg = data.message || `Paystack ${response.status}: ${text.slice(0,300)}`;
    // Common mistakes: callback_url not whitelisted, currency not enabled
    if (/currency/i.test(msg) && currency === 'USD') throw new Error(msg + ' — Your Paystack account may not have USD enabled. Set PAYSTACK_CURRENCY=NGN or enable USD in dashboard.');
    if (/callback/i.test(msg)) throw new Error(msg + ' — Check PAYSTACK_CALLBACK_URL is whitelisted in Paystack dashboard.');
    throw new Error(msg);
  }
  // Return string for backwards-compat, but also support object
  return data.data.authorization_url;
}

export async function verifyPayment(env, reference) {
  const key = getPaystackKey(env);
  if (!reference) throw new Error('Reference required');

  // Mock reference — allowed when key missing in dev, issues success without calling Paystack
  if (String(reference).startsWith('mock_')) {
    if (isMockAllowed(env)) {
      const now = new Date().toISOString();
      let mockAmt = 25000
      if (String(reference).includes('_99_') || String(reference).startsWith('mock_99_')) mockAmt = 9900
      else if (String(reference).includes('_500_') || String(reference).startsWith('mock_500_')) mockAmt = 50000
      else mockAmt = 25000
      const priceForMock = mockAmt === 9900 ? 99 : mockAmt === 50000 ? 500 : 250
      return { status: 'success', reference, amount: mockAmt, currency: env.PAYSTACK_CURRENCY || 'USD', paid_at: now, gateway_response: `Approved (mock — $` + priceForMock + `)`, mock: true, metadata: { price: priceForMock } };
    }
    throw new Error('Mock reference not allowed with real Paystack key — complete real checkout.');
  }

  if (!key) {
    throw new Error('PAYSTACK_SECRET_KEY not set — cannot verify real reference. Set it in Cloudflare Worker secrets or use mock reference for dev.');
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    }
  });

  const text = await response.text().catch(()=>'');
  let data = {};
  try { data = JSON.parse(text); } catch { data = { status: false, message: text.slice(0,300) }; }

  if (!response.ok || !data.status) {
    throw new Error(data.message || `Verification failed ${response.status}: ${text.slice(0,300)}`);
  }
  const txn = data.data;
  if (txn.status !== 'success') {
    throw new Error(`Payment not successful: ${txn.status} — ${txn.gateway_response || 'pending'}. If you paid, wait 30s and retry, or contact alphatekxcompany@gmail.com with reference ${reference}`);
  }
  return txn;
}

// Helper for routes to unwrap initialize result
export function unwrapInitResult(res) {
  if (typeof res === 'string') return res;
  if (res && res.url) return res.url;
  return null;
}
