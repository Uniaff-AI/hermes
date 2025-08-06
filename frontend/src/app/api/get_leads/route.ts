import { NextRequest } from 'next/server';
import {
  createExternalAPIUrl,
  getExternalAPIHeaders,
  handleAPIError,
  createSuccessResponse,
} from '@/shared/api/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryParams = new URLSearchParams();

    const validParams = [
      'vertical',
      'country',
      'status',
      'productName',
      'dateFrom',
      'dateTo',
    ];
    validParams.forEach((param) => {
      const value = searchParams.get(param);
      if (value) {
        queryParams.append(param, value);
      }
    });

    const url = createExternalAPIUrl('get_leads');
    const finalUrl = queryParams.toString()
      ? `${url}?${queryParams.toString()}`
      : url;

    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: getExternalAPIHeaders(),
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }

    const data = await response.json();
    const responseData = Array.isArray(data) ? data : data.data || data;

    return createSuccessResponse(responseData);
  } catch (error) {
    return handleAPIError(error, 'fetch leads');
  }
}
