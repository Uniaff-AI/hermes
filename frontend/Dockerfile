FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY frontend/package.json ./frontend/
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY frontend ./frontend
WORKDIR /app/frontend
COPY frontend/.env .env
RUN pnpm run build

FROM node:20-alpine AS runner
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

ENV NODE_ENV=production

COPY --from=builder /app/frontend/.next .next
COPY --from=builder /app/frontend/public ./public
COPY --from=builder /app/frontend/package.json ./package.json
COPY --from=builder /app/frontend/node_modules ./node_modules
COPY --from=builder /app/frontend/next.config.js ./next.config.js
COPY --from=builder /app/frontend/.env .env

EXPOSE 3000
CMD ["pnpm", "start"]
