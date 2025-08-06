# 🚀 Hermes Application Deployment Guide

## 🔧 **РЕШЕННЫЕ ПРОБЛЕМЫ**

### ✅ **Docker Networking Issues**

- Исправлена проблема с Next.js слушанием только на localhost
- Добавлен флаг `-H 0.0.0.0` в start script для Docker совместимости
- Исправлена nginx конфигурация для правильной маршрутизации API routes

### ✅ **API Routes Configuration**

- Исправлена nginx конфигурация: `/api/` теперь идет на фронтенд (порт 3003)
- `/rules` и `/health` идут на бэкенд (порт 3004)
- Убрана конфликтующая конфигурация API routes

### ✅ **Environment Variables**

- Исправлены переменные окружения для правильной работы в Docker
- Убраны конфликтующие URL между локальной разработкой и продакшеном
- Добавлены правильные переменные для контейнерного взаимодействия

### ✅ **Database Initialization - АВТОМАТИЗИРОВАНО**

- ✅ **Полностью автоматическая инициализация базы данных**
- ✅ **Умное ожидание готовности PostgreSQL с pg_isready**
- ✅ **Автоматическое создание базы данных если не существует**
- ✅ **Retry логика для миграций (5 попыток)**
- ✅ **Retry логика для seed данных (3 попытки)**
- ✅ **Автоматическое применение миграций**
- ✅ **Автоматическое заполнение seed данными**
- ✅ **Улучшенное логирование с эмодзи для лучшей читаемости**
- ✅ **Health checks для правильной последовательности запуска**

## 📋 **ШАГИ ДЕПЛОЯ**

### **Шаг 1: Подготовка сервера**

```bash
# Освободить порты если они заняты
sudo lsof -i :3003
sudo lsof -i :3004
sudo lsof -i :5435
sudo lsof -i :6382

# Убить процессы если нужно
sudo kill -9 <PID>

# Или остановить сервисы
sudo systemctl stop <service-name>
```

### **Шаг 2: Обновление переменных окружения**

**Корневой `.env` файл:**

```bash
# =============================================================================
# DOCKER COMPOSE CONFIGURATION
# =============================================================================
# Внешние порты (маппинг портов Docker - порты хоста)
DATABASE_PORT=5435
REDIS_PORT=6382
BACKEND_PORT=3004
FRONTEND_PORT=3003
PGADMIN_PORT=5050

# =============================================================================
# КОНФИГУРАЦИЯ БАЗЫ ДАННЫХ
# =============================================================================
DATABASE_NAME=hermes
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_secure_password_here

# =============================================================================
# ВНЕШНИЙ API КЛЮЧ
# =============================================================================
EXTERNAL_API_KEY=your_external_api_key_here

# =============================================================================
# ОКРУЖЕНИЕ NODE
# =============================================================================
NODE_ENV=production
```

**Frontend `.env` файл (Локальная разработка):**

```bash
# Переменные окружения фронтенда для разработки
NODE_ENV=development

# =============================================================================
# ПУБЛИЧНАЯ КОНФИГУРАЦИЯ ФРОНТЕНДА (Доступна в браузере)
# =============================================================================
# Внешний API для продуктов и лидов
NEXT_PUBLIC_API_URL=https://api.hermes.uniaffcrm.com/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:3004/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3003
NEXT_PUBLIC_BASE_URL=/api
NEXT_PUBLIC_API_ENDPOINT=https://api.hermes.uniaffcrm.com

# =============================================================================
# ВНЕШНИЙ API (Серверная часть)
# =============================================================================
API_SCHEME_URL=https://api.hermes.uniaffcrm.com
EXTERNAL_API_KEY=your_external_api_key_here
```

**Backend `.env` файл (Локальная разработка):**

```bash
# Переменные окружения бэкенда для разработки
NODE_ENV=development
APP_NAME="Hermes CRM"

# =============================================================================
# КОНФИГУРАЦИЯ ПОРТОВ ПРИЛОЖЕНИЯ
# =============================================================================
PORT=3004
APP_PORT=3004

# =============================================================================
# КОНФИГУРАЦИЯ БАЗЫ ДАННЫХ (Локальная разработка)
# =============================================================================
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_secure_password_here
DATABASE_NAME=hermes
DATABASE_URL=postgresql://postgres:your_secure_password_here@localhost:5435/hermes
DATABASE_SYNCHRONIZE=true
DATABASE_MAX_CONNECTIONS=100
DATABASE_SSL_ENABLED=false
DATABASE_REJECT_UNAUTHORIZED=false

# =============================================================================
# КОНФИГУРАЦИЯ REDIS (Локальная разработка)
# =============================================================================
REDIS_HOST=localhost
REDIS_PORT=6382
REDIS_PASSWORD=

# =============================================================================
# КОНФИГУРАЦИЯ API
# =============================================================================
API_PREFIX=api
APP_FALLBACK_LANGUAGE=en
APP_HEADER_LANGUAGE=x-custom-lang

# =============================================================================
# КОНФИГУРАЦИЯ JWT
# =============================================================================
AUTH_JWT_SECRET=your_jwt_secret_key_here
AUTH_JWT_TOKEN_EXPIRES_IN=15m
AUTH_REFRESH_SECRET=your_refresh_secret_here
AUTH_REFRESH_TOKEN_EXPIRES_IN=7d

# =============================================================================
# КОНФИГУРАЦИЯ ХРАНИЛИЩА ФАЙЛОВ
# =============================================================================
FILE_DRIVER=local

# =============================================================================
# КОНФИГУРАЦИЯ ПОЧТЫ
# =============================================================================
MAIL_HOST=localhost
MAIL_CLIENT_PORT=1080

# =============================================================================
# ДОМЕНЫ И URL (для CORS)
# =============================================================================
FRONTEND_DOMAIN=http://localhost:3003
```

