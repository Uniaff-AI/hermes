export const ENV_CONFIG = {
  // Environment detection
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Backend API configuration
  BACKEND_URL:
    process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.uniaffcrm.com/api',
  API_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || '/api',

  // External API configuration
  EXTERNAL_API_URL:
    process.env.API_SCHEME_URL || 'https://api.hermes.uniaffcrm.com',
  EXTERNAL_API_ENDPOINT:
    process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://api.hermes.uniaffcrm.com',
  EXTERNAL_API_KEY: process.env.EXTERNAL_API_KEY || '',

  // Frontend URL
  FRONTEND_URL:
    process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://dev.uniaffcrm.com',
} as const;

// Environment helpers
export const isDevelopment = ENV_CONFIG.NODE_ENV === 'development';
export const isProduction = ENV_CONFIG.NODE_ENV === 'production';
export const isTest = ENV_CONFIG.NODE_ENV === 'test';
