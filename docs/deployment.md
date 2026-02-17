# Deployment Guide

## Environment Variables
Use `.env.example` as reference. Required production values:
- `MONGO_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGIN`
- `DOMAIN`
- `LETSENCRYPT_EMAIL`
- `BACKEND_IMAGE`
- `FRONTEND_IMAGE`
- Mail credentials if scheduled email reports are enabled.

## Docker Compose (Production)
1. Build/publish images from CI or local.
2. Set image tags and secrets in `.env`.
3. Run one-command deployment:
   - `bash scripts/deploy.sh`
4. Verify:
   - `curl https://<domain>/api/docs`

## HTTPS Proxy (Caddy)
- Config file: `caddy/Caddyfile`
- Responsibilities:
  - reverse proxy `/api` and `/socket.io`
  - gzip/zstd compression
  - automatic Let's Encrypt certificate issuance and renewal

## PM2 Alternative (Backend)
1. Build backend: `npm run build --workspace backend`
2. Start: `pm2 start ecosystem.config.js`
3. Persist: `pm2 save`

## CI/CD (GitHub Actions)
Workflow: `.github/workflows/ci.yml`
- Install dependencies
- Lint
- Test
- Build
- Build and push Docker images to GHCR on `main`

## Initial Server Setup
1. Install Docker Engine + Docker Compose plugin.
2. Open firewall ports `80` and `443`.
3. Ensure DNS `A` record points `DOMAIN` to server IP.

## Backup and Retention
- Script: `scripts/backup.ps1`
- Example scheduled task:
  - `powershell -ExecutionPolicy Bypass -File .\scripts\backup.ps1 -MongoUri "mongodb://localhost:27017/restaurant_soft" -RetentionDays 14`

## Archival
- Use `ARCHIVE_ORDER_DAYS` env var to define order archival threshold.
- Add scheduled archival job to move old orders into an archive collection for long-term retention.
