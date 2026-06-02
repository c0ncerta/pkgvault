#!/usr/bin/env bash
# ──────────────────────────────────────────────
# R2 Bucket Setup Script for PKGVault
# Prerequisites: wrangler CLI authenticated (`wrangler login`)
# ──────────────────────────────────────────────
set -euo pipefail

BUCKET_NAME="${R2_BUCKET_NAME:-pkgvault-files}"
ACCOUNT_ID="${R2_ACCOUNT_ID:?Set R2_ACCOUNT_ID env var}"

echo "🪣 Creating R2 bucket: $BUCKET_NAME"
wrangler r2 bucket create "$BUCKET_NAME" 2>/dev/null || echo "  ↳ Bucket already exists"

echo ""
echo "📋 Setting CORS policy..."
cat > /tmp/r2-cors.json << 'CORS'
[
  {
    "AllowedOrigins": ["https://pkgvault.com", "https://*.pkgvault.com", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["Content-Type", "Content-Length", "x-amz-content-sha256"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
CORS

# Apply CORS via S3 API (wrangler doesn't have a direct CORS command)
echo "  ↳ Apply CORS via Cloudflare dashboard or S3-compatible API:"
echo "     Dashboard → R2 → $BUCKET_NAME → Settings → CORS Policy"
echo "     Paste contents of /tmp/r2-cors.json"

echo ""
echo "📋 Lifecycle rule (clean stale uploads)..."
echo "  ↳ Dashboard → R2 → $BUCKET_NAME → Settings → Object lifecycle"
echo "  ↳ Add rule: prefix=uploads/, Delete after 7 days for incomplete multipart uploads"

echo ""
echo "🔑 Create API token:"
echo "  ↳ Dashboard → R2 → Manage R2 API Tokens → Create API Token"
echo "  ↳ Permissions: Object Read & Write"
echo "  ↳ Specify bucket: $BUCKET_NAME"
echo "  ↳ Copy Access Key ID → R2_ACCESS_KEY_ID"
echo "  ↳ Copy Secret Access Key → R2_SECRET_ACCESS_KEY"

echo ""
echo "✅ Done. Update .env with:"
echo "   R2_ACCOUNT_ID=$ACCOUNT_ID"
echo "   R2_BUCKET_NAME=$BUCKET_NAME"
echo "   R2_PUBLIC_URL=https://pub-<hash>.r2.dev  (enable public access in dashboard)"
echo "   R2_ACCESS_KEY_ID=<from dashboard>"
echo "   R2_SECRET_ACCESS_KEY=<from dashboard>"