**Backend `.env` файл (Docker продакшен):**

```bash
# Переменные окружения бэкенда для продакшена
NODE_ENV=production
APP_NAME="Hermes CRM"

# =============================================================================
# КОНФИГУРАЦИЯ ПОРТОВ ПРИЛОЖЕНИЯ
# =============================================================================
PORT=3000
APP_PORT=3000

# =============================================================================
# КОНФИГУРАЦИЯ БАЗЫ ДАННЫХ (Имена сервисов Docker)
# =============================================================================
DATABASE_TYPE=postgres
DATABASE_HOST=postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_secure_password_here
DATABASE_NAME=hermes
DATABASE_URL=postgresql://postgres:your_secure_password_here@postgres:5432/hermes
DATABASE_SYNCHRONIZE=true
DATABASE_MAX_CONNECTIONS=100
DATABASE_SSL_ENABLED=false
DATABASE_REJECT_UNAUTHORIZED=false

# =============================================================================
# КОНФИГУРАЦИЯ REDIS (Имена сервисов Docker)
# =============================================================================
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# =============================================================================
# КОНФИГУРАЦИЯ API
# =============================================================================
API_PREFIX=api
APP_FALLBACK_LANGUAGE=en
APP_HEADER_LANGUAGE=x-custom-lang

# =============================================================================
# КОНФИГУРАЦИЯ JWT
# =============================================================================
AUTH_JWT_SECRET=your_jwt_secret_key_here
AUTH_JWT_TOKEN_EXPIRES_IN=15m
AUTH_REFRESH_SECRET=your_refresh_secret_here
AUTH_REFRESH_TOKEN_EXPIRES_IN=7d

# =============================================================================
# КОНФИГУРАЦИЯ ХРАНИЛИЩА ФАЙЛОВ
# =============================================================================
FILE_DRIVER=local

# =============================================================================
# КОНФИГУРАЦИЯ ПОЧТЫ
# =============================================================================
MAIL_HOST=localhost
MAIL_CLIENT_PORT=1080

# =============================================================================
# ДОМЕНЫ И URL (для CORS)
# =============================================================================
FRONTEND_DOMAIN=http://localhost:3003
```

### **Шаг 3: Настройка Nginx**

**Создать файл конфигурации nginx:**

```bash
sudo nano /etc/nginx/sites-available/dev.uniaffcrm
```

**Вставить конфигурацию:**

```nginx
# Hermes CRM Nginx Configuration for dev.uniaffcrm.com

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name dev.uniaffcrm.com;
    return 301 https://$host$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name dev.uniaffcrm.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/dev.uniaffcrm.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dev.uniaffcrm.com/privkey.pem;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Backend API Routes - только для /rules и /health
    location /rules {
        proxy_pass http://127.0.0.1:3004/rules;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        proxy_pass http://127.0.0.1:3004/health;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend API Routes - для /api/get_leads, /api/get_products
    location /api/ {
        proxy_pass http://127.0.0.1:3003/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend Application
    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Активировать конфигурацию:**

```bash
# Создать символическую ссылку
sudo ln -s /etc/nginx/sites-available/dev.uniaffcrm /etc/nginx/sites-enabled/

# Удалить дефолтный конфиг если есть
sudo rm /etc/nginx/sites-enabled/default

# Проверить конфигурацию
sudo nginx -t

# Перезагрузить nginx
sudo systemctl reload nginx
```

### **Шаг 4: Деплой приложения**

```bash
# Остановить существующие контейнеры
docker-compose down -v

# Удалить старые образы
docker system prune -f

# Собрать и запустить сервисы
docker-compose build --no-cache
docker-compose up -d

# Проверить логи
docker logs hermes-frontend -f
docker logs hermes-backend -f
```

### **Шаг 5: Автоматическая инициализация базы данных**

**🎉 БАЗА ДАННЫХ ИНИЦИАЛИЗИРУЕТСЯ АВТОМАТИЧЕСКИ!**

При запуске контейнера backend автоматически выполняется:

1. **⏳ Ожидание готовности PostgreSQL** (до 120 секунд)
2. **🔍 Проверка существования базы данных 'hermes'**
3. **📝 Создание базы данных если не существует**
4. **🔄 Применение миграций** (с retry логикой - 5 попыток)
5. **🌱 Заполнение seed данными** (с retry логикой - 3 попытки)
6. **✅ Запуск основного приложения**

**Логи инициализации можно посмотреть:**

```bash
# Посмотреть логи инициализации базы данных
docker logs hermes-backend | grep -E "(🔍|⏳|✅|❌|🔄|🌱|📝|🎉)"

