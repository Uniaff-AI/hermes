# API Routes Architecture

## 📁 Структура API роутов

```
src/app/api/
├── external/                    # 🌐 Внешние API (hermes.uniaffcrm.com)
│   ├── get_leads/              # Получение лидов из внешней ПП
│   ├── get_products/           # Получение продуктов из внешней ПП
│   └── get_revenue/            # Получение статистики доходов
└── internal/                   # 🏠 Внутренние API (localhost:3004)
    └── rules/                  # CRUD операции с правилами
        ├── [id]/              # Операции с конкретным правилом
        └── analytics/         # Аналитика правил
            └── overview/      # Общая аналитика
```

## 🎯 Назначение роутов

### **External API** (`/api/external/`)

Роуты для работы с внешним API `hermes.uniaffcrm.com`:

- **get_leads** - получение лидов из партнерских программ
- **get_products** - получение списка продуктов/офферов
- **get_revenue** - получение статистики доходов

### **Internal API** (`/api/internal/`)

Роуты для работы с внутренним бэкендом `localhost:3004`:

- **rules** - CRUD операции с правилами редиректов
- **rules/analytics** - аналитика отправки лидов

## 🔄 Поток данных

### Создание правила:

```
Frontend → /api/internal/rules (POST) → Backend (localhost:3004) → External API (get_leads)
```

### Получение аналитики:

```
Frontend → /api/internal/rules/analytics/overview → Backend (localhost:3004) → Database
```

### Получение статистики доходов:

```
Frontend → /api/external/get_revenue → External API (hermes.uniaffcrm.com)
```

## 🛠️ Технические детали

### External API конфигурация:

```typescript
// src/shared/api/config.ts
const API_CONFIG = {
  BASE_URL: 'https://api.hermes.uniaffcrm.com',
  EXTERNAL_API_KEY: process.env.EXTERNAL_API_KEY,
  VERSION: 'v1',
};
```

### Internal API конфигурация:

```typescript
// src/shared/api/config.ts
const INTERNAL_API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3004',
};

// createInternalAPIUrl автоматически добавляет /api к пути
const url = createInternalAPIUrl('rules/analytics/overview');
// Результат: http://localhost:3004/api/rules/analytics/overview
```

### Утилитарные функции:

#### External API:

```typescript
import {
  createExternalAPIUrl,
  getExternalAPIHeaders,
} from '@/shared/api/config';

const url = createExternalAPIUrl('get_leads');
const headers = getExternalAPIHeaders();
```

#### Internal API:

```typescript
import {
  createInternalAPIUrl,
  getInternalAPIHeaders,
} from '@/shared/api/config';

const url = createInternalAPIUrl('rules/analytics/overview');
const headers = getInternalAPIHeaders();
```

### Использование в API роутах:

```typescript
// Правила
const response = await fetch(createInternalAPIUrl(`rules/${params.id}`), {
  method: 'GET',
  headers: getInternalAPIHeaders(),
});

// Аналитика
const response = await fetch(createInternalAPIUrl('rules/analytics/overview'), {
  method: 'GET',
  headers: getInternalAPIHeaders(),
});

// Внешние API
const response = await fetch(createExternalAPIUrl('get_revenue'), {
  method: 'GET',
  headers: getExternalAPIHeaders(),
});
```

## 📊 Мониторинг

### Логирование:

- Все ошибки API логируются в консоль
- Внешние API ошибки содержат статус код
- Внутренние API ошибки содержат детали

### Кэширование:

- React Query кэширует данные на клиенте
- Аналитика обновляется каждые 30 секунд
- Статистика доходов кэшируется на 1 минуту

## 🔧 Разработка

### Добавление нового внешнего API:

1. Создать роут в `src/app/api/external/`
2. Использовать `createExternalAPIUrl()` и `getExternalAPIHeaders()`
3. Добавить обработку ошибок через `handleAPIError()`

### Добавление нового внутреннего API:

1. Создать роут в `src/app/api/internal/`
2. Использовать `createInternalAPIUrl()` и `getInternalAPIHeaders()`
3. Добавить обработку ошибок через `handleAPIError()`

### Структура роутов:

- **Внешние API**: `/api/external/[endpoint]/route.ts`
- **Внутренние API**: `/api/internal/[module]/[endpoint]/route.ts`
- **Динамические роуты**: `/api/internal/[module]/[id]/route.ts`

### Преимущества новой архитектуры:

- **DRY принцип**: Устранено дублирование кода с URL и заголовками
- **Консистентность**: Единый подход к конфигурации API
- **Поддерживаемость**: Изменения в конфигурации в одном месте
- **Типизация**: TypeScript поддержка для всех утилитарных функций
