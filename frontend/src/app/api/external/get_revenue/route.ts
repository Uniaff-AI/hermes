import { NextRequest } from 'next/server';
import {
  createExternalAPIUrl,
  getExternalAPIHeaders,
  handleAPIError,
  createSuccessResponse,
} from '@/shared/api/config';

export async function GET(request: NextRequest) {
  try {
    const url = createExternalAPIUrl('get_revenue');

    const response = await fetch(url, {
      method: 'GET',
      headers: getExternalAPIHeaders(),
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }

    const data = await response.json();
    const responseData = data.data || data;

    return createSuccessResponse(responseData);
  } catch (error) {
    return handleAPIError(error, 'fetch revenue data');
  }
}
