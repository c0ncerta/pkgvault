# PKGVault Architecture

## System Overview

PKGVault is a full-stack web application built with Next.js 15, serving as a secure community archive for PlayStation PKG files. The system combines a public-facing catalog with an admin-controlled moderation pipeline.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  Next.js SSR/CSR + React + Tailwind CSS + Framer Motion     │
└──────────────┬──────────────────────────────┬───────────────┘
               │ HTTPS                        │ HTTPS
               ▼                              ▼
┌──────────────────────────┐    ┌─────────────────────────────┐
│   Next.js App Router     │    │   Better-Auth               │
│   (Pages + API Routes)   │◄──►│   (Session Management)      │
│                          │    │   + Redis Sessions          │
└──────┬───────────────────┘    └─────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐ │
│  │ PKG Svc  │ │ Forum Svc│ │ Admin Svc│ │ Upload Wizard  │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐ │
│  │ Auth Svc │ │ Rate Lim │ │ Backup   │ │ Takedown Svc   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘ │
└──────┬──────────────────────────────┬───────────────────────┘
       │                              │
       ▼                              ▼
┌──────────────────┐          ┌──────────────────┐
│   PostgreSQL 16  │          │   Redis 7        │
│   (Primary DB)   │          │   (Cache/Sessions│
│   Drizzle ORM    │          │    Rate Limiting)│
└──────────────────┘          └──────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare R2 Storage                     │
│  PKG files with SHA-256 obfuscated filenames                 │
│  Presigned URLs for secure downloads                         │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### Core Tables

```
users
├── id (uuid, PK)
├── email (unique)
├── name
├── password_hash
├── role (user | moderator | admin)
├── created_at
└── updated_at

pkgs
├── id (uuid, PK)
├── title
├── description
├── version
├── platform
├── firmware_min
├── region
├── file_size
├── sha256_hash
├── obfuscated_filename
├── r2_key
├── status (pending | approved | rejected | takedown)
├── uploader_id (FK -> users)
├── download_count
├── seeder_count
├── created_at
└── updated_at

pkg_files
├── id (uuid, PK)
├── pkg_id (FK -> pkgs)
├── filename
├── file_size
├── mime_type
└── created_at

sources
├── id (uuid, PK)
├── url
├── name
├── status (active | inactive | flagged)
├── last_checked
└── created_at

forum_threads
├── id (uuid, PK)
├── title
├── content
├── author_id (FK -> users)
├── pkg_id (FK -> pkgs, nullable)
├── upvotes
├── downvotes
├── created_at
└── updated_at

forum_replies
├── id (uuid, PK)
├── thread_id (FK -> forum_threads)
├── author_id (FK -> users)
├── content
├── upvotes
├── downvotes
├── created_at
└── updated_at

votes
├── id (uuid, PK)
├── user_id (FK -> users)
├── thread_id (FK -> forum_threads, nullable)
├── reply_id (FK -> forum_replies, nullable)
├── vote_type (up | down)
└── created_at

takedowns
├── id (uuid, PK)
├── pkg_id (FK -> pkgs)
├── reason
├── status (pending | processed | rejected)
├── reported_by (FK -> users)
├── created_at
└── resolved_at

audit_logs
├── id (uuid, PK)
├── user_id (FK -> users)
├── action
├── entity_type
├── entity_id
├── details (jsonb)
└── created_at
```

## Authentication Flow

```
1. User submits credentials → /api/auth/[...all]
2. Better-Auth validates against PostgreSQL
3. Session created in Redis (TTL: configurable)
4. Session cookie set (httpOnly, secure, sameSite)
5. middleware.ts validates session on protected routes
6. Role-based access check (user/moderator/admin)
```

## File Upload Flow

```
1. User initiates upload → Upload Wizard
2. Client validates file (size, extension)
3. Server generates SHA-256 hash of file
4. Filename obfuscated via SHA-256
5. File uploaded to Cloudflare R2
6. Metadata saved to PostgreSQL
7. PKG status set to "pending" (awaiting review)
8. Admin reviews → approves/rejects
```

## Security Architecture

### Defense in Depth

| Layer | Protection |
|-------|-----------|
| **Network** | HTTPS only, CORS configuration |
| **Application** | Zod input validation, rate limiting |
| **Authentication** | Better-Auth, bcrypt hashing, Redis sessions |
| **Authorization** | Role-based middleware, route protection |
| **Data** | Parameterized queries (Drizzle), input sanitization |
| **Storage** | Filename obfuscation, presigned URLs, SHA-256 verification |
| **Infrastructure** | Docker isolation, health checks, backup system |

### Rate Limiting

- Redis-backed token bucket algorithm
- Configurable per-endpoint limits
- Sliding window for burst protection

## Deployment Architecture

### Development

```
localhost:3000  → Next.js dev server (Turbopack)
localhost:5432  → PostgreSQL (Docker)
localhost:6379  → Redis (Docker)
```

### Production (Recommended)

```
                    ┌─────────────┐
                    │   Caddy /   │
                    │   Nginx     │
                    │   (TLS)     │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Next.js  │ │ Next.js  │ │ Next.js  │
        │ Instance │ │ Instance │ │ Instance │
        └────┬─────┘ └────┬─────┘ └────┬─────┘
             │             │             │
             └─────────────┼─────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ PostgreSQL│ │  Redis   │ │  Cloud   │
        │ (Managed) │ │(Managed) │ │  flare R2 │
        └──────────┘ └──────────┘ └──────────┘
```

## Design System

### Liquid Glass UI

The application uses a glassmorphism design language:

- **Surfaces**: Translucent panels with backdrop blur
- **Ambient orbs**: Animated gradient backgrounds
- **Transitions**: Framer Motion for smooth page transitions
- **Components**: Glass cards, liquid buttons, theme toggle

### Color Palette

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| Background | `#F8FAFC` | `#0B0F19` |
| Surface | `#FFFFFF` | `#121A2A` |
| Primary | `#1DB954` | `#1DB954` |
| Text | `#1E293B` | `#E6EAF2` |
| Error | `#FF4D4F` | `#FF4D4F` |

## API Endpoints

### Public
- `GET /api/pkg` — List packages (with search/filter)
- `GET /api/pkg/[id]` — Get package details
- `GET /api/pkg/[id]/download` — Generate presigned download URL
- `POST /api/pkg/confirm` — Confirm download integrity

### Authenticated
- `GET /api/user/me` — Current user profile
- `GET /api/user/[id]/pkgs` — User's packages
- `POST /api/forum` — Create forum thread
- `POST /api/forum/vote` — Vote on thread/reply

### Admin
- `GET /api/admin/pkgs` — List all packages
- `POST /api/admin/pkgs/[id]/backup` — Backup package to GDrive
- `GET /api/admin/queue` — Moderation queue
- `GET /api/admin/audit` — Audit log
- `GET /api/admin/sources` — Source management
- `GET /api/admin/reports` — Takedown reports
- `GET /api/admin/backup-candidates` — Backup candidates

### Cron
- `GET /api/cron/health-check` — System health check
