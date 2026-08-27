// Real data layer — localStorage first, API (D1) when ready
// All badges use this. When Workers D1 is live, swap fetch to /api/*

import { API_URL } from "./api.js"

const LS_KEYS = {
  companies: "alpha.companies",
  content: "alpha.content",
  campaigns: "alpha.campaigns",
  invoices: "alpha.invoices",
  contracts: "alpha.contracts",
}

export const store = {
  // Companies — real CRUD
  async getCompanies() {
    try {
      const r = await fetch(`${API_URL}/api/deals/clients`, { signal: AbortSignal.timeout(800) })
      if (r.ok) return await r.json()
    } catch {}
    try {
      const raw = localStorage.getItem(LS_KEYS.companies)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  },
  saveCompanies(list) {
    localStorage.setItem(LS_KEYS.companies, JSON.stringify(list))
  },
  // Content
  async getContent() {
    try {
      const raw = localStorage.getItem(LS_KEYS.content)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  },
  saveContent(list) { localStorage.setItem(LS_KEYS.content, JSON.stringify(list)) },
  // Campaigns
  async getCampaigns() {
    try { const raw = localStorage.getItem(LS_KEYS.campaigns); return raw ? JSON.parse(raw) : [] } catch { return [] }
  },
  saveCampaigns(list) { localStorage.setItem(LS_KEYS.campaigns, JSON.stringify(list)) },
  // Invoices
  async getInvoices() {
    try { const raw = localStorage.getItem(LS_KEYS.invoices); return raw ? JSON.parse(raw) : [] } catch { return [] }
  },
  saveInvoices(list) { localStorage.setItem(LS_KEYS.invoices, JSON.stringify(list)) },
  // Contracts
  async getContracts() {
    try { const raw = localStorage.getItem(LS_KEYS.contracts); return raw ? JSON.parse(raw) : [] } catch { return [] }
  },
  saveContracts(list) { localStorage.setItem(LS_KEYS.contracts, JSON.stringify(list)) },
}
