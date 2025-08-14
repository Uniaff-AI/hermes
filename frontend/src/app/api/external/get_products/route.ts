import { NextRequest } from 'next/server';
import {
  createExternalAPIUrl,
  getExternalAPIHeaders,
  handleAPIError,
  createSuccessResponse,
} from '@/shared/api/config';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = createExternalAPIUrl('get_products');

    const response = await fetch(url, {
      method: 'GET',
      headers: getExternalAPIHeaders(),
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }

    const data = await response.json();
    const products = Array.isArray(data) ? data : data.data || data;

    return createSuccessResponse(products);
  } catch (error) {
    return handleAPIError(error, 'fetch products');
  }
}
