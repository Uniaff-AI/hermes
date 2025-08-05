#!/bin/bash

# Hermes CRM Local Development Setup Script
set -e

echo "🚀 Starting Hermes CRM local development setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check PNPM
    if ! command -v pnpm &> /dev/null; then
        print_error "PNPM is not installed. Installing PNPM..."
        npm install -g pnpm
    fi
    
    print_success "Prerequisites check completed"
}

# Setup environment
setup_env() {
    print_step "Setting up environment variables..."
    
    if [ ! -f .env ]; then
        cp env.development .env
        print_success "Environment file created from env.development"
    else
        print_warning "Environment file already exists"
    fi
}

# Start infrastructure
start_infrastructure() {
    print_step "Starting infrastructure services (PostgreSQL, Redis, pgAdmin)..."
    
    docker-compose up -d postgres redis pgadmin
    
    print_success "Infrastructure services started"
    echo "  - PostgreSQL: localhost:5432"
    echo "  - Redis: localhost:6379"
    echo "  - pgAdmin: http://localhost:5050"
}

# Wait for database
wait_for_db() {
    print_step "Waiting for PostgreSQL to be ready..."
    
    timeout=60
    counter=0
    
    while ! docker-compose exec -T postgres pg_isready -U postgres &> /dev/null; do
        if [ $counter -ge $timeout ]; then
            print_error "Database connection timeout"
            exit 1
        fi
        
        echo "  Waiting... ($counter/$timeout)"
        sleep 1
        counter=$((counter + 1))
    done
    
    print_success "PostgreSQL is ready"
}

# Install dependencies
install_deps() {
    print_step "Installing dependencies..."
    
    pnpm install
    
    print_success "Dependencies installed"
}

# Run migrations
run_migrations() {
    print_step "Running database migrations..."
    
    # Wait a bit more for database to be fully ready
    sleep 5
    
    pnpm --filter hermes-backend run migration:run
    
    print_success "Migrations completed"
}

# Run seeds
run_seeds() {
    print_step "Running database seeds..."
    
    pnpm --filter hermes-backend run seed:run:relational
    
    print_success "Database seeding completed"
}

# Show status
show_status() {
    print_step "Checking service status..."
    
    echo ""
    docker-compose ps
    echo ""
    
    print_success "Setup completed! 🎉"
    echo ""
    echo "Next steps:"
    echo "  1. Start backend:  pnpm backend:dev"
    echo "  2. Start frontend: pnpm frontend:dev"
    echo "  3. Monitor DB:     http://localhost:5050"
    echo ""
    echo "Services:"
    echo "  - Backend API:     http://localhost:3001"
    echo "  - Frontend:        http://localhost:3000"
    echo "  - pgAdmin:         http://localhost:5050"
    echo "    Email: admin@hermes.local"
    echo "    Password: admin"
    echo ""
}

# Main execution
main() {
    echo "==============================================="
    echo "🔥 Hermes CRM Local Development Setup"
    echo "==============================================="
    echo ""
    
    check_prerequisites
    setup_env
    start_infrastructure
    wait_for_db
    install_deps
    run_migrations
    run_seeds
    show_status
}

# Run main function
main "$@" 