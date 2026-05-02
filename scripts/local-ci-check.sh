#!/usr/bin/env bash

set -e  # stop on first error

echo "======================================"
echo "🚀 LOCAL CI CHECK STARTED"
echo "======================================"

# ── Install dependencies if node_modules missing ──────────────────────────────
if [ ! -d "node_modules" ]; then
  echo ""
  echo "📦 node_modules not found, installing dependencies..."
  npm ci
else
  echo ""
  echo "📦 node_modules found, skipping install..."
fi

# ── ESLint: fix first, then check ─────────────────────────────────────────────
echo ""
echo "🔧 Auto-fixing ESLint issues..."
npm run lint:fix || true   # fix what can be fixed, don't stop on unfixable

echo ""
echo "🔍 Running ESLint check..."
npm run lint               # now fail if anything remains unfixed

# ── Prettier: fix first, then check ───────────────────────────────────────────
echo ""
echo "🔧 Auto-fixing Prettier formatting..."
npm run format || true     # format all files first

echo ""
echo "🎨 Checking Prettier formatting..."
npm run format:check       # fail if anything still differs

# ── TypeScript ─────────────────────────────────────────────────────────────────
echo ""
echo "🧠 Running TypeScript type check..."
npm run type-check

# ── Build ──────────────────────────────────────────────────────────────────────
echo ""
echo "🏗️ Building project..."
VITE_API_BASE_URL=https://api.example.com npm run build

# ── Bundle size ────────────────────────────────────────────────────────────────
echo ""
echo "📦 Checking bundle size..."
du -sh dist/        || echo "⚠️  dist folder missing"
du -sh dist/assets/ || echo "⚠️  assets folder missing"

echo ""
echo "✅ ALL CHECKS PASSED"
echo "======================================"