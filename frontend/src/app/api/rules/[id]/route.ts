import { NextRequest } from 'next/server';
import { handleAPIError, createSuccessResponse } from '@/shared/api/config';
import { UpdateRuleSchema } from '@/features/rules/model/schemas';

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.uniaffcrm.com/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/rules/${params.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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

    const response = await fetch(`${BACKEND_BASE_URL}/api/rules/${params.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(`${BACKEND_BASE_URL}/api/rules/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    return createSuccessResponse({ id: params.id });
  } catch (error) {
    return handleAPIError(error, 'delete rule');
  }
}
