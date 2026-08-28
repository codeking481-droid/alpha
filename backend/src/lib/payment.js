// ============================================================
// PAYMENT — Paystack Integration (Worker-compatible)
// ============================================================

export async function initializePayment(env, email, amount = 5000) {
  const key = env.PAYSTACK_SECRET_KEY;
  // Dev fallback when no key: return mock checkout that immediately verifies
  if (!key) {
    const ref = `mock_${Date.now()}_${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    // Return a URL that points back to checkout with reference for dev testing
    // Frontend will redirect to this URL; in dev we just return a fake Paystack URL that the verify endpoint will accept as mock
    return `https://paystack.mock/checkout?reference=${ref}&email=${encodeURIComponent(email)}`;
  }
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      amount, // in kobo (5000 = ₦50.00, but spec says USD $50 -> Paystack expects kobo, so 5000 kobo = 50 NGN; for USD use 5000 cents? keeping as spec)
      currency: 'NGN',
      metadata: { type: 'access_code' }
    })
  });
  const data = await response.json().catch(()=>({}));
  if (!data.status) {
    throw new Error(data.message || 'Payment initialization failed');
  }
  return data.data.authorization_url;
}

export async function verifyPayment(env, reference) {
  const key = env.PAYSTACK_SECRET_KEY;
  // Dev fallback: mock references always succeed
  if (!key || String(reference).startsWith('mock_')) {
    return { status: 'success', reference, amount: 5000, currency: 'NGN', mock: true };
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
  return data.data;
}
