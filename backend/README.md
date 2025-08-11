# Hermes CRM - Backend

Hermes CRM backend is a modern NestJS application designed for managing leads, products, rules, dashboards, and more. The project follows clean architecture principles and is built with TypeScript.

This backend is being cleaned up and restructured to avoid workspace-related issues and to keep everything simple, maintainable, and beautiful.

---

## ✨ Features

✅ Clean architecture  
✅ TypeScript everywhere  
✅ NestJS 10+ backend
✅ PostgreSQL with TypeORM  
✅ Environment variables validation  
✅ Docker and Docker Compose support  
✅ ESLint + Prettier for code style  
✅ Fully typed API and DTOs  
✅ Ready for production deployment

---

## 📂 Project Structure

src/
├── app.module.ts
├── rules/
│ ├── domain/
│ │ └── rule.entity.ts
│ ├── dto/
│ │ ├── create-rule.dto.ts
│ │ ├── update-rule.dto.ts
│ │ └── rule.dto.ts
│ ├── services/
│ │ ├── lead-scheduling.service.ts
│ │ ├── rules-monitoring.service.ts
│ │ └── external-apis.service.ts
│ ├── rules.controller.ts
│ ├── rules.service.ts
│ ├── rules.module.ts
│ └── index.ts
├── common/
├── config/
├── database/
└── utils/

## 💻 Installation

### 1. Clone the Repository

```bash
git clone https://your-repo-url.git
cd hermes/backend

npm install
# or if you prefer yarn
yarn install
```

### 2. Environment Setup

Create a `.env` file in the backend directory:

```env
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=hermes_db

JWT_SECRET=my_super_secret

# External APIs
LEADS_API_URL=http://185.190.250.122/hermes_api/v1
LEADS_API_TIMEOUT=5000
AFFILIATE_API_URL=http://185.62.0.70/hermes_api/v1
AFFILIATE_API_TIMEOUT=5000
```

### 3. Database Setup

```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Run migrations
npm run migration:run

# Seed the database
npm run seed:run:relational
```

### 4. Start Development Server

```bash
npm run start:dev
```

## 🚀 Available Scripts

```bash
# Development
npm run start:dev          # Start development server
npm run start:debug        # Start with debug mode
npm run start:prod         # Start production server

# Database
npm run migration:generate # Generate new migration
npm run migration:run      # Run pending migrations
npm run migration:show     # Show migration status
npm run schema:drop        # Drop database schema
npm run seed:run:relational # Run database seeds

# Code Quality
npm run lint               # Run ESLint
npm run lint:fix           # Fix linting issues
npm run format             # Format code with Prettier
npm run test               # Run tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
```

## 📊 Database Schema

### Rules Table

```sql
CREATE TABLE "rules" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "name" varchar NOT NULL DEFAULT 'Unnamed rule',
    "productId" varchar,
    "productName" varchar,
    "periodMinutes" integer NOT NULL,
    "minInterval" integer NOT NULL,
    "maxInterval" integer NOT NULL,
    "dailyCapLimit" integer,
    "sendWindowStart" varchar,
    "sendWindowEnd" varchar,
    "isActive" boolean NOT NULL DEFAULT true,
    "isInfinite" boolean NOT NULL DEFAULT false,
    "vertical" varchar,
    "country" varchar,
    "status" varchar,
    "dateFrom" varchar,
    "dateTo" varchar,
    CONSTRAINT "PK_rules" PRIMARY KEY ("id")
);
```

### Lead Sending Table

```sql
CREATE TABLE "lead_sending" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "ruleId" uuid NOT NULL,
    "subid" varchar NOT NULL,
    "leadName" varchar NOT NULL,
    "phone" varchar NOT NULL,
    "email" varchar,
    "country" varchar,
    "status" "lead_sending_status_enum" NOT NULL,
    "responseStatus" integer,
    "errorDetails" text,
    "sentAt" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "PK_lead_sending" PRIMARY KEY ("id"),
    CONSTRAINT "FK_lead_sending_rules" FOREIGN KEY ("ruleId") REFERENCES "rules"("id") ON DELETE CASCADE
);
```

## 🔌 API Endpoints

### Rules Management

- `GET /api/rules` - List all rules
- `POST /api/rules` - Create a new rule
- `GET /api/rules/:id` - Get rule by ID
- `PATCH /api/rules/:id` - Update rule
- `DELETE /api/rules/:id` - Delete rule
- `GET /api/rules/analytics/overview` - Get rules analytics

### Example Rule Creation

```json
POST /api/rules
{
  "name": "Morning Campaign",
  "productId": "uuid-here",
  "productName": "Premium Product",
  "periodMinutes": 60,
  "minInterval": 5,
  "maxInterval": 15,
  "dailyCapLimit": 100,
  "sendWindowStart": "09:00",
  "sendWindowEnd": "12:00",
  "isActive": true,
  "isInfinite": false,
  "vertical": "Потенция",
  "country": "PT",
  "status": "Reject"
}
```

## 🔄 Recent Changes

### Data Structure Updates

- `offerId` → `productId` (renamed for consistency)
- `dailyLimit` + `cap` → `dailyCapLimit` (unified field)

### Benefits

- **Consistency**: Uniform field naming
- **Simplification**: Single field instead of two duplicate fields
- **Readability**: More understandable data structure
- **Maintainability**: Simplified API and database operations

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🐳 Docker

```bash
# Build image
docker build -t hermes-backend .

# Run container
docker run -p 3001:3001 hermes-backend

# With docker-compose
docker-compose up -d
```

## 📝 License

MIT License - see LICENSE file for details.
