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
- **Framer Motion** - Animations

### **Project Structure**

```
src/
├── app/                 # Next.js App Router pages & API routes
│   └── api/            # API proxy routes
├── features/           # Feature-based modules
│   ├── offers/
│   │   ├── api/        # Offers-specific API hooks & schemas
│   │   ├── components/ # Offers UI components
│   │   └── types/      # Offers type definitions
│   └── leads/
│       ├── api/        # Leads-specific API hooks & schemas
│       ├── components/ # Leads UI components
│       └── types/      # Leads type definitions
├── shared/             # Shared utilities
│   ├── api/           # Common API utilities & config
│   ├── model/         # HTTP client
│   ├── providers/     # React providers
│   ├── types/         # Global type definitions
│   └── ui/            # Reusable UI components
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
```

## 🔌 API Integration

The frontend uses a modular API architecture with feature-specific API modules and shared utilities.

### **API Architecture**

- **Shared API Config**: Common configuration and utilities
- **Feature-specific APIs**: Each feature has its own API module
- **React Query Integration**: Automatic caching and error handling
- **Zod Validation**: Runtime type checking for API responses

### **API Proxy Pattern**

External API calls are proxied through Next.js API routes:

```
Frontend -> /api/get_products/ -> External API
Frontend -> /api/get_leads/ -> External API
```

### **Example Usage**

```typescript
// Offers feature
import { useProducts } from '@/features/offers/api/hooks';

function OffersList() {
  const { data: products, isLoading } = useProducts();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {products?.map(product => (
        <div key={product.productId}>{product.productName}</div>
      ))}
    </div>
  );
}

// Leads feature
import { useLeads } from '@/features/leads/api/hooks';

function LeadsList() {
  const { data: leads, isLoading } = useLeads({ status: 'New' });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {leads?.map(lead => (
        <div key={lead.subid}>{lead.name}</div>
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
- **Framer Motion** - Animations

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

Create a `.env.development` file in the frontend directory:

```env
API_SCHEME_URL=https://api.hermes.uniaffcrm.com
API_KEY=your_api_key_here

NEXT_PUBLIC_BASE_URL=/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_ENDPOINT=https://api.hermes.uniaffcrm.com
```

### **React Query Setup**

The application uses React Query for data fetching. Wrap your app with the QueryProvider:

```typescript
import { QueryProvider } from '@/shared/providers/QueryProvider';

export default function RootLayout({ children }) {
  return (
    <QueryProvider>
      {children}
    </QueryProvider>
  );
}
```

## 📂 Feature Modules

Each feature is organized as a self-contained module:

```
features/[feature]/
├── api/
│   ├── schemas.ts     # Zod schemas & types
│   ├── hooks.ts       # React Query hooks
│   └── index.ts       # API exports
├── components/        # Feature components
├── types/             # Type definitions
└── index.ts          # Feature exports
```

### **Benefits of Modular Structure**

- **Separation of Concerns**: Each feature manages its own API logic
- **Type Safety**: Feature-specific types and validation
- **Reusability**: Shared utilities for common patterns
- **Maintainability**: Clear boundaries between features

## 🤝 Contributing

1. Follow the modular architecture patterns
2. Use TypeScript for all new code
3. Add proper error handling and loading states
4. Create feature-specific API modules for new features
5. Use Zod schemas for API validation

## 📝 License

MIT License - see LICENSE file for details.
