# Rules Module Integration Guide

## Overview

The Rules module has been successfully integrated into the Hermes CRM backend following the established adapter pattern and NestJS architecture. This module provides automated lead scheduling and distribution functionality.

## Architecture Integration

### Module Structure

```
backend/src/modules/rules/
├── dto/
│   ├── create-rule.dto.ts
│   ├── update-rule.dto.ts
│   └── rule.dto.ts
├── rules.controller.ts
├── rules.service.ts
├── rules.module.ts
└── index.ts
```

### Database Schema

The `Rule` entity has been added to the Prisma schema with the following fields:

- `id` - Unique identifier (CUID)
- `name` - Rule name
- `offerId` - Associated offer ID
- `offerName` - Offer name
- `periodMinutes` - Period in minutes
- `minInterval` - Minimum interval between sends
- `maxInterval` - Maximum interval between sends
- `dailyLimit` - Daily lead limit
- `sendWindowStart` - Start time (HH:MM format)
- `sendWindowEnd` - End time (HH:MM format)
- `isActive` - Rule status
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

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
  "offerId": "uuid-here",
  "offerName": "Premium Offer",
  "periodMinutes": 60,
  "minInterval": 5,
  "maxInterval": 15,
  "dailyLimit": 100,
  "sendWindowStart": "09:00",
  "sendWindowEnd": "12:00",
  "isActive": true
}
```

#### Rule Response

```json
{
  "id": "clx1234567890",
  "name": "Morning Campaign",
  "offerId": "uuid-here",
  "offerName": "Premium Offer",
  "periodMinutes": 60,
  "minInterval": 5,
  "maxInterval": 15,
  "dailyLimit": 100,
  "sendWindowStart": "09:00",
  "sendWindowEnd": "12:00",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

## External API Integration

### ExternalApisClient

A dedicated client has been created for external API communication:

#### Configuration

```typescript
// Environment variables
LEADS_API_URL=http://185.190.250.122/hermes_api/v1
LEADS_API_TIMEOUT=5000
AFFILIATE_API_URL=http://185.62.0.70/hermes_api/v1
AFFILIATE_API_TIMEOUT=5000
```

#### Methods

- `getLeads(params)` - Fetch leads from external API
- `sendLeadToAffiliate(lead)` - Send lead to affiliate network

### Lead Scheduling Logic

1. **Rule Creation**: When a rule is created, it automatically triggers lead scheduling
2. **Lead Fetching**: Fetches leads from external API with specified filters
3. **Time Window Calculation**: Calculates the send window for the current day
4. **Random Distribution**: Distributes leads randomly within the time window
5. **Scheduled Sending**: Uses `setTimeout` to schedule each lead send

### Lead Data Structure

```typescript
interface ExternalLead {
  sub_id: string;
  aff: string;
  offer: string;
  offer_name: string;
  country: string;
  name: string;
  phone: string;
  ua: string;
  ip: string;
}
```

## Dependencies Added

### Backend Dependencies

- `@nestjs/axios` - HTTP client for external API calls
- `@nestjs/mapped-types` - DTO utilities

### Configuration Updates

- Added external API configuration to `app.config.ts`
- Updated environment variables in `env.example`

## Database Migration

### Migration File

```sql
-- CreateTable
CREATE TABLE "rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "offerName" TEXT NOT NULL,
    "periodMinutes" INTEGER NOT NULL,
    "minInterval" INTEGER NOT NULL,
    "maxInterval" INTEGER NOT NULL,
    "dailyLimit" INTEGER NOT NULL,
    "sendWindowStart" TEXT NOT NULL,
    "sendWindowEnd" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rules_pkey" PRIMARY KEY ("id")
);
```

### Running Migration

```bash
cd backend
pnpm prisma:migrate
pnpm prisma:generate
```

## Module Registration

The Rules module has been registered in the main application module:

```typescript
// app.module.ts
import { RulesModule } from './modules/rules/rules.module';

@Module({
  imports: [
    // ... other modules
    RulesModule,
  ],
})
export class AppModule {}
```

## Error Handling

### Service Level

- Comprehensive error logging for all external API calls
- Graceful degradation when external APIs are unavailable
- Fire-and-forget scheduling with error catching

### Controller Level

- Proper HTTP status codes for different scenarios
- Validation using class-validator decorators
- Type-safe request/response handling

## Monitoring and Logging

### Logging Strategy

- Detailed logging for lead scheduling operations
- Error logging for failed API calls
- Success logging for completed operations

### Key Log Messages

- Rule creation and scheduling
- Lead fetching from external API
- Lead sending to affiliate network
- Error conditions and failures

## Performance Considerations

### Caching

- External API responses are cached using Redis
- Cache TTL of 5 minutes for lead data
- Configurable cache settings

### Scheduling

- Uses Node.js `setTimeout` for lead scheduling
- No external cron jobs or queue systems required
- Efficient memory usage for scheduled operations

## Security

### Input Validation

- All DTOs use class-validator decorators
- Type-safe parameter handling
- SQL injection prevention through Prisma ORM

### API Security

- External API calls use timeout configuration
- Error handling prevents information leakage
- Secure logging practices

## Testing

### Unit Tests

- Service method testing
- Controller endpoint testing
- DTO validation testing

### Integration Tests

- External API integration testing
- Database operation testing
- End-to-end workflow testing

## Future Enhancements

### Planned Features

- Rule templates for common configurations
- Advanced scheduling options (weekly, monthly)
- Performance analytics and monitoring
- A/B testing capabilities

### Scalability Improvements

- Queue-based processing for high-volume scenarios
- Horizontal scaling support
- Advanced caching strategies

## Troubleshooting

### Common Issues

1. **External API Timeouts**: Check network connectivity and API availability
2. **Database Connection**: Verify PostgreSQL connection and migration status
3. **Scheduling Issues**: Check timezone configuration and window calculations

### Debug Commands

```bash
# Check module registration
pnpm backend:dev

# Verify database schema
pnpm prisma:studio

# Test external API connectivity
curl http://185.190.250.122/hermes_api/v1/get_leads/
```

## Conclusion

The Rules module has been successfully integrated following the established architectural patterns. It provides a robust foundation for automated lead management while maintaining code quality and system reliability.
