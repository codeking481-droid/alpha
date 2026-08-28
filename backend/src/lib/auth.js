// Auth + Access Codes — Supabase Auth + simple code table (Worker-compatible)
import { sbSelect, sbInsert, sbUpdate, getSupabase } from "./supabase.js"

export async function verifyAccessCode(env, code) {
  if (!code) return { ok: false, error: 'code required' }
  // Try Supabase
  try {
    const rows = await sbSelect(env, 'access_codes', `code=eq.${String(code).trim().toUpperCase()}&limit=1`)
    if (rows && rows[0]) {
      if (rows[0].used) return { ok: false, error: 'code already used' }
      await sbUpdate(env, 'access_codes', rows[0].id, { used: true })
      return { ok: true, code: rows[0] }
    }
  } catch {}
  // Fallback: env.ACCESS_CODES (comma-separated) or allow any 6+ char in dev
  const envCodes = (env.ACCESS_CODES || '').split(',').map((s) => s.trim().toUpperCase()).filter(Boolean)
  const upper = String(code).trim().toUpperCase()
  if (envCodes.length && envCodes.includes(upper)) return { ok: true, code: { code: upper } }
  if (env.ENV !== 'production' && upper.length >= 6) return { ok: true, code: { code: upper }, mocked: true }
  return { ok: false, error: 'invalid code' }
}

export function getUserFromRequest(c) {
  const auth = c.req.header('Authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  if (!token) return null
  // mock-jwt-xxx from /api/auth/login
  if (token.startsWith('mock-jwt-')) {
    return { id: token, email: 'mock@local', role: 'member', token }
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''))
    return { id: payload.sub || payload.user_id || token, email: payload.email, role: payload.role || 'member', token }
  } catch { return { id: token, token } }
}

// Middleware helpers — Worker-compatible (no supabase-js server client)
export async function requireAuth(c, env) {
  const user = getUserFromRequest(c)
  if (!user) return null
  // If Supabase configured, optionally verify profile exists
  if (env && getSupabase(env) && user.id && !String(user.id).startsWith('mock-jwt-')) {
    try {
      const rows = await sbSelect(env, 'profiles', `id=eq.${user.id}&limit=1`)
      if (rows && rows[0] && rows[0].role) user.role = rows[0].role
    } catch {}
  }
  return user
}

export async function requireAdmin(c, env) {
  const user = await requireAuth(c, env)
  if (!user) return null
  // ENV ADMIN_EMAILS comma-separated overrides
  const adminEmails = (env.ADMIN_EMAILS || '').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)
  if (adminEmails.length && user.email && adminEmails.includes(String(user.email).toLowerCase())) return { ...user, role: 'admin' }
  if (user.role === 'admin') return user
  // In dev, allow mock token to be admin if no Supabase
  if (!getSupabase(env) && env.ENV !== 'production') return { ...user, role: 'admin' }
  return null
}
