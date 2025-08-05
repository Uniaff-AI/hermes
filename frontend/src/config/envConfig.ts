export const ENV_CONFIG = {
  // API URLs
  EXTERNAL_API_URL:
    process.env.API_SCHEME_URL || 'https://api.hermes.uniaffcrm.com',
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000',
  API_KEY: process.env.API_KEY || '',

  // Frontend URLs
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',

  // API endpoints
  API_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || '/api',
  API_ENDPOINT:
    process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://api.hermes.uniaffcrm.com',
} as const;

export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
