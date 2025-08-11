import { NextRequest } from 'next/server';
import {
  handleAPIError,
  createSuccessResponse,
  createInternalAPIUrl,
  getInternalAPIHeaders,
} from '@/shared/api/config';
import { UpdateRuleSchema } from '@/features/rules/model/schemas';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(createInternalAPIUrl(`rules/${params.id}`), {
      method: 'GET',
      headers: getInternalAPIHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return createSuccessResponse(data);
  } catch (error) {
    return handleAPIError(error, 'fetch rule');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const validatedData = UpdateRuleSchema.parse(body);

    const response = await fetch(createInternalAPIUrl(`rules/${params.id}`), {
      method: 'PATCH',
      headers: getInternalAPIHeaders(),
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return createSuccessResponse(data);
  } catch (error) {
    return handleAPIError(error, 'update rule');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(createInternalAPIUrl(`rules/${params.id}`), {
      method: 'DELETE',
      headers: getInternalAPIHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    return createSuccessResponse({ id: params.id });
  } catch (error) {
    return handleAPIError(error, 'delete rule');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const action = request.nextUrl.searchParams.get('action');

    if (action === 'test') {
      const response = await fetch(
        createInternalAPIUrl(`rules/${params.id}/test`),
        {
          method: 'POST',
          headers: getInternalAPIHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const data = await response.json();
      return createSuccessResponse(data);
    }

    if (action === 'trigger') {
      const response = await fetch(
        createInternalAPIUrl(`rules/${params.id}/trigger`),
        {
          method: 'POST',
          headers: getInternalAPIHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const data = await response.json();
      return createSuccessResponse(data);
    }

    throw new Error('Invalid action parameter');
  } catch (error) {
    return handleAPIError(error, 'rule action');
  }
}
