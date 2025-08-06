import {
  createExternalAPIUrl,
  getExternalAPIHeaders,
  handleAPIError,
  createSuccessResponse,
} from '@/shared/api/config';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Validate that required environment variables are available
    const apiUrl =
      process.env.API_SCHEME_URL || process.env.NEXT_PUBLIC_API_ENDPOINT;
    const apiKey = process.env.EXTERNAL_API_KEY;

    if (!apiUrl || !apiKey) {
      console.warn('Missing required environment variables for external API');
      console.warn('API_SCHEME_URL:', apiUrl ? 'SET' : 'MISSING');
      console.warn('EXTERNAL_API_KEY:', apiKey ? 'SET' : 'MISSING');

      // During build time, return empty array instead of failing
      if (process.env.NODE_ENV === 'production') {
        console.warn(
          'Returning empty products array due to missing environment variables'
        );
        return createSuccessResponse([]);
      }

      return NextResponse.json(
        {
          success: false,
          message: 'External API configuration is missing',
          error: 'MISSING_CONFIG',
        },
        { status: 500 }
      );
    }

    const url = createExternalAPIUrl('get_products');
    const headers = getExternalAPIHeaders();

    console.log('Fetching products from:', url);
    console.log('Headers:', { ...headers, 'X-API-KEY': '[REDACTED]' });

    const response = await fetch(url, {
      headers,
      // Add timeout for better error handling
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      // For 400 errors during static generation, return empty array instead of failing
      if (response.status === 400 && process.env.NODE_ENV === 'production') {
        console.warn(
          '400 error during static generation - returning empty products array'
        );
        return createSuccessResponse([]);
      }

      throw new Error(`External API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return createSuccessResponse(data);
  } catch (error) {
    // Handle timeout and network errors specifically
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('Request timeout when fetching products');
        return NextResponse.json(
          {
            success: false,
            message: 'Request timeout - external API is not responding',
            error: 'TIMEOUT',
          },
          { status: 408 }
        );
      }

      if (error.message.includes('fetch')) {
        console.error('Network error when fetching products:', error.message);
        return NextResponse.json(
          {
            success: false,
            message: 'Network error - unable to reach external API',
            error: 'NETWORK_ERROR',
          },
          { status: 503 }
        );
      }
    }

    return handleAPIError(error, 'fetch products');
  }
}
