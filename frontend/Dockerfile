FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable pnpm

# Copy workspace files (from project root)
COPY ../pnpm-workspace.yaml ./
COPY ../pnpm-lock.yaml ./
COPY ../package.json ./

# Copy frontend package.json
COPY package.json ./frontend/

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
COPY . ./frontend/

# Set working directory to frontend
WORKDIR /app/frontend

# Build arguments for environment variables
ARG NODE_ENV=production
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_FRONTEND_URL
ARG API_SCHEME_URL
ARG API_KEY

# Environment variables for build
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV NEXT_PUBLIC_FRONTEND_URL=${NEXT_PUBLIC_FRONTEND_URL}
ENV API_SCHEME_URL=${API_SCHEME_URL}
ENV API_KEY=${API_KEY}

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

# Set ownership
RUN chown -R nextjs:nodejs ./.next
RUN chown -R nextjs:nodejs ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["npx", "next", "start"] 