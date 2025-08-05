# Hermes CRM Monorepo

A full-stack CRM application built with Next.js frontend and NestJS backend, managed with PNPM workspaces and Docker.

## 🏗️ Project Structure

```
hermes/
├── backend/          # NestJS API server with TypeORM
├── frontend/         # Next.js React application
├── docs/            # Documentation
├── docker-compose.yml # Docker services configuration
├── package.json     # Root workspace configuration
├── pnpm-workspace.yaml # PNPM workspace definition
└── env.development  # Development environment variables
```

## 🛠️ Technology Stack

### Backend

- **NestJS** - Node.js framework for building scalable APIs
- **TypeORM** - Object-Relational Mapping for database operations
- **PostgreSQL** - Primary relational database
- **Redis** - Caching and queue management
- **Bull** - Queue processing for background jobs

### Frontend

- **Next.js 15** - React framework with SSR/SSG support
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Data fetching and state management

### DevOps & Infrastructure

- **Docker & Docker Compose** - Containerization and orchestration
- **PNPM Workspaces** - Monorepo package management
- **pgAdmin** - PostgreSQL database administration

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- PNPM >= 8.0.0
- Docker & Docker Compose

### Installation

1. **Install PNPM globally** (if not already installed):

   ```bash
   npm install -g pnpm
   ```

2. **Clone and setup**:

   ```bash
   git clone <repository-url> hermes
   cd hermes
   pnpm install
   ```

3. **Setup environment variables**:
   ```bash
   cp env.development .env
   # Edit .env if needed for your local setup
   ```

### Development with Docker (Recommended)

1. **Start all services**:

   ```bash
   docker-compose up -d
   ```

2. **Check service status**:

   ```bash
   docker-compose ps
   ```

3. **View logs**:

   ```bash
   # All services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

### Development without Docker

1. **Start database and Redis only**:

   ```bash
   docker-compose up -d postgres redis pgadmin
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Run database migrations**:

   ```bash
   pnpm backend:migration:run
   ```

4. **Run database seeds**:

   ```bash
   pnpm backend:seed:run
   ```

5. **Start development servers**:

   ```bash
   # Start both frontend and backend
   pnpm dev

   # Or start individually
   pnpm backend:dev    # Backend only (http://localhost:3001)
   pnpm frontend:dev   # Frontend only (http://localhost:3000)
   ```

## 📦 Available Scripts

### Root Level Commands

| Command          | Description                            |
| ---------------- | -------------------------------------- |
| `pnpm dev`       | Start all services in development mode |
| `pnpm build`     | Build all packages                     |
| `pnpm start`     | Start all services in production mode  |
| `pnpm lint`      | Lint all packages                      |
| `pnpm lint:fix`  | Fix linting issues                     |
| `pnpm typecheck` | Type check all TypeScript files        |
| `pnpm format`    | Format code with Prettier              |
| `pnpm clean`     | Clean build artifacts                  |

### Backend Commands

| Command                           | Description                      |
| --------------------------------- | -------------------------------- |
| `pnpm backend:dev`                | Start backend development server |
| `pnpm backend:build`              | Build backend                    |
| `pnpm backend:migration:generate` | Generate new migration           |
| `pnpm backend:migration:run`      | Run database migrations          |
| `pnpm backend:migration:revert`   | Revert last migration            |
| `pnpm backend:seed:run`           | Run database seeds               |
| `pnpm backend:schema:drop`        | Drop all database tables         |

### Frontend Commands

| Command               | Description                       |
| --------------------- | --------------------------------- |
| `pnpm frontend:dev`   | Start frontend development server |
| `pnpm frontend:build` | Build frontend for production     |
| `pnpm frontend:lint`  | Lint frontend code                |

## 🗄️ Database Management

### TypeORM Migrations

```bash
# Generate migration after entity changes
pnpm --filter hermes-backend run migration:generate -- src/database/migrations/CreateNewTable

# Run migrations
pnpm --filter hermes-backend run migration:run

# Revert last migration
pnpm --filter hermes-backend run migration:revert

# Drop all tables (careful!)
pnpm --filter hermes-backend run schema:drop
```

