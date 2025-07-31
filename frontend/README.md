# Hermes CRM - Frontend

The frontend application for Hermes CRM, built with Next.js 14, React 18, and TypeScript. This application provides the user interface for managing leads, offers, and business rules.

## 🏗️ Architecture

### **Technology Stack**

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **TanStack Query** - Data fetching and caching
- **Zod** - Schema validation
- **Orval** - API client generation

### **Project Structure**

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── shared/             # Shared utilities and API
│   └── api/            # Generated API client
├── lib/                # Utility functions
└── styles/             # Global styles
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- PNPM >= 8.0.0

### Development

```bash
# Install dependencies (from root)
pnpm install

# Start development server
pnpm frontend:dev

# Or from frontend directory
cd frontend
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building

```bash
# Build for production
pnpm frontend:build

# Start production server
pnpm frontend:start
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev                 # Start development server
pnpm build              # Build for production
pnpm start              # Start production server

# Code Quality
pnpm lint               # Run ESLint
pnpm lint:fix           # Fix linting issues
pnpm typecheck          # Type check TypeScript
pnpm format             # Format code with Prettier

# Testing
pnpm test               # Run tests
pnpm test:watch         # Run tests in watch mode

# API Generation
pnpm generate:api       # Generate API client from OpenAPI spec
```

## 🔌 API Integration

The frontend automatically generates TypeScript API clients from the backend OpenAPI specification using Orval.

### **Generated API Client**

- **Location**: `src/shared/api/__generated__/`
- **Generation**: Run `pnpm generate:api` after backend changes
- **Usage**: Import from `src/shared/api/endpoints/`

### **Example Usage**

```typescript
import { useGetLeads } from '@/shared/api/endpoints/leads';

function LeadsList() {
  const { data: leads, isLoading } = useGetLeads();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {leads?.map(lead => (
        <div key={lead.id}>{lead.name}</div>
      ))}
    </div>
  );
}
```

## 🎨 UI Components

The application uses a component library built with:

- **Radix UI** - Accessible primitives
- **Tailwind CSS** - Styling
- **Class Variance Authority** - Component variants
- **Lucide React** - Icons

### **Component Structure**

```
components/
├── ui/                 # Base UI components
├── dashboard/          # Dashboard-specific components
├── layout/            # Layout components
└── leadsManagement/   # Feature-specific components
```

## 🔧 Configuration

### **Environment Variables**

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Hermes CRM
```

### **Tailwind Configuration**

- **Config**: `tailwind.config.ts`
- **Customization**: CSS variables for theming
- **Plugins**: Forms, typography

## 🧪 Testing

The application uses Jest and React Testing Library for testing:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## 📦 Deployment

### **Vercel (Recommended)**

The application is configured for Vercel deployment with:

- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Node Version**: 18.x

### **Other Platforms**

The application can be deployed to any platform that supports Next.js:

- **Netlify**
- **Railway**
- **Docker**

## 🤝 Contributing

1. Follow the established component patterns
2. Use TypeScript for all new code
3. Add proper error handling and loading states
4. Write tests for new components
5. Update API client when backend changes

## 📝 License

MIT License - see LICENSE file for details.
