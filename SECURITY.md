# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| `main` (development) | ✅ |
| Latest release | ✅ |
| Older releases | ❌ |

## Reporting a Vulnerability

We take security seriously. If you discover a vulnerability in PKGVault, please follow these steps:

### 1. Do NOT Open a Public Issue

Security vulnerabilities should **never** be reported in public GitHub issues, discussions, or social media.

### 2. Send a Private Report

Email your findings to the project maintainers with:

- **Description** of the vulnerability
- **Steps to reproduce** (as detailed as possible)
- **Potential impact** assessment
- **Suggested fix** (if you have one)

### 3. What to Expect

- **Acknowledgment** within 48 hours
- **Initial assessment** within 1 week
- **Fix timeline** communicated within 2 weeks
- **Credit** in the release notes (if you wish to be credited)

## Security Best Practices

### For Users

- Always use HTTPS in production
- Set a strong `BETTER_AUTH_SECRET` (64+ random characters)
- Keep dependencies updated (`npm audit`)
- Rotate R2 access keys regularly
- Monitor audit logs for suspicious activity

### For Developers

- Never commit secrets or credentials
- Use `.env.example` for required variables
- Validate all user input with Zod schemas
- Use parameterized queries (Drizzle ORM handles this)
- Follow the principle of least privilege for roles
- Review code for injection vectors before merging

## Known Security Architecture

### Authentication

- **Better-Auth** with session-based authentication
- Sessions stored in Redis with configurable TTL
- Password hashing with bcrypt (work factor: 12)
- Role-based access control (user, moderator, admin)

### Data Protection

- **Input validation**: All API endpoints use Zod schemas
- **SQL injection protection**: Drizzle ORM with parameterized queries
- **XSS protection**: React's automatic escaping + CSP headers
- **CSRF protection**: Built into Better-Auth session management
- **Rate limiting**: Redis-backed token bucket algorithm

### File Storage

- Files stored on Cloudflare R2 (S3-compatible)
- Filenames obfuscated using SHA-256 hashing
- Access controlled via presigned URLs with expiration
- File integrity verified via SHA-256 checksums

### Infrastructure

- PostgreSQL with health checks
- Redis for sessions and rate limiting
- Docker Compose for local development
- Production deployment behind reverse proxy with TLS

## Security Checklist for Releases

Before each release, verify:

- [ ] No known vulnerabilities in dependencies (`npm audit`)
- [ ] All API endpoints validate input
- [ ] Authentication gates are in place for protected routes
- [ ] Admin routes require admin role
- [ ] No secrets in environment variables or config files
- [ ] Rate limiting is enabled on public endpoints
- [ ] File upload validation is in place
- [ ] Error messages don't leak sensitive information
