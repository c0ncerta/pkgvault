# Contributing to PKGVault

Thank you for your interest in contributing to PKGVault! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

## Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/c0ncerta/pkgvault.git
cd pkgvault/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Local Services

```bash
docker compose up -d
```

### 4. Configure Environment

```bash
cp .env.example .env
```

### 5. Set Up Database

```bash
npm run db:push
npm run db:seed
```

### 6. Start Development Server

```bash
npm run dev
```

## Development Workflow

### Branch Naming

Use descriptive branch names with a type prefix:

```
feature/add-pkg-search
bugfix/fix-download-counter
docs/update-api-docs
refactor/extract-validation-logic
chore/upgrade-dependencies
```

### Before You Code

1. **Check existing issues** — Someone may already be working on it
2. **Create an issue** — For non-trivial changes, discuss first
3. **Assign yourself** — So others know it's being worked on

### Development Process

1. Create a feature branch from `main`
2. Make your changes
3. Run the quality checks (see below)
4. Write or update tests if applicable
5. Commit with clear messages
6. Push and open a Pull Request

## Coding Standards

### TypeScript

- **Strict mode** is enabled — no `any` types without justification
- All public APIs must have JSDoc comments
- Use explicit return types on exported functions
- Prefer `interface` for object shapes, `type` for unions

### Component Guidelines

- Use functional components with hooks
- Co-locate related files (component + styles + tests)
- Export components as named exports
- Use Tailwind CSS for styling (no inline styles)

### API Guidelines

- All API routes must validate input with Zod schemas
- Return consistent error responses
- Use appropriate HTTP status codes
- Document public endpoints in `app/api-docs/`

### Linting & Formatting

We use [Biome](https://biomejs.dev/) for linting and formatting:

```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix what's possible
npm run format      # Format code
npm run typecheck   # TypeScript type check
```

**All PRs must pass these checks.**

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, no logic change) |
| `refactor` | Code refactoring |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `chore` | Maintenance, dependencies, config |

### Examples

```
feat(catalog): add full-text search for PKG titles
fix(auth): resolve session expiration on token refresh
docs(readme): update quick start instructions
refactor(db): extract connection pooling to separate module
chore(deps): upgrade next.js to 15.3.0
```

## Pull Requests

### PR Checklist

- [ ] Branch is up to date with `main`
- [ ] Code passes `npm run lint` and `npm run typecheck`
- [ ] Changes are tested (manually or with automated tests)
- [ ] Commit messages follow Conventional Commits
- [ ] Documentation is updated if needed
- [ ] No secrets or credentials in commits

### PR Template

When opening a PR, include:

1. **What** — Describe the changes
2. **Why** — Link to the issue, explain the motivation
3. **How** — Key implementation decisions
4. **Testing** — How you verified the changes
5. **Screenshots** — For UI changes

## Testing

### Manual Testing Checklist

Before submitting a PR, verify:

- [ ] The feature works as expected
- [ ] No console errors in the browser
- [ ] Database operations succeed
- [ ] Edge cases are handled (empty states, errors)
- [ ] Authentication/authorization works correctly

### Database Changes

- Generate migrations with `npm run db:generate`
- Test migrations on a clean database
- Include rollback instructions if destructive

## Security

- Never commit secrets, API keys, or credentials
- Use `.env.example` to document required variables
- Report security issues privately (see [SECURITY.md](SECURITY.md))
- Validate all user input with Zod schemas

## Questions?

- Open a [GitHub Discussion](https://github.com/c0ncerta/pkgvault/discussions)
- Create an [Issue](https://github.com/c0ncerta/pkgvault/issues) for bugs

Thank you for contributing! 🚀
