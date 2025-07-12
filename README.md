# Hermes CRM

Модульная CRM-система с архитектурой модульного монолита, состоящая из фронтенда на Next.js и бэкенда на NestJS.

## Архитектура

### Модули бэкенда (NestJS)
- **Dashboard** - модуль дашборда с сводной аналитикой
- **Leads** - модуль управления лидами
- **Offers** - модуль управления офферами
- **Redirects** - модуль системы редиректов
- **RedirectAnalytics** - модуль аналитики редиректов
- **Auth** - модуль аутентификации и управления пользователями
- **KeitaroIntegration** - модуль интеграции с Keitaro

### Фронтенд (Next.js)
- App Router с поддержкой мультиязычности
- Модульная структура компонентов
- Интеграция с NestJS API

## Структура проекта

```
hermes/
├── frontend/          # Next.js приложение
├── backend/           # NestJS приложение
├── shared/            # Общие типы и утилиты
└── docs/              # Документация
```

## Быстрый старт

1. Установка зависимостей:
```bash
npm install
```

2. Запуск в режиме разработки:
```bash
npm run dev
```

3. Отдельный запуск:
```bash
# Только бэкенд
npm run dev:backend

# Только фронтенд
npm run dev:frontend
```

## Технологии

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeScript, PostgreSQL, Redis
- **Auth**: JWT, bcrypt
- **i18n**: next-intl, 
- **Testing**: Jest, React Testing Library 