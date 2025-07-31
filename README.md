# Hermes CRM Monorepo

A full-stack CRM application built with Next.js frontend and NestJS backend, managed with PNPM workspaces.

## 🏗️ Project Structure

```
hermes/
├── backend/          # NestJS API server
├── frontend/         # Next.js React application
├── docs/            # Documentation
├── package.json     # Root workspace configuration
├── pnpm-workspace.yaml # PNPM workspace definition
└── .npmrc          # PNPM configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- PNPM >= 8.0.0

### Installation

1. **Install PNPM globally** (if not already installed):
   ```bash
   npm install -g pnpm
   ```

2. **Install all dependencies**:
   ```bash
   pnpm install
   ```

3. **Start development servers**:
   ```bash
   # Start both frontend and backend in parallel
   pnpm dev
   
   # Or start individually
   pnpm backend:dev    # Backend only
   pnpm frontend:dev   # Frontend only
   ```

## 📦 Available Scripts

### Root Level Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all services in development mode |
| `pnpm build` | Build all packages |
| `pnpm test` | Run tests for all packages |
| `pnpm lint` | Lint all packages |
| `pnpm lint:fix` | Fix linting issues |
| `pnpm typecheck` | Type check all TypeScript files |
| `pnpm format` | Format code with Prettier |
| `pnpm clean` | Clean build artifacts |

### Individual Package Commands

| Command | Description |
|---------|-------------|
| `pnpm backend:dev` | Start backend development server |
| `pnpm frontend:dev` | Start frontend development server |
| `pnpm backend:build` | Build backend |
| `pnpm frontend:build` | Build frontend |
| `pnpm backend:test` | Run backend tests |
| `pnpm frontend:test` | Run frontend tests |
| `pnpm prisma:generate` | Generate Prisma client |
| `pnpm prisma:migrate` | Run database migrations |
| `pnpm prisma:studio` | Open Prisma Studio |
| `pnpm generate:api` | Generate API types |

## 🛠️ Development Workflow

### Adding Dependencies

```bash
# Add to specific workspace
pnpm --filter hermes-backend add express
pnpm --filter hermes-frontend add react-query

# Add dev dependency
pnpm --filter hermes-backend add -D @types/express

# Add to root (shared dependencies)
pnpm add -w typescript
```

### Running Commands in Specific Workspaces

```bash
# Run command in backend
pnpm --filter hermes-backend run start:dev

# Run command in frontend
pnpm --filter hermes-frontend run dev

# Run command in all workspaces
pnpm --recursive run test
```

### Workspace Dependencies

If one workspace needs to depend on another:

```bash
# Backend depends on shared types
pnpm --filter hermes-backend add hermes-shared

# Frontend depends on backend types
pnpm --filter hermes-frontend add hermes-backend
```

## 🔧 Configuration

### PNPM Workspace Settings

- **Hoisting**: Common dev dependencies (ESLint, Prettier, TypeScript) are hoisted to root
- **Peer Dependencies**: Automatically installed and deduplicated
- **Workspace Protocol**: Uses workspace protocol for internal dependencies

### Environment Setup

1. Copy environment files:
   ```bash
   cp backend/env.example backend/.env
   ```

2. Configure your environment variables in the respective `.env` files

## 📚 Documentation

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [API Documentation](./docs/API.md)
- [Architecture Documentation](./docs/ARCHITECTURE.md)

## 🐳 Docker Support

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run specific services
docker-compose up backend
docker-compose up frontend
```

## 🤝 Contributing

1. Install dependencies: `pnpm install`
2. Set up environment variables
3. Run tests: `pnpm test`
4. Check linting: `pnpm lint`
5. Format code: `pnpm format`

## 📄 License

MIT License - see LICENSE file for details 