# Rules Module Integration Guide

## Overview

The Rules module has been successfully integrated into the Hermes CRM backend following the established adapter pattern and NestJS architecture. This module provides automated lead scheduling and distribution functionality.

## Architecture Integration

### Module Structure

```
backend/src/rules/
├── domain/
│   └── rule.entity.ts
├── dto/
│   ├── create-rule.dto.ts
│   ├── update-rule.dto.ts
│   └── rule.dto.ts
├── services/
│   ├── lead-scheduling.service.ts
│   ├── rules-monitoring.service.ts
│   └── external-apis.service.ts
├── rules.controller.ts
├── rules.service.ts
├── rules.module.ts
└── index.ts
```

### Database Schema

The `Rule` entity has been updated with the following fields:

- `id` - Unique identifier (UUID)
- `name` - Rule name
- `productId` - Associated product ID (renamed from offerId)
- `productName` - Product name
- `periodMinutes` - Period in minutes
- `minInterval` - Minimum interval between sends
- `maxInterval` - Maximum interval between sends
- `dailyCapLimit` - Daily lead limit (unified field replacing cap + dailyLimit)
- `sendWindowStart` - Start time (HH:MM format)
- `sendWindowEnd` - End time (HH:MM format)
- `isActive` - Rule status
- `isInfinite` - Infinite sending mode
- `vertical` - Product vertical
- `country` - Target country
- `status` - Lead status filter
- `dateFrom` - Date range start
- `dateTo` - Date range end

## API Endpoints

### Rules Management

- `GET /api/rules` - List all rules
- `POST /api/rules` - Create a new rule
- `GET /api/rules/:id` - Get rule by ID
- `PATCH /api/rules/:id` - Update rule
- `DELETE /api/rules/:id` - Delete rule

### Request/Response Examples

#### Create Rule

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

#### Rule Response

```json
{
  "id": "1ffaa843-af26-4374-855f-1ca5827ea309",
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
  "status": "Reject",
  "dateFrom": null,
  "dateTo": null
}
```

## Database Migration

### Migration Files

```sql
-- Initial Schema Migration
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

-- Lead Sending Table
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

### Running Migration

```bash
cd backend
npm run migration:run
npm run seed:run:relational
```

## Conclusion

The Rules module has been successfully integrated following the established architectural patterns. It provides a robust foundation for automated lead management while maintaining code quality and system reliability. The recent refactoring has unified the data structure by replacing `offerId` with `productId` and consolidating `cap` and `dailyLimit` into a single `dailyCapLimit` field.