### Database Monitoring

Access pgAdmin for database monitoring:

- **URL**: http://localhost:5050
- **Email**: admin@admin.com
- **Password**: admin

Connect to PostgreSQL:

- **Host**: postgres (within Docker network) or localhost (from host)
- **Port**: 5432
- **Database**: hermes
- **Username**: postgres
- **Password**: secret

## 🚢 Services & Ports

| Service    | Port | URL                   | Description               |
| ---------- | ---- | --------------------- | ------------------------- |
| Frontend   | 3000 | http://localhost:3000 | Next.js React application |
| Backend    | 3001 | http://localhost:3001 | NestJS API server         |
| PostgreSQL | 5432 | -                     | Main database             |
| Redis      | 6379 | -                     | Cache & queue storage     |
| pgAdmin    | 5050 | http://localhost:5050 | Database administration   |

## 🔧 Configuration

### Environment Variables

The project uses environment-specific configuration files:

- **`.env`** - Local development (copy from `env.development`)
- **`env.development`** - Development defaults
- **`env.production`** - Production template

Key variables:

```bash
# Database
DATABASE_TYPE=postgres
DATABASE_HOST=localhost  # or 'postgres' in Docker
DATABASE_PORT=5432
DATABASE_NAME=hermes
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=secret

# Application
BACKEND_PORT=3001
FRONTEND_PORT=3000
NODE_ENV=development

# External API
EXTERNAL_API_KEY=your_api_key
GET_LEADS_URL=https://api.hermes.uniaffcrm.com/v1/get_leads
GET_PRODUCTS_URL=https://api.hermes.uniaffcrm.com/v1/get_products
```

### Workspace Dependencies

```bash
# Add dependency to specific workspace
pnpm --filter hermes-backend add express
pnpm --filter hermes-frontend add react-query

# Add dev dependency
pnpm --filter hermes-backend add -D @types/express

# Add to root (shared dependencies)
pnpm add -w typescript
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d postgres redis pgadmin

# View logs
docker-compose logs -f [service-name]

# Stop services
docker-compose down

# Rebuild and start
docker-compose up -d --build

# Clean everything (including volumes)
docker-compose down -v
```

## 🧪 Testing & Quality

```bash
# Run all tests
pnpm test

# Lint code
pnpm lint

# Type checking
pnpm typecheck

# Format code
pnpm format
```

## 📚 API Documentation

The backend provides:

- **Rules API**: `/api/rules` - Manage affiliate marketing rules
- **Leads API**: `/api/get_leads` - External leads integration
- **Products API**: `/api/get_products` - Product catalog

API documentation available at: http://localhost:3001/api-docs (when implemented)

## 🔍 Monitoring & Debugging

### Database Monitoring

- **pgAdmin**: http://localhost:5050 - Full database administration
- **TypeORM Logging**: Enabled in development mode for SQL query debugging

### Application Logs

```bash
# View all logs
docker-compose logs -f

# Backend logs only
docker-compose logs -f backend

# Frontend logs only
docker-compose logs -f frontend
```

## 🛠️ Development Workflow

1. **Start infrastructure**:

   ```bash
   docker-compose up -d postgres redis pgadmin
   ```

2. **Run migrations**:

   ```bash
   pnpm --filter hermes-backend run migration:run
   ```

3. **Seed database**:

   ```bash
   pnpm --filter hermes-backend run seed:run:relational
   ```

4. **Start development**:

   ```bash
   pnpm dev
   ```

5. **Monitor database** via pgAdmin at http://localhost:5050

## 🤝 Contributing

1. Install dependencies: `pnpm install`
2. Set up environment variables
3. Start services: `docker-compose up -d postgres redis pgadmin`
4. Run migrations: `pnpm backend:migration:run`
5. Start development: `pnpm dev`
6. Check linting: `pnpm lint`
7. Format code: `pnpm format`

## 📄 License

MIT License - see LICENSE file for details
