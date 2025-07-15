# Используем официальный Node.js образ
FROM node:18-alpine AS builder

# Устанавливаем рабочую директорию в корне монорепозитория
WORKDIR /app

# Копируем всё содержимое репозитория (кроме node_modules и build-артефактов)
COPY . .

RUN corepack enable && corepack prepare yarn@3.6.4 --activate && yarn install --immutable

WORKDIR /app/backend
RUN npx nest build

# ---
# Production image
FROM node:18-alpine AS production
WORKDIR /app

# Копируем только необходимые артефакты из builder
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package.json ./package.json
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/shared ./shared

EXPOSE 3001
CMD ["node", "dist/main.js"] 