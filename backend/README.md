# Hermes CRM - Backend

Hermes CRM Backend is a modern NestJS application designed for managing leads, offers, and complex business rules. The project uses a clean adapter pattern architecture to integrate with legacy PHP/MySQL systems while providing a scalable foundation for future development.

## 🏗️ Architecture

### **Adapter Pattern Implementation**
- **PHP Backend Adapter**: Clean integration with legacy PHP/MySQL system via HTTP API calls
- **Redis Caching**: Performance optimization for frequently accessed data
- **BullMQ**: Background job processing for complex operations
- **Prisma ORM**: Type-safe database operations for new PostgreSQL data

### **Module Structure**
```
src/
├── modules/
│   ├── leads/          # Lead management (PHP backend integration)
│   ├── offers/         # Offer management (PHP backend integration)
│   └── rules/          # Complex business rules (PostgreSQL + BullMQ)
├── adapters/
│   └── php-backend/    # Legacy system integration
├── config/             # Configuration management
├── database/           # Prisma setup
└── common/             # Shared utilities
```

## ✨ Features

✅ **Clean Architecture** - Adapter pattern for legacy integration  
✅ **TypeScript Everywhere** - Full type safety  
✅ **NestJS 10+** - Modern framework with dependency injection  
✅ **PostgreSQL + Prisma** - Type-safe database operations  
✅ **Redis Caching** - Performance optimization  
✅ **BullMQ** - Background job processing  
✅ **HTTP API Integration** - Seamless legacy system connection  
✅ **Environment Configuration** - Flexible deployment setup  
✅ **Swagger Documentation** - Auto-generated API docs  

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp env.example .env
```

Update the `.env` file with your configuration:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/hermes_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=300

# PHP Backend API
PHP_BACKEND_URL=http://localhost:8000
PHP_API_TOKEN=your_php_api_token_here
PHP_API_TIMEOUT=5000
PHP_API_RETRIES=3

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

### 4. Start Development Server

```bash
# Development mode with hot reload
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:3000/api`
- **Health Check**: `http://localhost:3000/api/health`

## 🔧 Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debug mode

# Production
npm run build              # Build the application
npm run start:prod         # Start production server

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run database migrations
npm run prisma:studio      # Open Prisma Studio

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
npm run test               # Run tests
```

## 🏛️ Architecture Details

### **Data Flow**

1. **Leads/Offers (Legacy Integration)**:
   ```
   Client → Controller → Service → PHP Backend Adapter → HTTP API → Legacy PHP/MySQL
   ```

2. **Rules (New PostgreSQL)**:
   ```
   Client → Controller → Service → Repository → Prisma → PostgreSQL
   ```

3. **Background Processing**:
   ```
   Service → BullMQ Queue → Processor → Complex Business Logic
   ```

### **Caching Strategy**

- **Redis Cache**: 5-minute TTL for PHP API responses
- **Cache Invalidation**: Automatic invalidation on data changes
- **Cache Keys**: Structured keys for easy management

### **Error Handling**

- **Global Exception Filters**: Consistent error responses
- **HTTP Client Retries**: Configurable retry logic for external APIs
- **Graceful Degradation**: Fallback mechanisms for external service failures

## 🔌 Integration Points

### **PHP Backend API**

The application integrates with your existing PHP backend through HTTP API calls:

- **Base URL**: Configurable via `PHP_BACKEND_URL`
- **Authentication**: Bearer token via `PHP_API_TOKEN`
- **Endpoints**: `/api/leads`, `/api/offers`, `/api/health`
- **Caching**: Redis-based caching for performance

### **Database Integration**

- **PostgreSQL**: New data storage with Prisma ORM
- **Prisma Schema**: Located in `prisma/schema.prisma`
- **Migrations**: Version-controlled database schema changes

## 🚀 Deployment

### **Docker Support**

```bash
# Build the application
docker build -t hermes-backend .

# Run with environment variables
docker run -p 3000:3000 --env-file .env hermes-backend
```

### **Environment Variables**

All configuration is environment-based for easy deployment across different environments (development, staging, production).

## 🤝 Contributing

1. Follow the established architecture patterns
2. Use TypeScript for all new code
3. Add proper validation and error handling
4. Update API documentation
5. Write tests for new features

## 📝 License

MIT License - see LICENSE file for details.