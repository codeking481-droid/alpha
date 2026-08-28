// ============================================================
// PAYMENT — Paystack Integration (Worker-compatible) — REAL ONLY
// Supports multiple env var names for flexibility
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

export async function initializePayment(env, email, amount = 5000, callbackUrl = null) {
  const key = getPaystackKey(env);
  if (!key) {
    const keys = Object.keys(env || {}).join(', ');
    throw new Error(`PAYSTACK_SECRET_KEY not set. Available env keys: [${keys || 'none'}]. Set it via: npx wrangler secret put PAYSTACK_SECRET_KEY (or add to .dev.vars for local). Get key from https://dashboard.paystack.com/#/settings/developer`);
  }
  const currency = env.PAYSTACK_CURRENCY || 'NGN';
  // Use frontend callback if provided else env
  const cb = callbackUrl || env.PAYSTACK_CALLBACK_URL || (env.FRONTEND_URL ? `${env.FRONTEND_URL.replace(/\/$/,'')}/checkout` : 'https://alphatekx.name.ng/checkout');
  const body = {
    email,
    amount,
    currency,
    callback_url: cb,
    metadata: { type: 'access_code', price: amount === 9900 ? 99 : 50 },
  };
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(()=>({}));
  if (!data.status) {
    throw new Error(data.message || `Paystack init failed: ${response.status} ${JSON.stringify(data).slice(0,200)}`);
  }
  return data.data.authorization_url;
}

export async function verifyPayment(env, reference) {
  const key = getPaystackKey(env);
  if (!key) {
    throw new Error('PAYSTACK_SECRET_KEY not set — cannot verify. Set it in Cloudflare Worker secrets.');
  }
  if (!reference) throw new Error('Reference required');
  // Do not allow mock refs when real key is set
  if (String(reference).startsWith('mock_')) {
    throw new Error('Mock reference not allowed with real Paystack key — complete real checkout.');
  }
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json().catch(()=>({}));
  if (!data.status) {
    throw new Error(data.message || 'Payment verification failed');
  }
  const txn = data.data;
  if (txn.status !== 'success') {
    throw new Error(`Payment not successful: ${txn.status} — ${txn.gateway_response || ''}`);
  }
  return txn;
}
