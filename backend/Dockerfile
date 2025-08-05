FROM node:20-alpine AS base

# Install pnpm globally
RUN corepack enable pnpm

# Install system dependencies
RUN apk add --no-cache bash netcat-openbsd

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

# Create .env if it doesn't exist
RUN if [ ! -f .env ]; then \
  if [ -f env-example-relational ]; then \
    cp env-example-relational .env; \
  else \
    echo "NODE_ENV=development" > .env; \
  fi; \
fi

# Build the application
RUN pnpm run build

# Create wait-for-it script
RUN echo '#!/bin/bash\n\
host="$1"\n\
shift\n\
timeout=30\n\
\n\
while [[ $# -gt 0 ]]; do\n\
  case $1 in\n\
    --timeout=*)\n\
      timeout="${1#*=}"\n\
      shift\n\
      ;;\n\
    --strict)\n\
      shift\n\
      ;;\n\
    --)\n\
      shift\n\
      break\n\
      ;;\n\
    *)\n\
      break\n\
      ;;\n\
  esac\n\
done\n\
\n\
host_port=(${host//:/ })\n\
host=${host_port[0]}\n\
port=${host_port[1]}\n\
\n\
echo "Waiting for $host:$port to be ready..."\n\
\n\
for i in $(seq 1 $timeout); do\n\
  if nc -z "$host" "$port" 2>/dev/null; then\n\
    echo "Service $host:$port is ready!"\n\
    exit 0\n\
  fi\n\
  echo "Waiting... ($i/$timeout)"\n\
  sleep 1\n\
done\n\
\n\
echo "Timeout waiting for $host:$port"\n\
exit 1' > /opt/wait-for-it.sh

RUN chmod +x /opt/wait-for-it.sh

# Create startup script
RUN echo '#!/bin/bash\n\
set -e\n\
echo "Waiting for database to be ready..."\n\
/opt/wait-for-it.sh ${DATABASE_HOST:-postgres}:${DATABASE_PORT:-5432} --timeout=60 --strict || echo "Database wait failed, continuing anyway"\n\
echo "Database connection attempt completed"\n\
echo "Running migrations..."\n\
pnpm run migration:run 2>/dev/null || echo "Migration failed or no migrations to run"\n\
echo "Starting application..."\n\
if [ "$NODE_ENV" = "production" ]; then\n\
  pnpm run start:prod\n\
else\n\
  pnpm run start:dev\n\
fi' > /opt/startup.sh

RUN chmod +x /opt/startup.sh

EXPOSE 3000

CMD ["/opt/startup.sh"]
