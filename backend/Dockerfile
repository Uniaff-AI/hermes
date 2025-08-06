FROM node:20-alpine AS base

# Install pnpm globally
RUN corepack enable pnpm

# Install system dependencies
RUN apk add --no-cache bash netcat-openbsd curl

WORKDIR /app

# Copy workspace files first
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy backend package.json
COPY backend/package.json ./backend/

# Install all dependencies using workspace
RUN pnpm install --frozen-lockfile

# Copy backend source code
COPY backend/ ./backend/

# Set working directory to backend
WORKDIR /app/backend

# Build the application
RUN pnpm run build

# Create startup script
COPY <<EOF /app/startup.sh
#!/bin/bash
set -e

echo "Starting Hermes Backend..."

# Wait for database
echo "Waiting for database..."
timeout=60
counter=0
while ! nc -z postgres 5432; do
  if [ \$counter -ge \$timeout ]; then
    echo "Database connection timeout"
    exit 1
  fi
  echo "Waiting for database... (\$counter/\$timeout)"
  sleep 1
  counter=\$((counter + 1))
done

echo "Database is ready!"

# Run migrations if .env exists
if [ -f .env ]; then
  echo "Running migrations..."
  pnpm run migration:run || echo "Migrations completed or no migrations to run"
else
  echo "No .env file found, skipping migrations"
fi

# Start application
echo "Starting application..."
if [ "\$NODE_ENV" = "production" ]; then
  pnpm run start:prod
else
  pnpm run start:dev
fi
EOF

RUN chmod +x /app/startup.sh

EXPOSE 3000

CMD ["/app/startup.sh"]
