// Central API client — switch between local and production
// Set VITE_API_URL in frontend/.env for production Workers URL
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787"

export async function api(path, opts = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  })
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`)
  return res.json()
}

// Usage example:
// api("/api/analytics/overview").then(data => ...)
// api("/api/ai/generate", { method: "POST", body: JSON.stringify({ topic, format }) })
