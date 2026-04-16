#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# scripts/release.sh — Versioned release helper
# Usage: bash scripts/release.sh [patch|minor|major]
# Example: bash scripts/release.sh patch
# ═══════════════════════════════════════════════════════════════════

set -e

BUMP=${1:-patch}  # patch | minor | major
DOCKER_USER=${DOCKER_USER:-USERNAME}

# ── Get current version from backend/package.json ─────────────────
CURRENT=$(node -p "require('./backend/package.json').version")
echo "Current version: $CURRENT"

# ── Bump version ──────────────────────────────────────────────────
IFS='.' read -ra PARTS <<< "$CURRENT"
MAJOR=${PARTS[0]}
MINOR=${PARTS[1]}
PATCH=${PARTS[2]}

case "$BUMP" in
  major) MAJOR=$((MAJOR+1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR+1)); PATCH=0 ;;
  patch) PATCH=$((PATCH+1)) ;;
  *) echo "Unknown bump type: $BUMP (use patch|minor|major)"; exit 1 ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
TAG="v$NEW_VERSION"

echo "New version: $NEW_VERSION (tag: $TAG)"

# ── Update package.json files ─────────────────────────────────────
node -e "
const fs = require('fs');
['./backend/package.json', './frontend/package.json'].forEach(f => {
  const pkg = JSON.parse(fs.readFileSync(f, 'utf8'));
  pkg.version = '$NEW_VERSION';
  fs.writeFileSync(f, JSON.stringify(pkg, null, 2) + '\n');
  console.log('Updated', f, '->', '$NEW_VERSION');
});
"

# ── Git commit & tag ──────────────────────────────────────────────
git add backend/package.json frontend/package.json
git commit -m "chore: release $TAG"
git tag -a "$TAG" -m "Release $TAG"

echo "Git tag created: $TAG"
echo "Run 'git push origin main --tags' to push the release."

# ── Docker images ─────────────────────────────────────────────────
echo ""
echo "Docker image tags that will be produced by Jenkins:"
echo "  $DOCKER_USER/codex-backend:$TAG"
echo "  $DOCKER_USER/codex-frontend:$TAG"
echo ""
echo "✅ Release $TAG prepared successfully"
