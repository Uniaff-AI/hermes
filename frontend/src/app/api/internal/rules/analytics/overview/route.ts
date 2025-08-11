import { NextRequest } from 'next/server';
import {
  handleAPIError,
  createSuccessResponse,
  createInternalAPIUrl,
  getInternalAPIHeaders,
} from '@/shared/api/config';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(
      createInternalAPIUrl('rules/analytics/overview'),
      {
        method: 'GET',
        headers: getInternalAPIHeaders(),
        next: { revalidate: 60 }, // Cache for 60 seconds
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
