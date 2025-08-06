#!/bin/bash

# Environment Management Script for Hermes CRM
# Usage: ./scripts/manage-env.sh [development|production|docker]

set -e

ENV=${1:-development}

echo "Setting up environment: $ENV"

case $ENV in
  "development")
    echo "Setting up development environment..."
    
    # Copy development environment files
    cp .env.development .env
    cp backend/.env.development backend/.env
    cp frontend/.env.development frontend/.env
    
    echo "✅ Development environment files set up"
    echo "📝 Files updated:"
    echo "  - .env.development → .env"
    echo "  - backend/.env.development → backend/.env"
    echo "  - frontend/.env.development → frontend/.env"
    ;;
    
  "production")
    echo "Setting up production environment..."
    
    # Copy production environment files
    cp .env.production .env
    cp backend/.env.production backend/.env
    cp frontend/.env.production frontend/.env
    
    echo "✅ Production environment files set up"
    echo "📝 Files updated:"
    echo "  - .env.production → .env"
    echo "  - backend/.env.production → backend/.env"
    echo "  - frontend/.env.production → frontend/.env"
    ;;
    
  "docker")
    echo "Setting up Docker environment..."
    
    # For Docker, we only need the root .env for Docker Compose
    # Backend and frontend will use their own .env files
    if [ -f .env.development ]; then
      cp .env.development .env
    elif [ -f .env.production ]; then
      cp .env.production .env
    else
      echo "❌ No environment template found. Please create .env.development or .env.production"
      exit 1
    fi
    
    echo "✅ Docker environment set up"
    echo "📝 Root .env file updated for Docker Compose"
    ;;
    
  *)
    echo "❌ Invalid environment: $ENV"
    echo "Usage: $0 [development|production|docker]"
    exit 1
    ;;
esac

echo ""
echo "🚀 Next steps:"
echo "  - For development: pnpm dev"
echo "  - For Docker: docker-compose up -d"
echo "  - For production: Follow deployment guide"
