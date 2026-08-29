// ============================================================
// API TOKENS — Generate and manage API tokens for team members
// Uses Supabase REST helpers with in-memory fallback
// ============================================================
import { sbSelect, sbInsert, sbUpdate, sbDelete, getSupabase } from './supabase.js'

const ALLOWED_EMAIL = 'alphatekxcompany@gmail.com'

function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = 'sk_'
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

export async function createApiToken(env, email, name = null) {
  // Only allow token creation for the admin email
  if (String(email).toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
    throw new Error('Only admin users can create API tokens')
  }

  const tokenKey = generateToken()
  const row = {
    token_key: tokenKey,
    email: email,
    name: name || `Token ${new Date().toLocaleDateString()}`,
    is_active: true,
    created_at: new Date().toISOString()
  }

  if (getSupabase(env)) {
    try {
      const data = await sbInsert(env, 'api_tokens', row)
      // Return token only on creation
      return { ...data, token_key: tokenKey }
    } catch (e) {
      throw e
    }
  }

  return { id: `mem_${Date.now()}`, ...row, token_key: tokenKey }
}

export async function getApiTokens(env, email) {
  // Only allow users to see their own tokens
  if (String(email).toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
    return []
  }

  if (getSupabase(env)) {
    try {
      const rows = await sbSelect(
        env,
        'api_tokens',
        `email=eq.${encodeURIComponent(email)}&order=created_at.desc`
      )
      // Don't return the full token key in list view, only a masked version
      return (rows || []).map((row) => ({
        ...row,
        token_key: row.token_key ? row.token_key.slice(0, 10) + '...' : ''
      }))
    } catch {
      return []
    }
  }

  return []
}

export async function revokeApiToken(env, tokenId, email) {
  // Only allow users to revoke their own tokens
  if (String(email).toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
    throw new Error('Unauthorized: Can only revoke your own tokens')
  }

  if (getSupabase(env)) {
    try {
      await sbUpdate(env, 'api_tokens', tokenId, { is_active: false })
      return { ok: true }
    } catch (e) {
      throw e
    }
  }

  return { ok: true }
}

export async function verifyApiToken(env, tokenKey) {
  if (!tokenKey) return { valid: false, error: 'Token required' }

  if (getSupabase(env)) {
    try {
      const rows = await sbSelect(env, 'api_tokens', `token_key=eq.${encodeURIComponent(tokenKey)}&limit=1`)
      const row = rows && rows[0]

      if (!row) return { valid: false, error: 'Invalid token' }
      if (!row.is_active) return { valid: false, error: 'Token is revoked' }

      // Update last_used timestamp
      await sbUpdate(env, 'api_tokens', row.id, { last_used: new Date().toISOString() })

      return { valid: true, token: row, email: row.email }
    } catch (e) {
      return { valid: false, error: e.message || 'Token verification failed' }
    }
  }

  return { valid: false, error: 'Token verification not available' }
}

export async function deleteApiToken(env, tokenId, email) {
  // Only allow users to delete their own tokens
  if (String(email).toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
    throw new Error('Unauthorized: Can only delete your own tokens')
  }

  if (getSupabase(env)) {
    try {
      await sbDelete(env, 'api_tokens', tokenId)
      return { ok: true }
    } catch (e) {
      throw e
    }
  }

  return { ok: true }
}
