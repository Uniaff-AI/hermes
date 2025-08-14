# Руководство по Чистой Архитектуре Системы Редиректов

## Обзор

Система редиректов лидов была полностью переработана с целью создания чистой и логичной архитектуры без технического долга.

## Новая Архитектура

### 1. Backend: Структура Данных

#### Rule Entity - Правило Редиректа

```typescript
class Rule {
  // === ОСНОВНЫЕ НАСТРОЙКИ ===
  id: string; // UUID правила
  name: string; // Название правила
  isActive: boolean; // Статус активности
  dailyCapLimit: number; // Дневной лимит отправок

  // === ЛИД ФИЛЬТРЫ (get_leads критерии) ===
  leadStatus?: string; // Статус лидов (Sale, Lead, Reject, ALL)
  leadVertical?: string; // Вертикаль для фильтрации
  leadCountry?: string; // Страна (ISO код)
  leadAffiliate?: string; // Партнерская программа
  leadDateFrom?: string; // Начало периода фильтрации
  leadDateTo?: string; // Конец периода фильтрации

  // === ЦЕЛЕВОЙ ПРОДУКТ (куда отправляем) ===
  targetProductId: string; // ID целевого продукта
  targetProductName: string; // Название целевого продукта
  targetProductVertical?: string; // Вертикаль целевого продукта
  targetProductCountry?: string; // Страна целевого продукта
  targetProductAffiliate?: string; // ПП целевого продукта

  // === НАСТРОЙКИ ОТПРАВКИ ===
  minIntervalMinutes: number; // Мин. интервал (минуты)
  maxIntervalMinutes: number; // Макс. интервал (минуты)
  isInfinite: boolean; // Отправка без временных ограничений
  sendWindowStart?: string; // Начало временного окна (HH:MM)
  sendWindowEnd?: string; // Конец временного окна (HH:MM)

  // === МЕТАДАННЫЕ ===
  createdAt: Date;
  updatedAt: Date;
}
```

#### LeadSending Entity - Лог Отправки

```typescript
class LeadSending {
  id: string;
  ruleId: string;

  // === ДАННЫЕ ЛИДА (маскированные) ===
  leadSubid: string; // ID лида из внешней системы
  leadName: string; // Имя лида
  leadPhone: string; // Телефон (маскированный)
  leadEmail?: string; // Email (опционально)
  leadCountry?: string; // Страна лида

  // === ЦЕЛЕВОЙ ПРОДУКТ ===
  targetProductId: string; // ID продукта, куда отправлен
  targetProductName: string; // Название продукта

  // === РЕЗУЛЬТАТ ===
  status: LeadSendingStatus; // SUCCESS | ERROR | PENDING | RETRY
  responseStatus?: number; // HTTP статус
  errorDetails?: string; // Детали ошибки
  externalResponseId?: string; // ID ответа от целевой системы

  // === МЕТАДАННЫЕ ===
  sentAt: Date;
  attemptNumber: number; // Номер попытки
  responseTimeMs?: number; // Время ответа в мс
}
```

### 2. Frontend: Трехсекционная Архитектура

#### Секция 1: Название Правила

- `name` - название правила

#### Секция 2: Определение Лида (get_leads фильтры)

```typescript
leadFilters: {
  status: string; // Статус лидов для фильтрации
  vertical: string; // Вертикаль для фильтрации
  country: string; // Страна для фильтрации
  aff: string; // ПП для фильтрации
  dateFrom: string; // Начало периода
  dateTo: string; // Конец периода
}
```

#### Секция 3: Целевой Продукт (get_products)

```typescript
targetProduct: {
  productId: string; // ID целевого продукта
  productName: string; // Название целевого продукта
  vertical: string; // Вертикаль целевого продукта
  country: string; // Страна целевого продукта
  aff: string; // ПП целевого продукта
}
```

#### Секция 4: Настройки Отправки

```typescript
sendingSettings: {
  dailyCapLimit: string; // Дневной лимит
  minInterval: string; // Мин. интервал
  maxInterval: string; // Макс. интервал
  isInfinite: boolean; // Бесконечная отправка
  sendWindowStart: string; // Начало окна
  sendWindowEnd: string; // Конец окна
  isActive: boolean; // Активность правила
}
```

## Логика Работы

### 1. Создание Правила

1. **Пользователь задает название** (Секция 1)
2. **Настраивает фильтры лидов** (Секция 2) - определяет, какие лиды брать из CRM
3. **Выбирает целевой продукт** (Секция 3) - куда направлять отобранные лиды
4. **Настраивает параметры отправки** (Секция 4) - когда и как часто отправлять

### 2. Выполнение Правила

1. **Фильтрация лидов**: система использует `leadFilters` для вызова `get_leads` API
2. **Отправка лидов**: каждый отобранный лид отправляется на `targetProduct` через `add_lead` API
3. **Логирование**: все попытки записываются в `LeadSending` для мониторинга

### 3. Мониторинг

- **Аналитика**: статистика по правилам и отправкам
- **Системный монитор**: состояние системы в реальном времени
- **Логи**: детальная информация о каждой отправке

## Преимущества Новой Архитектуры

### ✅ Четкое Разделение Ответственности

- **Лид фильтры** отвечают только за отбор лидов
- **Целевой продукт** отвечает только за назначение
- **Настройки отправки** отвечают только за временные параметры

### ✅ Безопасность

- Маскирование PII данных в логах
- Валидация входных данных на уровне DTO
- Предотвращение SQL инъекций и DoS атак

### ✅ Производительность

- Индексы на ключевые поля для быстрых запросов
- Эффективная структура данных без дублирования
- Оптимизированные запросы с select полей

### ✅ Удобство Использования

- Интуитивная трехсекционная форма
- Автозаполнение полей при выборе продукта
- Понятная логика создания и редактирования правил

### ✅ Масштабируемость

- Чистая структура без технического долга
- Готовность к добавлению новых функций
- Легкая поддержка и развитие

## Миграция Данных

### 1. Автоматическая Миграция

```sql
-- Новые поля создаются с маппингом старых данных
leadStatus ← status
leadVertical ← vertical
leadCountry ← country
leadAffiliate ← aff
leadDateFrom ← dateFrom
leadDateTo ← dateTo
targetProductId ← productId
targetProductName ← productName
minIntervalMinutes ← minInterval
maxIntervalMinutes ← maxInterval
```

### 2. Безопасное Удаление Устаревших Полей

Устаревшие поля пока оставлены для совместимости. Их можно удалить после полного тестирования новой системы, выполнив миграцию `RemoveDeprecatedFields`.

## Тестирование

### 1. Unit Tests

- Валидация DTO
- Логика сервисов
- Маппинг данных

### 2. Integration Tests

- API endpoints
- Database operations
- External API calls

### 3. E2E Tests

- Полный цикл создания правила
- Выполнение правил
- Мониторинг результатов

## Заключение

Новая архитектура предоставляет:

- **Понятную логику** создания и редактирования правил
- **Безопасную обработку** данных
- **Эффективную производительность**
- **Простоту поддержки** и развития

Система готова к продуктивному использованию и дальнейшему развитию.
