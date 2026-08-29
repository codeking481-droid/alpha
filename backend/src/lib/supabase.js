// Supabase client — works with env.SUPABASE_URL + SUPABASE_ANON_KEY (or SERVICE_KEY)
// Falls back to null when not configured — caller uses in-memory

export function getSupabase(env) {
  const url = env.SUPABASE_URL
  // Prefer service key for writes (bypasses RLS) — anon is read-only when RLS enabled
  const key = env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY
  if (!url || !key) return null
  return { url: url.replace(/\/$/, ''), key }
}

export async function sbSelect(env, table, query = '') {
  const sb = getSupabase(env)
  if (!sb) return null
  const res = await fetch(`${sb.url}/rest/v1/${table}${query ? `?${query}` : ''}`, {
    headers: { apikey: sb.key, Authorization: `Bearer ${sb.key}`, 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(`Supabase select ${table} ${res.status}: ${await res.text()}`)
  return await res.json()
}

export async function sbInsert(env, table, row) {
  const sb = getSupabase(env)
  if (!sb) return null
  const res = await fetch(`${sb.url}/rest/v1/${table}`, {
    method: 'POST',
    headers: { apikey: sb.key, Authorization: `Bearer ${sb.key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(row),
  })
  if (!res.ok) throw new Error(`Supabase insert ${table} ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data[0] || data
}

export async function sbUpdate(env, table, id, patch) {
  const sb = getSupabase(env)
  if (!sb) return null
  const res = await fetch(`${sb.url}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: { apikey: sb.key, Authorization: `Bearer ${sb.key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error(`Supabase update ${table} ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data[0] || data
}

export async function sbDelete(env, table, id) {
  const sb = getSupabase(env)
  if (!sb) return null
  const res = await fetch(`${sb.url}/rest/v1/${table}?id=eq.${id}`, {
    method: 'DELETE',
    headers: { apikey: sb.key, Authorization: `Bearer ${sb.key}` },
  })
  if (!res.ok) throw new Error(`Supabase delete ${table} ${res.status}: ${await res.text()}`)
  return true
}

export async function sbGetOne(env, table, id) {
  const list = await sbSelect(env, table, `id=eq.${id}&limit=1`)
  return list && list[0] ? list[0] : null
}
