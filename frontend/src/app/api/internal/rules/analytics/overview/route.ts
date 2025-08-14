import { NextRequest } from 'next/server';
import {
  handleAPIError,
  createSuccessResponse,
  createInternalAPIUrl,
  getInternalAPIHeaders,
} from '@/shared/api/config';

// Ensure this route is dynamic and doesn't cache
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(
      createInternalAPIUrl('rules/analytics/overview'),
      {
        method: 'GET',
        headers: getInternalAPIHeaders(),
        cache: 'no-store', // Don't cache to get fresh data
      }
    );

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return createSuccessResponse(data);
  } catch (error) {
    return handleAPIError(error, 'fetch analytics data');
  }
}
