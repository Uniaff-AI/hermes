import { NextRequest } from 'next/server';
import {
  handleAPIError,
  createSuccessResponse,
  createInternalAPIUrl,
  getInternalAPIHeaders,
} from '@/shared/api/config';
import { CreateRuleSchema } from '@/features/rules/model/schemas';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(createInternalAPIUrl('rules'), {
      method: 'GET',
      headers: getInternalAPIHeaders(),
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

    const response = await fetch(createInternalAPIUrl('rules'), {
      method: 'POST',
      headers: getInternalAPIHeaders(),
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
