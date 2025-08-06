FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable pnpm

# Copy workspace files (already at root context)
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy frontend package.json
COPY frontend/package.json ./frontend/

# Install all dependencies using workspace
RUN pnpm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable pnpm

# Disable npm workspace checks and telemetry
ENV npm_config_user_config=/app/.npmrc
ENV npm_config_fund=false
ENV npm_config_audit=false
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ ./frontend/

# Set working directory to frontend
WORKDIR /app/frontend

# Create a minimal .env file for build (actual env vars come from docker-compose)
RUN echo "NODE_ENV=production" > ./.env

# Build the application
RUN pnpm run build

# Check what was built and create missing directories
RUN ls -la .next/ || true
RUN ls -la .next/standalone/ || echo "No standalone directory found"
RUN ls -la .next/static/ || echo "No static directory found"
RUN mkdir -p .next/standalone .next/static || true

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public folder
COPY --from=builder /app/frontend/public ./public

# Create .next directory with proper permissions
RUN mkdir -p .next
RUN chown nextjs:nodejs .next

# Copy Next.js build files
COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/frontend/package.json ./package.json

# Create minimal .env file (actual env vars come from docker-compose)
RUN echo "NODE_ENV=production" > ./.env

# Set ownership
RUN chown -R nextjs:nodejs ./.next
RUN chown -R nextjs:nodejs ./public
RUN chown nextjs:nodejs ./.env

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application with standard Next.js command
CMD ["npx", "next", "start"] 