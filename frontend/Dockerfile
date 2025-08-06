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

# Copy the actual .env.production file and rename it to .env for the build
COPY frontend/.env ./.env

# Build the application
RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Install pnpm in runner stage
RUN corepack enable pnpm

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy package.json files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/frontend/package.json ./frontend/package.json

# Copy built application and node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder /app/frontend/.env ./frontend/.env

# Set ownership
RUN chown -R nextjs:nodejs ./frontend
RUN chown -R nextjs:nodejs ./node_modules

# Set working directory to frontend
WORKDIR /app/frontend

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application using pnpm
CMD ["pnpm", "start"] 