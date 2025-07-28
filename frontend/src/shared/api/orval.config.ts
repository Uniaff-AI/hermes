import { defineConfig } from 'orval';

const schemeUrl =
  process.env.API_SCHEME_URL ||
  'https://admin-api.docs.keitaro.io/openapi.json';
const isDev = process.env.NODE_ENV !== 'production';
const baseUrl = isDev
  ? 'http://localhost:3000'
  : process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://admin-api.docs.keitaro.io';

export default defineConfig({
  hermes: {
    input: schemeUrl,
    output: {
      mode: 'tags-split',
      target: './__generated__/endpoints',
      schemas: './__generated__/models',
      client: 'zod',
      baseUrl: baseUrl,
      fileExtension: '.zod.ts',
      mock: false,
      prettier: true,
      override: {
        mutator: {
          path: './utils/fetcher.ts',
          name: 'fetcher',
        },
        query: {
          useQuery: true,
          useInfinite: true,
          useInfiniteQueryParam: 'page',
        },
      },
    },
  },
});