# Посмотреть полные логи backend
docker logs hermes-backend -f
```

**Ручная проверка (если нужно):**

```bash
# Проверить что таблицы созданы
docker-compose exec postgres psql -U postgres -d hermes -c "\dt"

# Проверить что данные заполнены
docker-compose exec postgres psql -U postgres -d hermes -c "SELECT * FROM rules;"
```

### **Шаг 6: Проверка деплоя**

```bash
# Проверить статус контейнеров
docker-compose ps

# Проверить сетевое подключение
docker exec hermes-frontend ping backend
docker exec hermes-backend ping postgres
docker exec hermes-backend ping redis

# Протестировать API endpoints
curl http://localhost:3004/api/health
curl http://localhost:3003
curl https://dev.uniaffcrm.com/api/get_leads
```

## 🔍 **УСТРАНЕНИЕ НЕПОЛАДОК**

### **Если база данных не инициализируется автоматически:**

1. **Проверить логи инициализации:**

```bash
docker logs hermes-backend | grep -A 10 -B 10 "Database initialization"
```

2. **Проверить подключение к базе:**

```bash
docker-compose exec postgres psql -U postgres -d hermes -c "\dt"
```

3. **Запустить инициализацию вручную:**

```bash
docker-compose exec backend /app/init-db.sh
```

### **Если фронтенд не отвечает:**

1. **Проверить переменные окружения:**

```bash
docker exec hermes-frontend env | grep NEXT_PUBLIC
docker exec hermes-frontend env | grep API
```

2. **Проверить сетевое подключение:**

```bash
docker exec hermes-frontend curl http://backend:3000/api/health
```

3. **Проверить логи бэкенда:**

```bash
docker logs hermes-backend --tail 50
```

### **Если API routes не работают:**

1. **Проверить nginx конфигурацию:**

```bash
sudo nginx -t
sudo systemctl status nginx
```

2. **Проверить логи nginx:**

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

3. **Проверить что контейнеры слушают правильно:**

```bash
docker-compose exec frontend netstat -tlnp
docker-compose exec backend netstat -tlnp
```

### **Если порты все еще заняты:**

```bash
# Найти процессы использующие порты
sudo netstat -tulpn | grep :3003
sudo netstat -tulpn | grep :3004
sudo netstat -tulpn | grep :5435
sudo netstat -tulpn | grep :6382

# Убить процессы
sudo fuser -k 3003/tcp
sudo fuser -k 3004/tcp
sudo fuser -k 5435/tcp
sudo fuser -k 6382/tcp
```

## ✅ **КРИТЕРИИ УСПЕХА**

- ✅ Фронтенд запускается без ошибок
- ✅ Бэкенд подключается к базе данных и Redis
- ✅ **База данных автоматически инициализируется**
- ✅ **Миграции применяются автоматически**
- ✅ **Seed данные заполняются автоматически**
- ✅ API endpoints отвечают корректно
- ✅ Приложение доступно через веб-браузер
- ✅ Все компоненты дашборда загружаются правильно
- ✅ API routes `/api/get_leads` и `/api/get_products` работают
- ✅ База данных инициализирована с таблицами и данными

## 🚨 **ВАЖНЫЕ ЗАМЕЧАНИЯ**

1. **Автоматическая инициализация**: База данных теперь инициализируется полностью автоматически при первом запуске
2. **Переменные окружения**: docker-compose.yml переопределяет .env файлы для Docker networking
3. **Конфигурация URL**:
   - Внешние API: Всегда используйте `https://api.hermes.uniaffcrm.com`
   - Локальная разработка: Используйте `localhost` URL
   - Docker продакшен: Используйте имена сервисов (`backend:3000`)
4. **Обработка ошибок**: API сбои теперь возвращают безопасные значения по умолчанию
5. **Конфликты портов**: Убедитесь что порты 3003, 3004, 5435, 6382 доступны на сервере
6. **Nginx конфигурация**: `/api/` идет на фронтенд, `/rules` и `/health` на бэкенд
7. **Retry логика**: Миграции и seed данные имеют встроенную retry логику для надежности
8. **Health checks**: Улучшенные health checks обеспечивают правильную последовательность запуска

## 📞 **ПОДДЕРЖКА**

Если проблемы сохраняются после следования этому руководству:

1. Проверьте логи Docker для конкретных сообщений об ошибках
2. Убедитесь что все переменные окружения установлены правильно
3. Убедитесь что нет конфликтов портов на сервере
4. Протестируйте сетевое подключение между контейнерами
5. Проверьте nginx конфигурацию и логи
6. **Проверьте логи автоматической инициализации базы данных**
