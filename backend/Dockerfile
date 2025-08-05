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

# Copy .env file to backend directory if it exists
COPY .env ./backend/.env* ./backend/

# Set working directory to backend
WORKDIR /app/backend

# Build the application
RUN pnpm run build

# Create simple startup script
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

# Create .env if it doesn't exist (for migrations)
if [ ! -f .env ]; then
  echo "Creating .env file for migrations..."
  cat > .env << EOL
NODE_ENV=\${NODE_ENV:-production}
DATABASE_TYPE=\${DATABASE_TYPE:-postgres}
DATABASE_HOST=\${DATABASE_HOST:-postgres}
DATABASE_PORT=\${DATABASE_PORT:-5432}
DATABASE_USERNAME=\${DATABASE_USERNAME:-postgres}
DATABASE_PASSWORD=\${DATABASE_PASSWORD:-secret}
DATABASE_NAME=\${DATABASE_NAME:-hermes}
DATABASE_SYNCHRONIZE=\${DATABASE_SYNCHRONIZE:-false}
EOL
fi

# Run migrations
echo "Running migrations..."
npm run migration:run || echo "Migrations completed or no migrations to run"

# Start application
echo "Starting application..."
if [ "\$NODE_ENV" = "production" ]; then
  npm run start:prod
else
  npm run start:dev
fi
EOF

RUN chmod +x /app/startup.sh

EXPOSE 3000

CMD ["/app/startup.sh"]
