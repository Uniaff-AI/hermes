FROM node:20-alpine AS base

# Install pnpm globally
RUN corepack enable pnpm

# Install system dependencies including postgresql-client for database checks
RUN apk add --no-cache bash netcat-openbsd curl postgresql-client

WORKDIR /app

# Copy workspace files first
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy backend package.json
COPY backend/package.json ./backend/

# Install all dependencies using workspace
RUN pnpm install

# Copy backend source code
COPY backend/ ./backend/

# Set working directory to backend
WORKDIR /app/backend

# Build the application
RUN pnpm run build

# Create simple startup script
COPY <<EOF /app/startup.sh
#!/bin/bash
set -e

echo "=========================================="
echo "Starting Hermes Backend..."
echo "Working directory: \$(pwd)"
echo "Environment: \$NODE_ENV"
echo "=========================================="

# Start application directly
echo "Starting application..."
if [ "\$NODE_ENV" = "production" ]; then
    echo "Starting in production mode..."
    exec node dist/main
else
    echo "Starting in development mode..."
    exec node -r ts-node/register -r tsconfig-paths/register ./node_modules/@nestjs/cli/bin/nest.js start --watch
fi
EOF

RUN chmod +x /app/startup.sh

EXPOSE 3000

CMD ["/app/startup.sh"]
