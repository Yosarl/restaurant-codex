# Deployment Guide

## Environment Variables
Use `.env.example` as reference. Required production values:
- `MONGO_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGIN`
- Mail credentials if scheduled email reports are enabled.

## Docker Compose (Production)
1. Build/publish images from CI or local.
2. Update `docker-compose.prod.yml` image tags.
3. Configure `.env` with production secrets.
4. Start stack:
   - `docker compose -f docker-compose.prod.yml up -d`
5. Verify:
   - `curl http://<host>/health`

## Nginx
- Config file: `nginx/nginx.conf`
- Responsibilities:
  - reverse proxy `/api` and `/socket.io`
  - gzip compression
  - static caching hints
- For HTTPS: terminate TLS at Nginx and redirect HTTP -> HTTPS.

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

## Backup and Retention
- Script: `scripts/backup.ps1`
- Example scheduled task:
  - `powershell -ExecutionPolicy Bypass -File .\scripts\backup.ps1 -MongoUri "mongodb://localhost:27017/restaurant_soft" -RetentionDays 14`

## Archival
- Use `ARCHIVE_ORDER_DAYS` env var to define order archival threshold.
- Add scheduled archival job to move old orders into an archive collection for long-term retention.
