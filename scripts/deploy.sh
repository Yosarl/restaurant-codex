#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "[error] docker is not installed"
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "[error] docker compose plugin is not installed"
  exit 1
fi

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "[error] .env was missing. A template has been created at .env."
  echo "[error] Set DOMAIN, LETSENCRYPT_EMAIL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, then run again."
  exit 1
fi

# shellcheck disable=SC1091
source .env

required=(DOMAIN LETSENCRYPT_EMAIL JWT_ACCESS_SECRET JWT_REFRESH_SECRET)
for v in "${required[@]}"; do
  if [[ -z "${!v:-}" ]]; then
    echo "[error] Missing required env var: $v"
    exit 1
  fi
done

if [[ "${DOMAIN}" == "app.example.com" ]]; then
  echo "[error] DOMAIN is still placeholder (app.example.com). Set real domain in .env"
  exit 1
fi

if [[ "${LETSENCRYPT_EMAIL}" == "ops@example.com" ]]; then
  echo "[error] LETSENCRYPT_EMAIL is still placeholder (ops@example.com). Set real email in .env"
  exit 1
fi

echo "[info] Pulling images..."
docker compose -f docker-compose.prod.yml pull

echo "[info] Starting stack..."
docker compose -f docker-compose.prod.yml up -d --remove-orphans

echo "[info] Waiting for services..."
sleep 4

echo "[info] Current status:"
docker compose -f docker-compose.prod.yml ps

echo "[info] Deployed."
echo "[info] App URL: https://${DOMAIN}"
