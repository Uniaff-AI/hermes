#!/bin/bash
set -e

echo "🔧 Hermes Database Initialization Script"
echo "========================================"

# Check if running in Docker
if [ -f /.dockerenv ]; then
    echo "🐳 Running inside Docker container"
    DB_HOST="postgres"
    DB_PORT="5432"
else
    echo "💻 Running on host machine"
    DB_HOST="localhost"
    DB_PORT="5435"
fi

# Function to check if database is ready
check_database() {
    echo "Checking database connection..."
    pg_isready -h $DB_HOST -p $DB_PORT -U postgres -d postgres
    return $?
}

# Function to check if database exists
check_database_exists() {
    echo "Checking if database 'hermes' exists..."
    psql "postgresql://postgres:${DATABASE_PASSWORD}@${DB_HOST}:${DB_PORT}/postgres" -c "SELECT 1 FROM pg_database WHERE datname='hermes';" | grep -q 1
    return $?
}

# Function to create database if it doesn't exist
create_database() {
    echo "Creating database 'hermes'..."
    psql "postgresql://postgres:${DATABASE_PASSWORD}@${DB_HOST}:${DB_PORT}/postgres" -c "CREATE DATABASE hermes;" || echo "Database might already exist"
}

# Function to run migrations with retry
run_migrations() {
    local max_attempts=5
    local attempt=1
    
    echo "🔄 Running database migrations..."
    
    while [ $attempt -le $max_attempts ]; do
        echo "Migration attempt $attempt/$max_attempts"
        
        if pnpm run migration:run; then
            echo "✅ Migrations completed successfully"
            return 0
        else
            echo "❌ Migration attempt $attempt failed"
            if [ $attempt -eq $max_attempts ]; then
                echo "❌ All migration attempts failed"
                return 1
            fi
            echo "⏳ Waiting 10 seconds before retry..."
            sleep 10
            attempt=$((attempt + 1))
        fi
    done
}

# Function to run seed data with retry
run_seeds() {
    local max_attempts=3
    local attempt=1
    
    echo "🌱 Running seed data..."
    
    while [ $attempt -le $max_attempts ]; do
        echo "Seed attempt $attempt/$max_attempts"
        
        if pnpm run seed:run; then
            echo "✅ Seed data completed successfully"
            return 0
        else
            echo "❌ Seed attempt $attempt failed"
            if [ $attempt -eq $max_attempts ]; then
                echo "❌ All seed attempts failed"
                return 1
            fi
            echo "⏳ Waiting 5 seconds before retry..."
            sleep 5
            attempt=$((attempt + 1))
        fi
    done
}

# Main execution
echo "🔍 Starting database initialization..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
timeout=120
counter=0
while ! check_database; do
    if [ $counter -ge $timeout ]; then
        echo "❌ Database connection timeout after ${timeout} seconds"
        exit 1
    fi
    echo "Waiting for database... ($counter/$timeout)"
    sleep 2
    counter=$((counter + 2))
done

echo "✅ Database is ready!"

# Check if database exists, create if not
if ! check_database_exists; then
    echo "📝 Database 'hermes' does not exist, creating..."
    create_database
else
    echo "✅ Database 'hermes' already exists"
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
echo "========================================" 