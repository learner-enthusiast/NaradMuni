# NaradMuni (Naarad Sabha)

Naarad Sabha is a full-stack real-time conversation and polling platform created by Arnab Samnata. Inspired by the timeless spirit of Narad Muni — the divine messenger carrying thoughts across worlds — the platform transforms modern polling into a living space for voices, perspectives, and shared wisdom.

The experience blends mythology-inspired storytelling with modern realtime technology, allowing creators to build conversations, gather opinions, and watch insights flow live across their Sabha.

## Vision

Naarad Sabha is designed around one core idea:

> Every voice carries meaning.

Instead of feeling like a traditional analytics dashboard or corporate polling tool, the platform feels alive — a digital Sabha where questions travel, communities respond, and conversations evolve in real time.

## What Users Can Do

- Create meaningful polls and conversations
- Share public Sabha links
- Gather responses in real time
- Watch live insights update instantly
- Explore community perspectives
- Publish final outcomes publicly
- Experience a mythology-inspired modern interface

## Creator Journey

1. Enter your Sabha.
2. Create a question for the community.
3. Share your public conversation link.
4. Watch voices gather in real time.
5. Observe live insights and trends.
6. Publish the final wisdom of the Sabha.

## Technology Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 19, Vite, TypeScript, Zustand, Tailwind CSS, Clerk, Socket.IO Client |
| Backend | Node.js, Express, PostgreSQL, Drizzle ORM, Socket.IO, Zod |
| Auth | Clerk |
| Media | Cloudinary |
| Production hosting | Home server (Docker Compose) |
| Off-site backup | Neon Postgres (daily sync, not primary DB) |

## Repository Layout

```
NaradMuni/
├── client/                 # React SPA (Vite)
├── server/                 # Express API + Socket.IO
├── docker/                 # Dockerfiles, nginx config, backup scripts
├── docker-compose.deploy.yml   # Production stack for home server
└── .github/workflows/
    └── home-server.yml     # Build + deploy pipeline
```

---

## Production Architecture (Home Server)

Production runs as four Docker containers on a home server, orchestrated by Docker Compose:

```
                    ┌─────────────────────────────────────┐
  Internet          │           Home Server               │
      │             │                                     │
      ▼             │  ┌─────────┐                        │
 Cloudflare    ────┼─►│   web   │ nginx :8080 (public)   │
 Tunnel / DNS       │  │ (React) │                        │
                    │  └────┬────┘                        │
                    │       │ /api, /socket.io, /health   │
                    │  ┌────▼────┐                        │
                    │  │   api   │ Express + Socket.IO    │
                    │  └────┬────┘                        │
                    │       │                             │
                    │  ┌────▼────┐     ┌──────────┐       │
                    │  │ postgres│     │  backup  │       │
                    │  │ (local) │◄────│ (daily)  │───┐   │
                    │  └─────────┘     └──────────┘   │   │
                    │       ▲              pgdata      │   │
                    │       │              volume      │   │
                    └───────┼──────────────────────────┼───┘
                            │                          │
                            │                   daily pg_dump
                            │                          ▼
                            │                   ┌─────────────┐
                            │                   │ Neon (cloud)│
                            │                   │ backup only │
                            └───────────────────┴─────────────┘
```

### Service roles

| Service | Image | Purpose |
|---------|-------|---------|
| **postgres** | `postgres:17-alpine` | Primary database. Data persists in the `pgdata` Docker volume. Not exposed to the internet. |
| **api** | `ghcr.io/<owner>/naradmuni-api` | REST API, Socket.IO, Clerk auth, Drizzle migrations on startup. |
| **web** | `ghcr.io/<owner>/naradmuni-web` | Static React app + nginx reverse proxy to the API. |
| **backup** | `postgres:17-alpine` | Once daily, dumps local Postgres and restores to Neon. Retries on failure. |

### Request routing (nginx in `web`)

