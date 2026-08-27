// Auth + Access Codes — Supabase Auth + simple code table
import { sbSelect, sbInsert, sbUpdate } from "./supabase.js"

export async function verifyAccessCode(env, code) {
  if (!code) return { ok: false, error: 'code required' }
  // Try Supabase
  try {
    const rows = await sbSelect(env, 'access_codes', `code=eq.${code}&limit=1`)
    if (rows && rows[0]) {
      if (rows[0].used) return { ok: false, error: 'code already used' }
      await sbUpdate(env, 'access_codes', rows[0].id, { used: true })
      return { ok: true, code: rows[0] }
    }
  } catch {}
  // Fallback: env.ACCESS_CODES (comma-separated) or allow any 6+ char in dev
  const envCodes = (env.ACCESS_CODES || '').split(',').map((s) => s.trim()).filter(Boolean)
  if (envCodes.length && envCodes.includes(code)) return { ok: true, code: { code } }
  if (env.ENV !== 'production' && code.length >= 6) return { ok: true, code: { code }, mocked: true }
  return { ok: false, error: 'invalid code' }
}

export function getUserFromRequest(c) {
  const auth = c.req.header('Authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  // TODO: verify Supabase JWT with env.SUPABASE_JWT_SECRET if needed
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''))
    return { id: payload.sub, email: payload.email, role: payload.role || 'member' }
  } catch { return { token } }
}
