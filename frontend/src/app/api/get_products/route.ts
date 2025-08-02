import {
  createExternalAPIUrl,
  getExternalAPIHeaders,
  handleAPIError,
  createSuccessResponse,
} from '@/shared/api/config';

export async function GET() {
  try {
    const response = await fetch(createExternalAPIUrl('get_products/'), {
      headers: getExternalAPIHeaders(),
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }

    const data = await response.json();
    return createSuccessResponse(data);
  } catch (error) {
    return handleAPIError(error, 'fetch products');
  }
}
