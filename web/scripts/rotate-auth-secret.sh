#!/usr/bin/env bash
# ──────────────────────────────────────────────
# Rotate BETTER_AUTH_SECRET
# Generates a cryptographically secure 64-char hex secret
# ──────────────────────────────────────────────
set -euo pipefail

NEW_SECRET=$(openssl rand -hex 32)

echo "🔐 New BETTER_AUTH_SECRET generated"
echo ""
echo "   BETTER_AUTH_SECRET=$NEW_SECRET"
echo ""
echo "⚠️  Steps:"
echo "   1. Update production env (Vercel/Fly/etc) with the new value"
echo "   2. Redeploy the application"
echo "   3. Existing sessions will be invalidated (users must re-login)"
echo "   4. Do NOT commit this value to git"
