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
      console.error(
        'get_leads route - External API error:',
        response.status,
        response.statusText
      );
      throw new Error(
        `External API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log('get_leads route - External API response:', data);

    let responseData: any;

    // Handle different response formats from external API
    if (Array.isArray(data)) {
      responseData = data;
    } else if (data && typeof data === 'object') {
      // If data is an object, check for nested data or leads
      if (data.data && Array.isArray(data.data)) {
        responseData = data.data;
      } else if (data.leads && Array.isArray(data.leads)) {
        responseData = data.leads;
      } else if (
        data.data &&
        data.data.leads &&
        Array.isArray(data.data.leads)
      ) {
        responseData = data.data.leads;
      } else {
        // If no recognizable structure, return the whole object
        responseData = data;
      }
    } else {
      responseData = data;
    }

    console.log('get_leads route - Processed response data:', responseData);

    return createSuccessResponse(responseData);
  } catch (error) {
    return handleAPIError(error, 'fetch leads');
  }
}
