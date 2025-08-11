# Development Environment Variables

NODE_ENV=development
APP_NAME="Hermes CRM"

# =============================================================================

# PORTS CONFIGURATION

# =============================================================================

DATABASE_PORT=5435
REDIS_PORT=6382
BACKEND_PORT=3004
FRONTEND_PORT=3003
PGADMIN_PORT=5050

# =============================================================================

# DATABASE CONFIGURATION

# =============================================================================

DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=secret
DATABASE_NAME=hermes
DATABASE_URL=postgresql://postgres:secret@localhost:5435/hermes
DATABASE_SYNCHRONIZE=true
DATABASE_MAX_CONNECTIONS=100
DATABASE_SSL_ENABLED=false
DATABASE_REJECT_UNAUTHORIZED=false
DATABASE_CA=
DATABASE_KEY=
DATABASE_CERT=

# =============================================================================

# REDIS CONFIGURATION

# =============================================================================

REDIS_HOST=localhost
REDIS_PORT=6382
REDIS_PASSWORD=

# =============================================================================

# DOMAINS AND URLS

# =============================================================================

FRONTEND_DOMAIN=http://localhost:3003
BACKEND_DOMAIN=http://localhost:3004/api

# =============================================================================

# API CONFIGURATION

# =============================================================================

API_PREFIX=api
APP_FALLBACK_LANGUAGE=en
APP_HEADER_LANGUAGE=x-custom-lang

# =============================================================================

# EXTERNAL API CONFIGURATION

# =============================================================================

GET_LEADS_URL=https://api.hermes.uniaffcrm.com/v1/get_leads
GET_PRODUCTS_URL=https://api.hermes.uniaffcrm.com/v1/get_products
ADD_LEAD_URL=https://api.hermes.uniaffcrm.com/v1/add_lead
EXTERNAL_API_KEY=
EXTERNAL_API_TIMEOUT=5000
AFFILIATE_API_TIMEOUT=5000

# =============================================================================

# JWT CONFIGURATION

# =============================================================================

AUTH_JWT_SECRET=dev-jwt-secret-key-change-me-in-production
AUTH_JWT_TOKEN_EXPIRES_IN=15m
AUTH_REFRESH_SECRET=dev-refresh-secret-change-me
AUTH_REFRESH_TOKEN_EXPIRES_IN=7d

# =============================================================================

# FILE STORAGE CONFIGURATION

# =============================================================================

FILE_DRIVER=local
ACCESS_KEY_ID=
SECRET_ACCESS_KEY=
AWS_DEFAULT_S3_BUCKET=
AWS_S3_REGION=

# =============================================================================

# MAIL CONFIGURATION

# =============================================================================

MAIL_HOST=localhost
MAIL_CLIENT_PORT=1080

# =============================================================================

# FRONTEND CONFIGURATION

# =============================================================================

NEXT_PUBLIC_API_URL=http://localhost:3004/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:3004
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3003
NEXT_PUBLIC_BASE_URL=/api
NEXT_PUBLIC_API_ENDPOINT=https://api.hermes.uniaffcrm.com
API_SCHEME_URL=https://api.hermes.uniaffcrm.com
