# PKGVault

> **Secure community archive for PlayStation PKG files.** Upload, catalog, verify, and distribute game packages with integrity checking, role-based access, and a community-driven forum.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)

---

## What is PKGVault?

PKGVault is a full-stack web application that serves as a **private catalog and distribution platform** for PlayStation PKG (package) files. It combines:

- **PKG Catalog** — Browse, search, and filter game packages with rich metadata (title, version, firmware, region, tags)
- **Source Catalog** — Files are tracked by SHA-256 and linked to moderator-managed sources; first-party R2 storage is optional and currently disabled by default
- **Community Forum** — Threaded discussions, voting, and reputation system
- **Admin Dashboard** — Queue management, source tracking, audit logs, backups, and takedown handling
- **Liquid Glass UI** — Modern glassmorphism design with smooth animations

## Project Structure

```
PKGVault/
├── web/                     # Next.js 15 application (full-stack: frontend + API)
│   ├── app/                 # App Router pages & API routes
│   ├── components/          # React components (UI, layout, liquid glass)
│   ├── db/                  # Database schema, migrations, seeds
│   ├── lib/                 # Shared utilities (auth, db, redis, health checks)
│   ├── scripts/             # Admin & maintenance scripts
│   ├── docker-compose.yml   # Local Postgres + Redis
│   └── package.json         # Dependencies & scripts
├── PKGVault-diseño/         # Design prototypes & wireframes
│   ├── liquid/              # Liquid Glass UI prototypes
│   └── *.jsx                # Screen mockups (login, catalog, admin, etc.)
├── Plans/                   # Project planning documents
├── README.md                # This file
├── CONTRIBUTING.md          # How to contribute
├── SECURITY.md              # Security policy
├── ARCHITECTURE.md          # System architecture deep-dive
└── LICENSE                  # MIT License
```

## Quick Start

### Prerequisites

- **Node.js** >= 20.x
- **Docker** & Docker Compose (for local Postgres + Redis)
- **npm** >= 10.x

### 1. Clone & Install

```bash
git clone https://github.com/c0ncerta/pkgvault.git
cd pkgvault/web
npm install
```

### 2. Start Infrastructure

```bash
docker compose up -d
# Starts PostgreSQL (5432) + Redis (6379)
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with app secrets; R2 is optional and disabled by default
```

### 4. Database Setup

```bash
npm run db:generate   # Generate migration files
npm run db:push       # Apply schema to database
npm run db:seed       # Seed test data
npm run db:create-admin  # Create admin user
```

### 5. Run

```bash
npm run dev
# → http://localhost:3000
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router + Turbopack) |
| **Language** | TypeScript 5.8 (strict mode) |
| **Database** | PostgreSQL 16 + Drizzle ORM |
| **Cache** | Redis 7 (rate limiting) |
| **Auth** | Better-Auth (session + role-based) |
| **Storage** | Moderator-managed external sources; optional Cloudflare R2 support |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Animations** | Framer Motion + Liquid Glass React |
| **Validation** | Zod (runtime schema validation) |
| **Linter** | Biome (lint + format) |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run Biome linter |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format code with Biome |
| `npm run typecheck` | TypeScript type checking |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:push` | Push schema (dev only) |
| `npm run db:studio` | Open Drizzle Studio UI |
| `npm run db:seed` | Seed test data |
| `npm run db:create-admin` | Create admin account |

## Key Features

### User Features
- **Authentication** — Email/password registration with secure sessions
- **PKG Catalog** — Full-text search, filters by platform/version/region
- **PKG Detail Pages** — Metadata, file integrity (SHA-256), download tracking
- **Upload Wizard** — Multi-step metadata submission with SHA-256 duplicate checks
- **User Profiles** — Activity history, uploaded packages, reputation
- **Community Forum** — Threaded discussions with voting system
- **Notifications** — Activity alerts and system notifications

### Admin Features
- **Dashboard** — System overview with key metrics
- **PKG Management** — Approve, edit, and manage all packages
- **Queue Management** — Review pending uploads and moderation queue
- **Source Tracking** — Monitor and verify upload sources
- **Audit Logs** — Complete action history for compliance
- **Backup System** — Automated backups to Google Drive
- **User Management** — Role assignment and user administration
- **Takedown Handling** — DMCA and content removal workflow

### Security Features
- **Role-based Access Control** — User, moderator, admin roles
- **Rate Limiting** — Redis-backed request throttling
- **Filename Obfuscation** — Secure naming helpers for optional backup pipelines
- **Input Validation** — Zod schemas on all API endpoints
- **Session Security** — Better-Auth with database-backed sessions
- **CORS Protection** — Configured trusted origins

## Documentation

- [Architecture](ARCHITECTURE.md) — System design, data flow, deployment
- [Contributing](CONTRIBUTING.md) — How to contribute code and documentation
- [Security Policy](SECURITY.md) — Reporting vulnerabilities
- [Code of Conduct](CODE_OF_CONDUCT.md) — Community guidelines
- [Changelog](CHANGELOG.md) — Release history

## Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Configure `BETTER_AUTH_SECRET` with a cryptographically random 64-char string
3. Set `BETTER_AUTH_URL` to your production domain
4. Configure source providers; R2 credentials are optional
5. Run `npm run build` then `npm run start`
6. Set up reverse proxy (nginx/Caddy) with TLS
7. Enable Redis for rate limiting
8. Configure automated backups

### Docker Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Contact

- **Repository:** [github.com/c0ncerta/pkgvault](https://github.com/c0ncerta/pkgvault)
- **Issues:** [GitHub Issues](https://github.com/c0ncerta/pkgvault/issues)
