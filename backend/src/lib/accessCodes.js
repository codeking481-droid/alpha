// ============================================================
// ACCESS CODES — Generate and verify codes (Worker-compatible)
// Uses Supabase REST helpers with in-memory fallback
// ============================================================
import { sbSelect, sbInsert, sbUpdate, getSupabase } from './supabase.js';

function genCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function generateAccessCode(env, createdBy) {
  const code = genCode();
  const row = { code, created_by: createdBy || null, user_id: null, used: false, price: 0, email: null, created_at: new Date().toISOString() };
  if (getSupabase(env)) {
    try {
      const data = await sbInsert(env, 'access_codes', row);
      return data;
    } catch (e) {
      throw e;
    }
  }
  return { id: `mem_${Date.now()}`, ...row };
}

export async function generatePaidAccessCode(env, email, price = 50) {
  const code = genCode();
  const p = Number(price) === 99 ? 99 : 50;
  const row = { code, created_by: null, user_id: null, used: false, price: p, email: email || null, created_at: new Date().toISOString() };
  if (getSupabase(env)) {
    try {
      const data = await sbInsert(env, 'access_codes', row);
      return data;
    } catch (e) {
      throw e;
    }
  }
  return { id: `mem_${Date.now()}`, ...row };
}

export async function verifyAccessCodeWithUser(env, code, userId) {
  if (!code) return { valid: false, error: 'Code is required' };
  const upper = String(code).trim().toUpperCase();
  if (getSupabase(env)) {
    try {
      const rows = await sbSelect(env, 'access_codes', `code=eq.${encodeURIComponent(upper)}&limit=1`);
      const row = rows && rows[0];
      if (!row) return { valid: false, error: 'Invalid code' };
      if (row.used) return { valid: false, error: 'Invalid or already used code' };
      // 30-day expiry optional
      if (row.created_at) {
        const age = Date.now() - new Date(row.created_at).getTime();
        if (age > 30*24*60*60*1000) return { valid: false, error: 'Code expired' };
      }
      await sbUpdate(env, 'access_codes', row.id, { used: true, user_id: userId || row.user_id });
      return { valid: true, code: row };
    } catch (e) {
      return { valid: false, error: e.message || 'Verification failed' };
    }
  }
  // Fallback: env.ACCESS_CODES or allow any 6+ char in non-production
  const envCodes = (env.ACCESS_CODES || '').split(',').map(s=>s.trim().toUpperCase()).filter(Boolean);
  if (envCodes.length && envCodes.includes(upper)) return { valid: true, code: { code: upper } };
  if (env.ENV !== 'production' && upper.length >= 6) return { valid: true, code: { code: upper }, mocked: true };
  return { valid: false, error: 'Invalid code' };
}

export async function getAccessCodes(env) {
  if (getSupabase(env)) {
    try {
      const data = await sbSelect(env, 'access_codes', 'order=created_at.desc');
      return data || [];
    } catch { return []; }
  }
  // No Supabase — return mem via caller (will be handled in index.js)
  return null;
}
