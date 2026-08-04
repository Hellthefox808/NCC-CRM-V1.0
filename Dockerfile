# Multi-stage Dockerfile for 19 JHR BN NCC SBU Microservices Platform
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root & workspace package descriptors
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies across all monorepo packages
RUN npm ci

# Copy application source
COPY . .

# Generate Prisma client and compile both microservices
RUN cd backend && npx prisma generate
RUN npm run build

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy descriptors and built output
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Copy built distribution artifacts
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

CMD ["node", "backend/dist/server.cjs"]
