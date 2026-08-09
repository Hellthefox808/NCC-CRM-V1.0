# Multi-stage Dockerfile for NCC Management Platform
# Stage 1: Dependencies & Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build production bundle
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Runtime Production Image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root system user for container security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nccapp -u 1001 -G nodejs

# Copy built assets and production node_modules from builder
COPY --from=builder --chown=nccapp:nodejs /app/.output ./.output
COPY --from=builder --chown=nccapp:nodejs /app/package.json ./package.json

USER nccapp

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

CMD ["node", ".output/server/index.mjs"]
