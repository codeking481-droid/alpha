// Real API client — VITE_API_URL points to Workers
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787"

async function req(path, opts = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`${path} ${res.status}: ${text}`)
  }
  const ct = res.headers.get("content-type") || ""
  return ct.includes("application/json") ? res.json() : res.text()
}

export const api = {
  get: (p) => req(p),
  post: (p, body) => req(p, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: (p, body) => req(p, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  del: (p) => req(p, { method: "DELETE" }),

  // Companies
  companies: {
    list: () => req("/api/companies"),
    create: (d) => req("/api/companies", { method: "POST", body: JSON.stringify(d) }),
    get: (id) => req(`/api/companies/${id}`),
    update: (id, d) => req(`/api/companies/${id}`, { method: "PUT", body: JSON.stringify(d) }),
    del: (id) => req(`/api/companies/${id}`, { method: "DELETE" }),
  },
  // Content
  content: {
    list: () => req("/api/content"),
    create: (d) => req("/api/content", { method: "POST", body: JSON.stringify(d) }),
    generate: (d) => req("/api/content/generate", { method: "POST", body: JSON.stringify(d) }),
    get: (id) => req(`/api/content/${id}`),
    update: (id, d) => req(`/api/content/${id}`, { method: "PUT", body: JSON.stringify(d) }),
    del: (id) => req(`/api/content/${id}`, { method: "DELETE" }),
  },
  // Outreach
  leads: {
    list: (q) => req(q ? `/api/leads?q=${encodeURIComponent(q)}` : "/api/leads"),
    find: (d) => req("/api/leads/find", { method: "POST", body: JSON.stringify(d) }),
  },
  messages: {
    list: () => req("/api/messages"),
    send: (d) => req("/api/messages", { method: "POST", body: JSON.stringify(d) }),
  },
  replies: {
    list: () => req("/api/replies"),
  },
  // Analytics
  analytics: {
    overview: () => req("/api/analytics/overview"),
    content: () => req("/api/analytics/content"),
    outreach: () => req("/api/analytics/outreach"),
    revenue: () => req("/api/analytics/revenue"),
  },
  // Deal Desk
  clients: {
    list: () => req("/api/clients"),
    create: (d) => req("/api/clients", { method: "POST", body: JSON.stringify(d) }),
  },
  invoices: {
    list: () => req("/api/invoices"),
    create: (d) => req("/api/invoices", { method: "POST", body: JSON.stringify(d) }),
  },
  contracts: {
    list: () => req("/api/contracts"),
    create: (d) => req("/api/contracts", { method: "POST", body: JSON.stringify(d) }),
  },
  // Auth
  auth: {
    login: (d) => req("/api/auth/login", { method: "POST", body: JSON.stringify(d) }),
    verifyCode: (d) => req("/api/auth/verify-code", { method: "POST", body: JSON.stringify(d) }),
    me: () => req("/api/auth/me"),
    logout: () => req("/api/auth/logout", { method: "POST" }),
  },
  // Outcomes
  outcomes: {
    revenue: () => req("/api/outcomes/revenue"),
    views: () => req("/api/outcomes/views"),
    roi: () => req("/api/outcomes/roi"),
    report: (d) => req("/api/outcomes/report", { method: "POST", body: JSON.stringify(d) }),
  },
}
