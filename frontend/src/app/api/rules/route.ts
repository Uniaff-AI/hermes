import { NextRequest } from 'next/server';
import { handleAPIError, createSuccessResponse } from '@/shared/api/config';
import { CreateRuleSchema } from '@/features/rules/model/schemas';

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.uniaffcrm.com/api';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/rules`, {
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
    return handleAPIError(error, 'fetch rules');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = CreateRuleSchema.parse(body);

    const response = await fetch(`${BACKEND_BASE_URL}/api/rules`, {
      method: 'POST',
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
    return handleAPIError(error, 'create rule');
  }
}
