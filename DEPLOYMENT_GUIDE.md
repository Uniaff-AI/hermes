# Hermes CRM Deployment Guide

## Environment File Structure

### Development vs Production

The project uses separate environment files for different contexts:

```
hermes/
├── .env.development          # Docker Compose variables for development
├── .env.production          # Docker Compose variables for production
├── backend/
│   ├── .env.development     # Backend-specific variables for development
│   └── .env.production      # Backend-specific variables for production
├── frontend/
│   ├── .env.development     # Frontend-specific variables for development
│   └── .env.production      # Frontend-specific variables for production
└── scripts/
    └── manage-env.sh        # Environment management script
```

### Environment Management

Use the management script to switch environments:

```bash
# Development
./scripts/manage-env.sh development

# Production
./scripts/manage-env.sh production

# Docker (uses root .env for Docker Compose)
./scripts/manage-env.sh docker
```

## Port Configuration

### External Ports (Host Machine)

- **Database (PostgreSQL)**: 5435 → 5432 (container)
- **Redis**: 6382 → 6379 (container)
- **Backend API**: 3004 → 3000 (container)
- **Frontend**: 3003 → 3000 (container)
- **pgAdmin**: 5050 → 80 (container)

### Internal Container Communication

All containers communicate using internal Docker network (`hermes-network`):

- Database: `postgres:5432`
- Redis: `redis:6379`
- Backend: `hermes-backend:3000`
- Frontend: `hermes-frontend:3000`

## Quick Deployment

### 1. Environment Setup

```bash
# For development
./scripts/manage-env.sh development

# For production
./scripts/manage-env.sh production

# For Docker deployment
./scripts/manage-env.sh docker
```

### 2. Check Port Availability

```bash
# Check if required ports are free
ss -tuln | grep -E ':(5435|6382|3003|3004|5050)'

# If any ports are occupied, update the corresponding .env file
```

### 3. Deploy with Docker Compose

```bash
# Build and start all services
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Nginx Configuration

The nginx.config file is configured to proxy:

- Frontend: `https://dev.uniaffcrm.com` → `localhost:3003`
- API: `https://dev.uniaffcrm.com/api` → `localhost:3004/api`

### 5. Health Checks

- Backend: `http://localhost:3004/health`
- Frontend: `http://localhost:3003`
- Database: `localhost:5435`
- Redis: `localhost:6382`
- pgAdmin: `http://localhost:5050`

## Configuration Files Explained

### docker-compose.yml

- Maps external ports to internal container ports
- Uses root `.env` for Docker Compose variables only
- Each service uses its own `.env` file for application variables
- Sets up proper container dependencies and health checks

### Environment Files

- **Root `.env`**: Only Docker Compose variables (ports, service names)
- **Backend `.env`**: NestJS application variables (database, JWT, API keys)
- **Frontend `.env`**: Next.js application variables (API URLs, public keys)

### Dockerfiles

- **Backend**: Builds NestJS app, copies `.env` file, runs migrations, starts on port 3000
- **Frontend**: Builds Next.js app, copies `.env` file, optimized for production, starts on port 3000

## Production Deployment

### Server Setup

1. **Clone repository**:

   ```bash
   git clone <repository-url> hermes
   cd hermes
   ```

2. **Setup environment**:

   ```bash
   ./scripts/manage-env.sh production
   ```

3. **Deploy with Docker**:
   ```bash
   docker-compose up -d --build
   ```

### Environment Variables

Each service has its own environment file:

- **Backend**: `backend/.env` - Database, JWT, external API configuration
- **Frontend**: `frontend/.env` - API URLs, public configuration
- **Root**: `.env` - Docker Compose ports and service names

## Troubleshooting

### Port Conflicts

If you get port binding errors:

1. Check what's using the port: `ss -tuln | grep :PORT`
2. Update the external port in the corresponding `.env` file
3. Restart containers: `docker-compose down && docker-compose up -d`

### Database Connection Issues

1. Ensure PostgreSQL container is healthy: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify environment variables in container: `docker exec hermes-backend env | grep DATABASE`

### Frontend/Backend Communication

1. Check network connectivity: `docker exec hermes-frontend ping hermes-backend`
2. Verify API URLs in frontend `.env` file
3. Check nginx configuration matches the port mapping

### Environment File Issues

1. Ensure correct environment is set: `./scripts/manage-env.sh production`
2. Check file permissions: `ls -la backend/.env frontend/.env`
3. Verify Docker Compose uses correct files: `docker-compose config`
