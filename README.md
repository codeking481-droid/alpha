# 🚀 Alpha Agency — Invisible Operations Dashboard

Premium agency OS for Genesis + Dominion. 5 badges: Command Hub, Content Studio, Outreach Engine, Analytics, Deal Desk. Dark `#0B0215` + Gold `#FFD700` + Glassmorphism. Built on Cloudflare.

**Live stack:** React + Tailwind + Vite → Cloudflare Pages | Hono → Cloudflare Workers | D1 | R2 | Groq via Workers AI

---

## ✨ Badges

| Badge | Route | What It Does |
|-------|-------|--------------|
| 🚀 Command Hub | `/` | Companies, stats, quick actions, activity feed, team |
| ✍️ Content Studio | `/content` | AI Writer (Groq), templates (5), calendar, library |
| 📧 Outreach Engine | `/outreach` | Lead Finder, Message Draft, Campaign Manager, Reply Tracker |
| 📊 Analytics | `/analytics` | KPI cards, line/bar charts, top content, client reports |
| 💰 Deal Desk | `/deals` | Clients, Invoice Builder + Tracker, Contracts, Revenue Chart (MRR) |

Premium UI: `fadeIn`, `slideUp`, `shimmer`, `glass`, gold gradients, `shadow-gold`.

---

## 📁 Structure

```
alphatekx-agency/
├── frontend/ (Vite + React + Tailwind)
│   ├── public/_redirects  (SPA fallback)
│   ├── src/
│   │   ├── components/{dashboard,content,outreach,analytics,dealdesk,ui}
│   │   ├── pages/{Dashboard,ContentStudio,OutreachEngine,Analytics,DealDesk}
│   │   ├── lib/api.js
│   │   └── styles/index.css
│   ├── .env.example
│   └── vite.config.js
├── backend/ (Hono + Workers)
│   ├── src/index.js (all /api/* endpoints)
│   └── wrangler.toml
└── .env (Cloudflare + Groq keys)
```

---

## 🚀 Quick Start (Local)

```bash
# Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173

# Backend (new terminal)
cd backend
npm install
npm run dev          # http://localhost:8787
```

Build check:
```bash
cd frontend && npm run build   # → dist/ (59 modules, ~285kB)
cd backend && npx wrangler deploy --dry-run
```

---

## ☁️ Deploy

### Option A — Cloudflare Dashboard (Recommended)

**Backend (Workers):**
1. `cd backend && npx wrangler login`
2. `npx wrangler deploy` → `https://alphatekx-agency-backend.workers.dev`
3. Set secrets: `npx wrangler secret put GROQ_API_KEY` (paste Groq key)
4. Copy Workers URL

**Frontend (Pages):**
1. Cloudflare Dashboard → Pages → Create project → Connect GitHub `codeking481-droid/alpha`
2. Framework: `Vite` | Build command: `npm run build` | Output: `frontend/dist`
3. Root directory: `frontend`
4. Env var: `VITE_API_URL=https://alphatekx-agency-backend.workers.dev`
5. Deploy → `https://alpha.pages.dev`

> SPA routing is handled by `frontend/public/_redirects` (`/* /index.html 200`).

### Option B — CLI

```bash
# Backend
cd backend
npx wrangler deploy

# Frontend — via Wrangler Pages
cd frontend
npx wrangler pages deploy dist --project-name=alpha
```

### Env

**Backend (`backend/wrangler.toml` vars + secrets):**
- `GROQ_API_KEY` → `npx wrangler secret put GROQ_API_KEY`
- D1: `npx wrangler d1 create alphatekx-db` → paste `database_id` into `wrangler.toml`
- R2: `npx wrangler r2 bucket create alphatekx-storage`

**Frontend (`frontend/.env`):**
```
VITE_API_URL=https://alphatekx-agency-backend.workers.dev
```

---

## 🔌 API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Health + badges |
| `/api/companies` | GET | Companies list |
| `/api/ai/generate` | POST | Content AI (Groq mock) |
| `/api/outreach/leads` | GET | Leads + `?q=` filter |
| `/api/outreach/generate` | POST | Email AI |
| `/api/outreach/campaigns` | GET | Campaigns |
| `/api/outreach/replies` | GET | Replies |
| `/api/outreach/analytics` | GET | Funnel |
| `/api/analytics/overview` | GET | KPI + charts |
| `/api/analytics/report` | POST | PDF/Email mock |
| `/api/deals/clients` | GET | Clients |
| `/api/deals/invoices` | GET/POST | Invoices |
| `/api/deals/revenue` | GET | MRR etc |
| `/api/deals/contracts` | GET/POST | Contracts |

CORS enabled (`hono/cors`). Frontend uses `src/lib/api.js` with `VITE_API_URL`.

---

## ✅ Production Checklist

- [x] `npm run build` passes (59 modules)
- [x] `wrangler deploy --dry-run` passes (71 KiB)
- [x] SPA fallback `public/_redirects`
- [x] CORS, gold/glass premium CSS
- [ ] Set `GROQ_API_KEY` secret
- [ ] Create D1 + R2 if needed
- [ ] Set `VITE_API_URL` on Pages

---

🇳🇬🔥🚀 Built as a $10K/month agency experience.
