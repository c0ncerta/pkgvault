# PKGVault Backend

> Next.js 15 + TypeScript + App Router backend for the PKGVault community PKG file archive.

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router + Turbopack) |
| Language | TypeScript (strict mode) |
| ORM | Drizzle ORM |
| Database | PostgreSQL 16 |
| Cache | Redis 7 rate limiting |
| Auth | Better-Auth |
| Storage | Moderator-managed external sources; optional Cloudflare R2 support |
| Linter/Formatter | Biome |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animations | Framer Motion + Liquid Glass React |
| Fonts | Geist + Geist Mono |

## Quick Start

```bash
# 1. Start local services
docker compose up -d

# 2. Install dependencies
npm install

# 3. Copy env and configure
cp .env.example .env

# 4. Generate & run migrations
npm run db:generate
npm run db:push

# 5. Seed test data
npm run db:seed

# 6. Start dev server
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run Biome linter |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format with Biome |
| `npm run typecheck` | TypeScript type check |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:push` | Push schema directly (dev) |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed test data |
| `npm run db:create-admin` | Create admin user |

## Project Structure

```
backend/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth pages (login, register)
│   ├── (dashboard)/        # User dashboard (profile, settings, notifications)
│   ├── admin/              # Admin panel
│   │   ├── pkgs/           # PKG management (list, edit, status control)
│   │   ├── queue/          # Moderation queue
│   │   ├── sources/        # Source tracking & health
│   │   ├── audit/          # Audit logs
│   │   └── backups/        # Backup management
│   ├── api/                # API routes
│   │   ├── auth/[...all]/  # Better-Auth handler
│   │   ├── pkg/            # PKG metadata endpoints (CRUD, download, confirm legacy uploads)
│   │   ├── forum/          # Forum endpoints (threads, replies, voting)
│   │   ├── admin/          # Admin endpoints (backup, queue, audit, sources)
│   │   ├── user/           # User profile endpoints
│   │   └── cron/           # Scheduled tasks (health checks)
│   ├── catalog/            # PKG catalog with search & filters
│   ├── forum/              # Community forum
│   ├── upload/             # PKG upload wizard
│   ├── api-docs/           # API documentation
│   ├── layout.tsx          # Root layout
│   ├── template.tsx        # Framer Motion route transitions
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles + liquid glass CSS
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── liquid-button.tsx  # iOS spring animations
│   │   ├── logo.tsx           # SVG vault mark
│   │   ├── icons.tsx          # SVG icon set
│   │   └── ...
│   ├── liquid/             # Liquid Glass UI system
│   │   ├── liquid-glass-surface.tsx
│   │   ├── liquid-glass-enhancer.tsx
│   │   ├── ambient-orbs.tsx     # 6 animated gradient orbs
│   │   ├── glass.tsx
│   │   └── pkg-cover.tsx
│   ├── motion/             # Framer Motion transitions
│   ├── layout/             # Navbar, footer
│   ├── home/               # Landing page sections
│   └── forum/              # Forum components
├── db/
│   ├── schema/             # Drizzle schema definitions
│   ├── migrations/         # SQL migrations
│   ├── seed.ts             # Test data seeder
│   └── create-admin.ts     # Admin user creation script
├── lib/
│   ├── auth.ts             # Better-Auth server config
│   ├── auth-client.ts      # Better-Auth React client
│   ├── db.ts               # Drizzle client instance
│   ├── redis.ts            # Redis client
│   ├── r2.ts               # Optional Cloudflare R2 client
│   ├── gdrive.ts           # Google Drive integration
│   ├── rate-limit.ts       # Redis-backed rate limiting
│   ├── health-check.ts     # Source health monitoring
│   ├── filename-obfuscator.ts  # Dict mangling + FNV-1a salt
│   ├── session.ts          # Session utilities
│   ├── utils.ts            # Shared utilities
│   └── validations/        # Zod validation schemas
├── scripts/
│   ├── obfuscate-name.ts   # Filename obfuscation CLI
│   ├── test-db.ts          # Database connection test
│   ├── migrate-sources.ts  # Source migration script
│   ├── backup-to-gdrive.sh # GDrive backup pipeline
│   └── backup-batch.sh     # Batch backup with rate limiting
├── middleware.ts            # Auth + role-based route protection
├── docker-compose.yml       # Local Postgres + Redis
├── drizzle.config.ts        # Drizzle Kit config
└── biome.json               # Biome linter config
```

## Key Features

### Liquid Glass UI
- **Ambient Orbs**: 6 animated gradient orbs (purple/violet/white/cyan/pink/amber) with drift animations (48-80s cycles)
- **Glass Surfaces**: Backdrop blur panels with HSL gradient covers
- **iOS Spring Animations**: Framer Motion with stiffness 480, damping 22, mass 0.6
- **Route Transitions**: Fade + blur transitions between pages
- **Scroll Animations**: InViewFade triggers on home sections
- **Reduced Motion**: Respects `prefers-reduced-motion`
- **Theme Toggle**: Light/dark mode with full color palette

### Caching Strategy
All home page queries use `unstable_cache` with tags and revalidation:
- `HomeFeaturedPkgs`: top 6 packages, 60s cache
- `HomeStats`: 6 real metrics, 300s cache
- `ActivityFeed`: 30s cache
- `Leaderboard`: 300s cache
- `TrendingTags`: 300s cache
- `ForumStrip`: 30s cache

### Admin Panel
- **PKG Management**: Status control (segmented pill), source management
- **Queue**: Moderation queue for pending uploads
- **Sources**: Health monitoring with auto-dead detection (5 consecutive failures)
- **Audit**: Complete action history
- **Backups**: GDrive backup candidates and management

### Backup Infrastructure
- **Filename Obfuscation**: Dictionary mangling + adjacent-pair swap + FNV-1a salt
- **GDrive Pipeline**: aria2c download → SHA-256 verify → zip wrap → rclone upload with rate limits (8MB/s, 4 TPS)
- **Batch Mode**: Jitter sleep (15-60min), daily cap (8), quiet hours (UTC 02-07), persistent state file

### Security
- **Role-based Access Control**: user, moderator, admin
- **Rate Limiting**: Redis-backed sliding window limiter
- **Filename Obfuscation**: Secure naming helpers for optional backup pipelines
- **Input Validation**: Zod schemas on all API endpoints
- **Session Security**: Better-Auth with database-backed sessions

### Current Storage Mode

The default production workflow is metadata-only: users submit package metadata,
file size, and a lowercase SHA-256 checksum. The binary is not uploaded to this
app while no NAS/R2 storage is available. Moderators approve entries and attach
public download sources from the admin panel. Cloudflare R2 code remains for a
future first-party storage mode, but credentials are optional in `.env`.

## Deployment

See the root [README.md](../README.md) for deployment instructions.
