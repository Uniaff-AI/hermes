# Hermes CRM Deployment Guide

## Port Configuration

### External Ports (Host Machine)

- **Database (PostgreSQL)**: 5435 → 5432 (container)
- **Redis**: 6381 → 6379 (container)
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
# Copy production config to .env
cp env.production.centralized .env

# Or create symlink
ln -sf env.production.centralized .env
```

### 2. Check Port Availability

```bash
# Check if required ports are free
ss -tuln | grep -E ':(5435|6381|3003|3004|5050)'

# If any ports are occupied, update env.production.centralized accordingly
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
- Redis: `localhost:6381`
- pgAdmin: `http://localhost:5050`

## Configuration Files Explained

### docker-compose.yml

- Maps external ports to internal container ports
- Uses environment variables for all configuration
- Sets up proper container dependencies and health checks

### env.production.centralized

- Contains all environment variables
- Clearly separates external vs internal ports
- No duplicate variables

### Dockerfiles

- **Backend**: Builds NestJS app, runs migrations, starts on port 3000
- **Frontend**: Builds Next.js app, optimized for production, starts on port 3000

## Troubleshooting

### Port Conflicts

If you get port binding errors:

1. Check what's using the port: `ss -tuln | grep :PORT`
2. Update the external port in `env.production.centralized`
3. Restart containers: `docker-compose down && docker-compose up -d`

### Database Connection Issues

1. Ensure PostgreSQL container is healthy: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify environment variables in container: `docker exec hermes-backend env | grep DATABASE`

### Frontend/Backend Communication

1. Check network connectivity: `docker exec hermes-frontend ping hermes-backend`
2. Verify API URLs in frontend build: environment variables should point to external URLs
3. Check nginx configuration matches the port mapping
