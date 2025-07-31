export default () => ({
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
    environment: process.env.NODE_ENV || 'development',
    name: 'Hermes CRM Backend',
  },
  database: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:password@localhost:5432/hermes_crm',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    ttl: parseInt(process.env.REDIS_TTL || '300', 10), // 5 minutes default
    password: process.env.REDIS_PASSWORD,
  },
  phpBackend: {
    baseUrl: process.env.PHP_BACKEND_URL || 'http://localhost:8000',
    apiToken: process.env.PHP_API_TOKEN || '',
    timeout: parseInt(process.env.PHP_API_TIMEOUT || '5000', 10),
    retries: parseInt(process.env.PHP_API_RETRIES || '3', 10),
  },
  externalApis: {
    leadsApi: {
      baseUrl:
        process.env.LEADS_API_URL || 'http://185.190.250.122/hermes_api/v1',
      timeout: parseInt(process.env.LEADS_API_TIMEOUT || '5000', 10),
    },
    affiliateApi: {
      baseUrl:
        process.env.AFFILIATE_API_URL || 'http://185.62.0.70/hermes_api/v1',
      timeout: parseInt(process.env.AFFILIATE_API_TIMEOUT || '5000', 10),
    },
  },
  queue: {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
    },
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
});
