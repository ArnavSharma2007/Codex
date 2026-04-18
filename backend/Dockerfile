# ────────────────────────────────────────────────────────────────────────────
# Stage 1: Build dependencies
# ────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine3.20 AS builder

WORKDIR /app

# Copy only dependency manifests first (layer caching)
COPY package*.json ./

# Install ALL deps (including dev — needed for build scripts if any)
RUN npm ci --only=production

# ────────────────────────────────────────────────────────────────────────────
# Stage 2: Production image
# ────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

# Security: run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application source
COPY . .

# Create logs directory with proper permissions
RUN mkdir -p /app/logs && chown -R appuser:appgroup /app

USER appuser

# Expose API port
EXPOSE 5000

# Health check built into Docker image
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

ENV NODE_ENV=production

CMD ["node", "server.js"]