| Path | Destination |
|------|-------------|
| `/` | React SPA (client-side routing) |
| `/api/*` | `api:3000` |
| `/socket.io/*` | `api:3000` (WebSocket upgrade) |
| `/health` | `api:3000` |

The frontend is built with an empty `VITE_API_URL` so all API calls use same-origin paths through nginx.

---

## Deployment Strategy

This project uses a **push-to-deploy** pipeline: merge to `main` → GitHub Actions builds Docker images → images are transferred to the home server over SSH → Compose restarts containers.

### Why this approach?

| Decision | Reason |
|----------|--------|
| **Home server as primary host** | Full control, no frontend/backend hosting fees for the main app. |
| **Local Postgres as primary DB** | Low latency, no Neon connection timeouts from Docker, data stays on your machine. |
| **Neon for backup only** | Off-site disaster recovery without depending on Neon for live traffic. |
| **GHCR + SSH image transfer** | Home server networks often cannot reliably pull from `ghcr.io`. CI pulls images and `docker save \| scp \| docker load` avoids that. |
| **Cloudflare Access SSH** | Home server has no public SSH port; `cloudflared access ssh` tunnels deploy traffic securely. |
| **Separate api + web images** | Frontend env vars (`VITE_*`) are baked at build time; backend secrets stay in the server `.env`. |

### Deploy flow (`.github/workflows/home-server.yml`)

1. **Build** — Docker images for `naradmuni-api` and `naradmuni-web` are built and pushed to GitHub Container Registry (GHCR).
2. **Configure SSH** — GitHub Actions connects to the home server via Cloudflare Access SSH (`cloudflared`).
3. **Upload config** — `docker-compose.deploy.yml`, backup scripts, and a generated `.env` file are copied to `DEPLOY_PATH` on the server.
4. **Transfer images** — CI pulls images from GHCR, compresses them, SCPs to the server, and runs `docker load`.
5. **Restart** — `docker compose up -d --remove-orphans` recreates containers.
6. **Health check** — Verifies web (`/`) and API (`/health`) respond on `127.0.0.1:WEB_PORT`.

---

## GitHub Actions Secrets

Configure these in **GitHub → Repository → Settings → Secrets and variables → Actions**.

### Required secrets

| Secret | Description | Example |
|--------|-------------|---------|
| `SSH_HOST` | Hostname used by Cloudflare Access SSH | `ssh.example.com` |
| `SSH_USER` | Linux user on the home server | `deploy` |
| `SSH_PRIVATE_KEY` | Private key for SSH (PEM, full contents) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DEPLOY_PATH` | Directory on the server for compose + `.env` | `/home/deploy/naradmuni` |
| `CF_SERVICE_TOKEN_ID` | Cloudflare Access service token ID | |
| `CF_SERVICE_TOKEN_SECRET` | Cloudflare Access service token secret | |
| `POSTGRES_PASSWORD` | Password for the **local** Postgres container | strong random string |
| `CLIENT_URL` | Public URL of the app (CORS + Clerk + poll links) | `https://sabha.example.com` |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key (also baked into web build) | `pk_live_...` |
| `CLERK_SECRET_KEY` | Clerk secret key (API only) | `sk_live_...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | |
| `CLOUDINARY_API_KEY` | Cloudinary API key | |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | |
| `CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset | |
| `NEON_DATABASE_URL` | Neon Postgres URL for **daily backups only** | `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require` |

### Optional secrets

| Secret | Default | Description |
|--------|---------|-------------|
| `POSTGRES_USER` | `naradmuni` | Local Postgres username |
| `POSTGRES_DB` | `naradmuni` | Local Postgres database name |
| `WEB_PORT` | `8080` | Host port mapped to nginx |
| `BACKEND_URL` | *(empty)* | `VITE_API_URL` at web build time. Leave empty for same-origin `/api`. |
| `ADMIN_EMAILS` | *(empty)* | Comma-separated admin emails |
| `BACKUP_HOUR` | `3` | UTC hour for daily Neon backup (0–23) |

