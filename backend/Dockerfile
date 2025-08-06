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
RUN pnpm install --frozen-lockfile

# Copy backend source code
COPY backend/ ./backend/

# Set working directory to backend
WORKDIR /app/backend

# Build the application
RUN pnpm run build

# Create database initialization script
COPY <<EOF /app/init-db.sh
#!/bin/bash
set -e

echo "Starting database initialization..."

# Function to check if database is ready
check_database() {
    echo "Checking database connection..."
    PGPASSWORD=$DATABASE_PASSWORD pg_isready -h postgres -p 5432 -U postgres
    return $?
}

# Function to check if database exists
check_database_exists() {
    echo "Checking if database 'hermes' exists..."
    PGPASSWORD=$DATABASE_PASSWORD psql -h postgres -p 5432 -U postgres -d postgres -c "SELECT 1 FROM pg_database WHERE datname='hermes';" | grep -q 1
    return $?
}

# Function to create database if it doesn't exist
create_database() {
    echo "Creating database 'hermes'..."
    PGPASSWORD=$DATABASE_PASSWORD psql -h postgres -p 5432 -U postgres -d postgres -c "CREATE DATABASE hermes;" || echo "Database might already exist"
}

# Function to run migrations with retry
run_migrations() {
    local max_attempts=5
    local attempt=1
    
    echo "Running database migrations..."
    
    while [ $attempt -le $max_attempts ]; do
        echo "Migration attempt $attempt/$max_attempts"
        
        if pnpm run migration:run; then
            echo "Migrations completed successfully"
            return 0
        else
            echo "Migration attempt $attempt failed"
            if [ $attempt -eq $max_attempts ]; then
                echo "All migration attempts failed"
                return 1
            fi
            echo "Waiting 10 seconds before retry..."
            sleep 10
            attempt=$((attempt + 1))
        fi
    done
}

# Function to run seed data with retry
run_seeds() {
    local max_attempts=3
    local attempt=1
    
    echo "Running seed data..."
    
    while [ $attempt -le $max_attempts ]; do
        echo "Seed attempt $attempt/$max_attempts"
        
        if pnpm run seed:run; then
            echo "Seed data completed successfully"
            return 0
        else
            echo "Seed attempt $attempt failed"
            if [ $attempt -eq $max_attempts ]; then
                echo "All seed attempts failed"
                return 1
            fi
            echo "Waiting 5 seconds before retry..."
            sleep 5
            attempt=$((attempt + 1))
        fi
    done
}

# Main execution
echo "Starting database initialization..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
timeout=120
counter=0
while ! check_database; do
    if [ $counter -ge $timeout ]; then
        echo "Database connection timeout after ${timeout} seconds"
        exit 1
    fi
    echo "Waiting for database... ($counter/$timeout)"
    sleep 2
    counter=$((counter + 2))
done

echo "Database is ready!"

# Check if database exists, create if not
if ! check_database_exists; then
    echo "Database 'hermes' does not exist, creating..."
    create_database
else
    echo "Database 'hermes' already exists"
fi

# Run migrations
if run_migrations; then
    echo "Database initialization completed successfully"
else
    echo "Database initialization failed"
    exit 1
fi

# Skip seed data - not needed
echo "Skipping seed data - not required"

echo "Database initialization completed!"
EOF

# Create improved startup script
COPY <<EOF /app/startup.sh
#!/bin/bash
set -e

echo "Starting Hermes Backend..."

# Run database initialization (migrations only)
echo "Initializing database..."
if /app/init-db.sh; then
    echo "Database initialization completed"
else
    echo "Database initialization failed"
    exit 1
fi

# Start application
echo "Starting application..."
if [ "$NODE_ENV" = "production" ]; then
    echo "Starting in production mode..."
    pnpm run start:prod
else
    echo "Starting in development mode..."
    pnpm run start:dev
fi
EOF

RUN chmod +x /app/startup.sh /app/init-db.sh

EXPOSE 3000

CMD ["/app/startup.sh"]
