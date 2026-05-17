# Changelog

All notable changes to PKGVault will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with Next.js 15 + TypeScript
- Authentication system with Better-Auth (email/password)
- Role-based access control (user, moderator, admin)
- PKG catalog with full-text search and filtering
- PKG upload wizard with SHA-256 integrity verification
- Cloudflare R2 storage integration with presigned URLs
- Community forum with threaded discussions and voting
- Admin dashboard with queue management and audit logs
- Source tracking and verification system
- Backup system with Google Drive integration
- Takedown handling workflow
- Liquid Glass UI with glassmorphism design
- Framer Motion animations
- Rate limiting with Redis
- Filename obfuscation for secure storage
- User profiles with activity history
- Notification system
- Docker Compose setup for local development (PostgreSQL + Redis)
- Drizzle ORM with PostgreSQL
- Zod validation on all API endpoints
- Biome linting and formatting

### Changed
### Deprecated
### Removed
### Fixed
### Security

---

## Version History

### v0.1.0 — 2025-XX-XX

Initial development release.

- Core application structure
- Database schema and migrations
- Authentication and authorization
- Basic PKG CRUD operations
- File upload and download
- Admin panel foundation
- Forum system
- Liquid Glass UI components

[Unreleased]: https://github.com/c0ncerta/pkgvault/compare/main...HEAD
