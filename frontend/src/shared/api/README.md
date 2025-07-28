# Generated API Documentation

This directory contains automatically generated TypeScript types and API functions using [Orval](https://orval.dev/).

## 📁 Structure

```
src/shared/api/
├── __generated__/
│   ├── endpoints/          # Generated API functions
│   │   ├── campaigns/      # Campaign-related API calls
│   │   ├── offers/         # Offer-related API calls
│   │   ├── domains/        # Domain-related API calls
│   │   └── ...            # Other API endpoints
│   ├── models/            # Generated TypeScript types
│   └── index.ts           # Main export file
├── utils/
│   └── fetcher.ts         # Custom fetch implementation
├── orval.config.ts        # Orval configuration
└── README.md              # This file
```

## 🚀 Usage

### Basic API Call

```typescript
import { getCampaigns, type Campaign } from '@/shared/api/__generated__';

// Fetch campaigns
const response = await getCampaigns();
const campaigns: Campaign[] = response.data;
```

### With React Query

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCampaigns,
  postCampaigns,
  type Campaign,
  type PostCampaignsBody,
} from '@/shared/api/__generated__';

// Query for fetching data
const {
  data: campaigns,
  isLoading,
  error,
} = useQuery({
  queryKey: ['campaigns'],
  queryFn: async () => {
    const response = await getCampaigns();
    return response.data;
  },
});

// Mutation for creating data
const createCampaignMutation = useMutation({
  mutationFn: async (newCampaign: PostCampaignsBody) => {
    const response = await postCampaigns(newCampaign);
    return response.data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
  },
});
```

### Response Types

All API functions return strongly typed responses with status codes:

```typescript
// Example response type for getCampaigns
type getCampaignsResponse =
  | { data: Campaign[]; status: 200; headers: Headers }
  | { data: BadRequestResponse; status: 400; headers: Headers }
  | { data: UnauthorizedResponse; status: 401; headers: Headers }
  | { data: PaymentRequiredResponse; status: 402; headers: Headers }
  | { data: InternalErrorResponse; status: 500; headers: Headers };

// Usage
const response = await getCampaigns();
if (response.status === 200) {
  // Success - response.data is Campaign[]
  const campaigns = response.data;
} else {
  // Error - response.data contains error details
  console.error('Error:', response.data);
}
```

### Available Endpoints

The following API endpoints are available:

- **Campaigns**: `getCampaigns`, `postCampaigns`, `putCampaignsId`, `deleteCampaignsId`
- **Offers**: `getOffers`, `postOffers`, `putOffersId`, `deleteOffersId`
- **Domains**: `getDomains`, `postDomains`, `putDomainsId`, `deleteDomainsId`
- **Landing Pages**: `getLandingPages`, `postLandingPages`, `putLandingPagesId`
- **Users**: `getUsers`, `postUsers`, `putUsersId`
- **Groups**: `getGroups`, `postGroups`, `putGroupsId`
- **Clicks**: `postClicksLog`, `postClicksUpdateCosts`
- **Conversions**: `postConversionsLog`
- **Reports**: `getReports`
- **And many more...**

### Type Safety

All API functions are fully typed with TypeScript:

```typescript
// Request types
type PostCampaignsBody = {
  name: string;
  alias: string;
  // ... other required fields
};

// Response types
type Campaign = {
  id: number;
  name: string;
  alias: string;
  state: string;
  // ... other fields
};

// Error handling
const response = await getCampaigns();
if (response.status === 200) {
  // Success - response.data is Campaign[]
} else {
  // Error - response.data contains error details
}
```

## 🔧 Configuration

### Environment Variables

Set these environment variables in your `.env.local`:

```bash
NEXT_PUBLIC_API_ENDPOINT=https://admin-api.docs.keitaro.io
API_SCHEME_URL=https://admin-api.docs.keitaro.io/openapi.json
```

### Authentication

The fetcher automatically includes authentication headers from localStorage:

```typescript
// The fetcher will automatically add:
// Authorization: Bearer ${localStorage.getItem('accessToken')}
```

## 📝 Regenerating API

When the backend API changes, regenerate the types:

```bash
# Generate once
pnpm generate:api

# Watch for changes (development)
pnpm generate:api:watch
```

## 🎯 Best Practices

### 1. Use React Query for State Management

```typescript
// ✅ Good - Uses React Query for caching and state management
const { data, isLoading, error } = useQuery({
  queryKey: ['campaigns'],
  queryFn: () => getCampaigns().then((res) => res.data),
});

// ❌ Avoid - Direct API calls without caching
const [campaigns, setCampaigns] = useState([]);
useEffect(() => {
  getCampaigns().then((res) => setCampaigns(res.data));
}, []);
```

### 2. Handle Loading and Error States

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['campaigns'],
  queryFn: () => getCampaigns().then(res => res.data),
});

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
if (!data) return <div>No data</div>;

return <div>{/* Render data */}</div>;
```

### 3. Use Mutations for Data Changes

```typescript
const queryClient = useQueryClient();

const createMutation = useMutation({
  mutationFn: postCampaigns,
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
  },
  onError: (error) => {
    // Handle errors
    console.error('Failed to create campaign:', error);
  },
});
```

### 4. Type Your Components

```typescript
import type { Campaign } from '@/shared/api/__generated__';

interface CampaignListProps {
  campaigns: Campaign[];
  onSelect: (campaign: Campaign) => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({
  campaigns,
  onSelect,
}) => {
  // Component implementation
};
```

## 🔍 Troubleshooting

### Common Issues

1. **TypeScript Errors**: Make sure to run `npm run generate:api` after API changes
2. **Authentication Errors**: Check that `accessToken` is set in localStorage
3. **Network Errors**: Verify `NEXT_PUBLIC_API_ENDPOINT` is correct
4. **Build Errors**: Ensure all generated files are committed to git

### Debugging

Enable React Query DevTools in development:

```typescript
// Already configured in src/app/providers.tsx
<ReactQueryDevtools initialIsOpen={false} />
```

## 📚 Examples

See `src/components/examples/CampaignsExample.tsx` for a complete example of using the generated API with React Query.
