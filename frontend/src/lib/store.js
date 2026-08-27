// Real store — API first, localStorage fallback (offline)
// When SUPABASE is live, API is Supabase. When not, API is in-memory Workers. Both persist.
import { api, API_URL } from "./api.js"

const LS_KEYS = {
  companies: "alpha.companies",
  content: "alpha.content",
  campaigns: "alpha.campaigns",
  invoices: "alpha.invoices",
  contracts: "alpha.contracts",
}

function lsGet(key) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : [] } catch { return [] }
}
function lsSet(key, v) {
  try { localStorage.setItem(key, JSON.stringify(v)) } catch {}
}

export const store = {
  // Companies — real API, fallback to localStorage
  async getCompanies() {
    try {
      const data = await api.companies.list()
      if (Array.isArray(data)) { lsSet(LS_KEYS.companies, data); return data }
    } catch {}
    // Fallback: try legacy /api/deals/clients then localStorage
    try {
      const data = await api.get("/api/companies")
      if (Array.isArray(data)) return data
    } catch {}
    return lsGet(LS_KEYS.companies)
  },
  async createCompany(data) {
    try {
      const created = await api.companies.create(data)
      // keep localStorage in sync
      const list = lsGet(LS_KEYS.companies)
      lsSet(LS_KEYS.companies, [created, ...list])
      return created
    } catch {
      const list = lsGet(LS_KEYS.companies)
      const item = { id: Date.now(), ...data }
      lsSet(LS_KEYS.companies, [item, ...list])
      return item
    }
  },
  saveCompanies(list) { lsSet(LS_KEYS.companies, list) },

  // Content — real API
  async getContent() {
    try {
      const data = await api.content.list()
      if (Array.isArray(data)) { lsSet(LS_KEYS.content, data); return data }
    } catch {}
    return lsGet(LS_KEYS.content)
  },
  saveContent(list) { lsSet(LS_KEYS.content, list) },
  async generateContent(payload) {
    try { return await api.content.generate(payload) } catch (e) { throw e }
  },

  // Campaigns (leads)
  async getCampaigns() { return lsGet(LS_KEYS.campaigns) },
  saveCampaigns(list) { lsSet(LS_KEYS.campaigns, list) },

  // Invoices
  async getInvoices() {
    try {
      const data = await api.invoices.list()
      if (Array.isArray(data)) { lsSet(LS_KEYS.invoices, data); return data }
    } catch {}
    return lsGet(LS_KEYS.invoices)
  },
  saveInvoices(list) { lsSet(LS_KEYS.invoices, list) },

  // Contracts
  async getContracts() {
    try {
      const data = await api.contracts.list()
      if (Array.isArray(data)) { lsSet(LS_KEYS.contracts, data); return data }
    } catch {}
    return lsGet(LS_KEYS.contracts)
  },
  saveContracts(list) { lsSet(LS_KEYS.contracts, list) },

  // Generic
  api, API_URL,
}
