# ── Build stage ─────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci --only=production

# ── Runtime stage ──────────────────────────────────────────
FROM node:22-alpine AS runtime

WORKDIR /app

# Create non-root user for security
RUN addgroup -S tingke && adduser -S tingke -G tingke

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Expose API port
EXPOSE 3000

USER tingke

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "src/index.js"]
