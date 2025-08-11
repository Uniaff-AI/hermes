import { NextRequest } from 'next/server';
import {
  createExternalAPIUrl,
  getExternalAPIHeaders,
  handleAPIError,
  createSuccessResponse,
} from '@/shared/api/config';

// Force dynamic rendering since this route handles query parameters
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryParams = new URLSearchParams();

    const paramMapping: Record<string, string> = {
      vertical: 'vertical',
      country: 'country',
      status: 'status',
      aff: 'aff',
      dateFrom: 'dateFrom',
      dateTo: 'dateTo',
    };

    Object.entries(paramMapping).forEach(([frontendParam, backendParam]) => {
      const value = searchParams.get(frontendParam);
      if (value && value.trim() !== '') {
        queryParams.append(backendParam, value);
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
      throw new Error(
        `External API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const responseData = Array.isArray(data) ? data : data.data || data;

    return createSuccessResponse(responseData);
  } catch (error) {
    return handleAPIError(error, 'fetch leads');
  }
}
