# Hermes CRM - API Documentation

```
http://localhost:3001/api
```

## Аутентификация

### Получение токена

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "SUPERADMIN"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Использование токена

Добавьте заголовок `Authorization` к запросам:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Общие форматы ответов

### Успешный ответ
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Ответ с ошибкой
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": { ... }
  }
}
```

### Пагинированный ответ
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

## Эндпоинты

### Аутентификация

#### POST /api/auth/login
Вход в систему.

**Тело запроса:**
```json
{
  "email": "string",
  "password": "string"
}
```

#### POST /api/auth/refresh
Обновление токена доступа.

**Тело запроса:**
```json
{
  "refreshToken": "string"
}
```

#### GET /api/auth/me
Получение профиля текущего пользователя.

### Лиды

#### GET /api/leads
Получение списка лидов с фильтрацией и пагинацией.

**Параметры запроса:**
- `page` (number) - номер страницы (по умолчанию: 1)
- `limit` (number) - количество элементов на странице (по умолчанию: 20)
- `status` (string) - фильтр по статусу
- `source` (string) - фильтр по источнику
- `search` (string) - поиск по имени или email
- `dateFrom` (string) - дата начала (ISO 8601)
- `dateTo` (string) - дата окончания (ISO 8601)

**Пример:**
```http
GET /api/leads?page=1&limit=20&status=NEW&search=john
```

#### POST /api/leads
Создание нового лида.

**Тело запроса:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "source": "website",
  "notes": "Interested in premium offer",
  "offerId": "offer-123"
}
```

#### GET /api/leads/:id
Получение лида по ID.

#### PUT /api/leads/:id
Обновление лида.

**Тело запроса:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "status": "CONTACTED",
  "notes": "Updated notes"
}
```

#### DELETE /api/leads/:id
Удаление лида.

### Офферы

#### GET /api/offers
Получение списка офферов.

**Параметры запроса:**
- `page` (number) - номер страницы
- `limit` (number) - количество элементов
- `status` (string) - фильтр по статусу
- `category` (string) - фильтр по категории
- `search` (string) - поиск по названию

#### POST /api/offers
Создание нового оффера.

**Тело запроса:**
```json
{
  "name": "Premium Package",
  "description": "Best value for money",
  "price": 99.99,
  "currency": "USD",
  "category": "premium",
  "tags": ["featured", "popular"],
  "keitaroCampaignId": "campaign-123"
}
```

#### GET /api/offers/:id
Получение оффера по ID.

#### PUT /api/offers/:id
Обновление оффера.

#### DELETE /api/offers/:id
Удаление оффера.

### Редиректы

#### GET /api/redirects
Получение списка редиректов.

#### POST /api/redirects
Создание нового редиректа.

**Тело запроса:**
```json
{
  "name": "US Traffic Redirect",
  "description": "Redirect US traffic to premium offer",
  "rules": [
    {
      "name": "US Country Rule",
      "conditions": [
        {
          "field": "country",
          "operator": "equals",
          "value": "US"
        }
      ],
      "actions": [
        {
          "type": "redirect",
          "targetUrl": "https://example.com/premium",
          "offerId": "offer-123"
        }
      ],
      "priority": 1
    }
  ]
}
```

#### POST /api/redirects/apply
Применение правил редиректа.

**Тело запроса:**
```json
{
  "url": "https://example.com/landing",
  "params": {
    "utm_source": "google",
    "utm_campaign": "summer"
  },
  "headers": {
    "User-Agent": "Mozilla/5.0...",
    "Accept-Language": "en-US"
  },
  "ip": "192.168.1.1"
}
```

### Аналитика

#### GET /api/analytics/redirects
Получение аналитики редиректов.

**Параметры запроса:**
- `period` (string) - период (day, week, month)
- `dateFrom` (string) - дата начала
- `dateTo` (string) - дата окончания

#### GET /api/analytics/leads
Получение аналитики лидов.

#### GET /api/analytics/offers
Получение аналитики офферов.

### Дашборд

#### GET /api/dashboard/stats
Получение общей статистики для дашборда.

**Ответ:**
```json
{
  "success": true,
  "data": {
    "totalLeads": 1250,
    "activeLeads": 450,
    "totalOffers": 25,
    "activeOffers": 18,
    "totalRedirects": 15,
    "conversions": 89,
    "revenue": 12500.50
  }
}
```

#### GET /api/dashboard/charts
Получение данных для графиков.

### Keitaro интеграция

#### POST /api/keitaro/webhook
Вебхук от Keitaro для обработки конверсий.

**Тело запроса:**
```json
{
  "click_id": "click-123",
  "campaign_id": "campaign-456",
  "offer_id": "offer-789",
  "sub_id": "lead-123",
  "payout": 25.50,
  "currency": "USD",
  "status": "approved",
  "timestamp": 1640995200
}
```

#### GET /api/keitaro/stats
Получение статистики из Keitaro.

## Коды ошибок

| Код | Описание |
|-----|----------|
| `VALIDATION_ERROR` | Ошибка валидации данных |
| `UNAUTHORIZED` | Не авторизован |
| `FORBIDDEN` | Доступ запрещен |
| `NOT_FOUND` | Ресурс не найден |
| `CONFLICT` | Конфликт данных |
| `INTERNAL_ERROR` | Внутренняя ошибка сервера |

## Статусы HTTP

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 201 | Ресурс создан |
| 400 | Неверный запрос |
| 401 | Не авторизован |
| 403 | Доступ запрещен |
| 404 | Не найден |
| 409 | Конфликт |
| 422 | Ошибка валидации |
| 500 | Внутренняя ошибка сервера |


## Версионирование

API использует версионирование через URL. Текущая версия: v1

```
/api/v1/leads
```