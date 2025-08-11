# Hermes CRM Development Mode Documentation

## 🚀 Quick Start for Development

### Prerequisites

- Node.js >= 18.0.0
- PNPM >= 8.0.0
- Docker & Docker Compose

### Initial Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Start database services (Docker):**

   ```bash
   docker-compose up -d postgres redis pgadmin
   ```

3. **Start the backend (auto-syncs database schema):**

   ```bash
   pnpm backend:dev
   ```

   > **Note**: In development mode, TypeORM automatically syncs the database schema (`DATABASE_SYNCHRONIZE=true`). No manual migrations are needed.

4. **Seed the database (optional):**
   ```bash
   pnpm backend:seed:run
   ```

## 🔧 Development Workflow

### Option 1: Docker-Free Development (Recommended)

**Start services individually:**

```bash
# Terminal 1: Backend (port 3004)
pnpm backend:dev

# Terminal 2: Frontend (port 3003)
pnpm frontend:dev
```

**Or start both simultaneously:**

```bash
pnpm dev
```

### Option 2: Full Docker Development

```bash
# Start all services including frontend/backend
docker-compose up -d
```

## 📍 Service Ports & URLs

| Service        | Port | URL                       | Purpose           |
| -------------- | ---- | ------------------------- | ----------------- |
| **Frontend**   | 3003 | http://localhost:3003     | Next.js React app |
| **Backend**    | 3004 | http://localhost:3004/api | NestJS API        |
| **PostgreSQL** | 5435 | localhost:5435            | Database          |
| **Redis**      | 6382 | localhost:6382            | Cache/Queue       |
| **pgAdmin**    | 5050 | http://localhost:5050     | Database admin    |

## 🔗 API Connections

### Frontend Configuration

- **Local Backend**: `http://localhost:3004/api` (Rules management)
- **External APIs**: `https://api.hermes.uniaffcrm.com` (Products/Leads)

### Backend Configuration

- **Database**: `postgresql://postgres:secret@localhost:5435/hermes`
- **Redis**: `localhost:6382`

## 🛠️ Available Commands

### Root Level

```bash
pnpm dev              # Start both frontend and backend
pnpm build            # Build all packages
pnpm lint             # Lint all code
pnpm typecheck        # TypeScript type checking
pnpm format           # Format code with Prettier
```

### Backend Commands

```bash
pnpm backend:dev      # Start backend development server
pnpm backend:build    # Build backend
pnpm backend:seed:run         # Seed database
pnpm backend:schema:drop      # Drop all tables
```

### Frontend Commands

```bash
pnpm frontend:dev     # Start frontend development server
pnpm frontend:build   # Build frontend
pnpm generate:api     # Generate API types
```

## 🗄️ Database Management

### Access Database

```bash
# Via pgAdmin (web interface)
open http://localhost:5050
# Login: admin@admin.com / admin

# Via command line
pnpm backend:db:query
```

### Database Operations

```bash
# Seed database
pnpm backend:seed:run

# Drop all tables (reset database)
pnpm backend:schema:drop
```

### Migration Commands (Production Only)

> **Note**: These commands are for production environments where `DATABASE_SYNCHRONIZE=false`. In development, schema changes are automatically applied.

```bash
# Generate new migration
pnpm backend:migration:generate

# Run migrations
pnpm backend:migration:run

# Revert last migration
pnpm backend:migration:revert

# Show migration status
pnpm backend:migration:show
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**

   ```bash
   # Ensure database is running
   docker-compose ps

   # Restart database services
   docker-compose restart postgres redis
   ```

2. **Port Already in Use**

   ```bash
   # Check what's using the port
   lsof -i :3004

   # Kill process if needed
   kill -9 <PID>
   ```

3. **Dependencies Issues**

   ```bash
   # Clean install
   pnpm clean
   pnpm install
   ```

4. **Schema Sync Issues**

   ```bash
   # If auto-sync fails, restart backend
   pnpm backend:dev

   # Or manually drop and recreate schema
   pnpm backend:schema:drop
   pnpm backend:dev
   ```

### Health Checks

```bash
# Backend health
curl http://localhost:3004/api/health

# Database connection
docker-compose exec postgres pg_isready -U postgres

# Redis connection
docker-compose exec redis redis-cli ping
```

## 📁 Project Structure

```
hermes/
├── frontend/         # Next.js React app (port 3003)
├── backend/          # NestJS API (port 3004)
├── docker-compose.yml # Database services
├── .env              # Environment variables
└── package.json      # Root workspace config
```

## 💡 Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload
2. **TypeScript**: Full TypeScript support with strict type checking
3. **ESLint**: Automatic code linting and formatting
4. **Database Auto-Sync**: TypeORM automatically syncs schema changes in development
5. **API Documentation**: Available at `http://localhost:3004/api/docs` (Swagger)
6. **No Manual Migrations**: Schema changes are applied automatically when backend starts

## 🚀 Production vs Development

| Feature            | Development                 | Production                   |
| ------------------ | --------------------------- | ---------------------------- |
| **Database Sync**  | `DATABASE_SYNCHRONIZE=true` | `DATABASE_SYNCHRONIZE=false` |
| **Migrations**     | Auto-applied                | Manual execution required    |
| **Logging**        | Verbose                     | Minimal                      |
| **Hot Reload**     | Enabled                     | Disabled                     |
| **CORS**           | Allowed all                 | Restricted                   |
| **Error Handling** | Detailed                    | Generic                      |

## 🔄 Development Workflow Summary

1. **Start database**: `docker-compose up -d postgres redis pgadmin`
2. **Start backend**: `pnpm backend:dev` (auto-syncs schema)
3. **Start frontend**: `pnpm frontend:dev`
4. **Make changes**: Hot reload handles updates
5. **Database changes**: Automatically applied on backend restart

This setup provides a fast, efficient development environment with full debugging capabilities while maintaining production-like database connectivity.