### Secrets you can remove (if present from older setups)

| Secret | Why remove |
|--------|------------|
| `DATABASE_URL` | Replaced by local Postgres via `POSTGRES_PASSWORD`. Compose builds `DATABASE_URL` internally. |
| `GHCR_TOKEN` | No longer needed. Images are transferred over SSH, not pulled on the server. |

### What changed vs. a Neon-primary setup?

```
Before                          Now
──────────────────────────────────────────────────────
DATABASE_URL → Neon (live)      POSTGRES_PASSWORD → local Postgres (live)
                                NEON_DATABASE_URL → Neon (backup only)
GHCR_TOKEN (server pull)        (removed — SSH transfer)
```

---

## One-Time Home Server Setup

1. **Install Docker** and the **Docker Compose plugin**.
2. **Create a deploy user** (or use an existing one) with Docker permissions.
3. **Set up SSH key auth** — add the public key matching `SSH_PRIVATE_KEY` to `~/.ssh/authorized_keys`.
4. **Configure Cloudflare Access SSH** for the hostname in `SSH_HOST`.
5. **Point your domain** — Cloudflare Tunnel or reverse proxy should forward HTTPS traffic to `http://127.0.0.1:8080` (or your `WEB_PORT`).
6. **Add all GitHub secrets** listed above.
7. **Push to `main`** or manually trigger the **Build and Deploy** workflow.

### Clerk configuration

In the Clerk dashboard, allow these origins:

- Your `CLIENT_URL` (e.g. `https://sabha.example.com`)
- Any preview/staging URLs you use

### Neon configuration (backup)

- Create a Neon project/database used **only for backups**.
- Use the **pooler** connection string (`-pooler` in the hostname).
- Append `?sslmode=require` if not already present.
- The backup container resolves IPv4 explicitly to avoid Docker IPv6 issues with Neon.

---

## Daily Backup Behavior

The `backup` container syncs local Postgres → Neon once per day:

1. Waits until `BACKUP_HOUR` UTC (default **03:00**).
2. Attempts backup up to **5 times** (60 seconds apart).
3. If all 5 fail, waits **1 hour** and tries another batch of 5.
4. Repeats hourly batches until one succeeds.
5. After success, waits until the next day's scheduled time.

### Manual backup test

```bash
cd $DEPLOY_PATH
docker compose -f docker-compose.deploy.yml --env-file .env exec backup /usr/local/bin/backup-to-neon.sh
```

### View backup logs

```bash
docker compose -f docker-compose.deploy.yml --env-file .env logs backup --follow
```

---

## Local Development

### Server

```bash
cd server
cp .env.example .env        # fill in values
docker compose up -d        # starts local Postgres on port 5435
npm install
npm run db:migrate
npm run dev
```

### Client

```bash
cd client
cp .env.example .env        # VITE_CLERK_PUBLISHABLE_KEY, VITE_API_URL=http://localhost:3000
npm install
npm run dev
```

---

## Useful Server Commands

```bash
cd $DEPLOY_PATH

# Container status
docker compose -f docker-compose.deploy.yml --env-file .env ps

# API logs
docker compose -f docker-compose.deploy.yml --env-file .env logs api --tail 100

# Restart everything
docker compose -f docker-compose.deploy.yml --env-file .env up -d --remove-orphans

# Local health check
curl http://127.0.0.1:8080/
curl http://127.0.0.1:8080/health
```

---

## Realtime Flow

When someone shares their thoughts:

- Responses are stored instantly in local Postgres
- Analytics recalculate automatically
- Dashboards update live through Socket.IO
- Creators witness the pulse of the Sabha in real time

---

## Built By

Created and designed by **Arnab Samnata**.

Inspired by Narad Muni, shared wisdom, living conversations, timeless storytelling, and modern realtime experiences.
