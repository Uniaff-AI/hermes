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
    const { searchParams } = new URL(request.url);

    const queryParams = new URLSearchParams();

    const vertical = searchParams.get('vertical');
    if (vertical) queryParams.append('vertical', vertical);

    const country = searchParams.get('country');
    if (country) queryParams.append('country', country);

    const aff = searchParams.get('aff');
    if (aff) queryParams.append('aff', aff);

    const baseUrl = createExternalAPIUrl('get_products');
    const url = queryParams.toString()
      ? `${baseUrl}?${queryParams.toString()}`
      : baseUrl;

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
