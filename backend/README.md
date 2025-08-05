# Hermes CRM - Monorepo

Hermes CRM is a modern CRM system designed for managing leads, offers, dashboards, and more. The project is split into two main applications: **Backend (NestJS)** and **Frontend (Next.js)**.

This monorepo is being cleaned up and restructured to avoid workspace-related issues and to keep everything simple, maintainable, and beautiful.

---

## ✨ Features

✅ Clean architecture  
✅ TypeScript everywhere  
✅ NestJS 10+ backend
✅ PostgreSQL with TypeORM  
✅ Environment variables validation  
✅ Docker and Docker Compose support  
✅ ESLint + Prettier for code style  
✅ Fully typed API and DTOs  
✅ Ready for production deployment

---

## 📂 Project Structure

src/
├── app.module.ts
├── modules
│ ├── dashboard
│ ├── leads
│ ├── offers
│ ├── redirects
│ ├── redirect-analytics
│ └── auth
├── common
├── config
├── database
└── utils

## 💻 Installation

### 1. Clone the Repository

```bash
git clone https://your-repo-url.git
cd hermes/unions-starters/hermes/backend

npm install
# or if you prefer yarn
yarn install


DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=hermes_db

JWT_SECRET=my_super_secret

docker-compose up --build
```
