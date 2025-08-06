import { NextRequest } from 'next/server';
import {
  createExternalAPIUrl,
  getExternalAPIHeaders,
  handleAPIError,
  createSuccessResponse,
} from '@/shared/api/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(createExternalAPIUrl('get_leads'), {
      method: 'POST',
      headers: getExternalAPIHeaders(),
      body: JSON.stringify(body),
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
