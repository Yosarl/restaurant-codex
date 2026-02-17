# Restaurant Inventory, POS & Accounting

Production-oriented MERN monorepo for multi-outlet restaurant operations with inventory lifecycle, POS, purchasing, and double-entry accounting.

## Tech Stack
- Frontend: React + Vite + TypeScript + Tailwind CSS + Zustand + PWA
- Backend: Node.js + Express + TypeScript + JWT + RBAC + Zod validation
- Database: MongoDB + Mongoose
- Real-time: Socket.IO (`order:created`, `order:updated`, `kot:print`, `stock:changed`)
- Printing: PDF receipt endpoint + kitchen print queue events
- Infra: Docker, Docker Compose, Nginx, PM2
- CI: GitHub Actions (lint, test, build, docker image build)

## Monorepo Tree
```text
.
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- seed/
|   |   |-- services/
|   |   |-- validators/
|   |-- tests/
|   |-- Dockerfile
|-- frontend/
|   |-- src/
|   |   |-- app/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- store/
|   |-- cypress/
|   |-- Dockerfile
|-- docs/
|   |-- openapi.json
|   |-- api-contracts.md
|   |-- deployment.md
|   |-- er-diagram.md
|-- nginx/nginx.conf
|-- scripts/backup.ps1
|-- docker-compose.yml
|-- docker-compose.prod.yml
```

## Core Delivered Features
- Multi-outlet architecture (`outletId` scoped data).
- Inventory lifecycle: opening stock, receive, adjustment, transfers, valuation, ageing.
- Recipe/BOM-based stock consumption on POS settlement (FIFO/LIFO).
- Purchase flows: PO, invoice, returns with stock + accounting impact.
- POS workflows: create/hold/recall/settle/return, KOT socket event, print queue.
- Accounting automation: sales, COGS, purchases, stock adjustment journals + ledger entries.
- Reports: sales, stock valuation, P&L, VAT.
- Audit logging for inventory/accounting-sensitive actions.
- Offline-capable POS queue (IndexedDB) with online sync hook.

## POS Keyboard Shortcuts
- `1`..`9`: category quick switch (mapped in UI)
- `F1`: recent/held bills panel (can be mapped to recall list)
- `F2`: hold current order
- `F3`: recall held order
- `Enter`: open settle modal

## POS Acceptance Targets
- Tile rendering target: 120 product tiles under 300ms.
- Search target: in-memory search under 100ms for typical session catalog.

## Security Practices
- Helmet headers, CORS restrictions, request rate-limits.
- JWT access + refresh tokens.
- bcrypt password hashing.
- Zod validation on write endpoints.
- Audit logs for destructive/financial actions.
- CSRF token endpoint for browser session workflows.

## Setup (Local)
1. Copy `.env.example` to `.env`.
2. Install deps:
   - `npm install`
3. Start backend:
   - `npm run dev --workspace backend`
4. Start frontend:
   - `npm run dev --workspace frontend`

## Setup (Docker)
1. Copy `.env.example` to `.env`.
2. `docker compose up --build -d`
3. Frontend: `http://localhost:5173`
4. API: `http://localhost:5000`
5. Swagger docs: `http://localhost:5000/api/docs`

## Seed Data
- Source: `backend/src/seed/seed.json`
- Command: `npm run seed`
- Includes: `3 outlets`, `5 users`, `8 suppliers`, `20 products`, `10 opening batches`, `3 purchase orders`, `5 sales orders`, COA records.

## Testing
- Backend unit/integration: `npm run test --workspace backend`
- Frontend unit: `npm run test --workspace frontend`
- Frontend e2e: `npm run test:e2e --workspace frontend`

## Documentation
- OpenAPI: `docs/openapi.json`
- API Contracts with samples: `docs/api-contracts.md`
- ER diagram: `docs/er-diagram.md`
- Deployment guide: `docs/deployment.md`

## Deployment
- Docker production (one command): `bash scripts/deploy.sh`
- PM2 alternative: `pm2 start ecosystem.config.js`
- HTTPS reverse proxy (auto TLS): `caddy/Caddyfile`

## Render Deployment
- Blueprint file: `render.yaml`
- Deploy with Render Blueprint to create:
  - `restaurant-backend` (Node web service)
  - `restaurant-frontend` (Static site)
- Required backend envs on Render:
  - `MONGO_URI` (use MongoDB Atlas or external Mongo, not `mongo` hostname)
  - `JWT_ACCESS_SECRET`
  - `JWT_REFRESH_SECRET`
  - `CORS_ORIGIN` (set to your Render frontend URL)

## Backup & Retention
- Daily DB backup script: `scripts/backup.ps1`
- Configurable retention in script parameter (`RetentionDays`).
