import { NextResponse } from 'next/server';
import { ENV_CONFIG, hasValidExternalAPIConfig } from '@/config/envConfig';

export const API_CONFIG = {
  BASE_URL: ENV_CONFIG.EXTERNAL_API_URL,
  EXTERNAL_API_KEY: ENV_CONFIG.EXTERNAL_API_KEY,
  VERSION: 'v1',
} as const;

export const getExternalAPIHeaders = () => {
  if (!hasValidExternalAPIConfig()) {
    throw new Error('External API configuration is missing');
  }

  return {
    'X-API-KEY': API_CONFIG.EXTERNAL_API_KEY!,
    'Content-Type': 'application/json',
  };
};

export const handleAPIError = (error: unknown, context: string) => {
  console.error(`Error in ${context}:`, error);

  // Provide more detailed error information
  let errorMessage = `Failed to ${context.toLowerCase()}`;
  let statusCode = 500;

  if (error instanceof Error) {
    if (error.message.includes('External API error:')) {
      const statusMatch = error.message.match(/External API error: (\d+)/);
      if (statusMatch) {
        statusCode = parseInt(statusMatch[1], 10);
        errorMessage = `External API returned ${statusCode} error`;
      }
    } else if (
      error.message.includes('External API configuration is missing')
    ) {
      statusCode = 500;
      errorMessage = 'External API configuration is missing';
    } else {
      errorMessage = error.message;
    }
  }

  return NextResponse.json(
    {
      success: false,
      message: errorMessage,
      error: error instanceof Error ? error.message : String(error),
    },
    { status: statusCode }
  );
};

export const createSuccessResponse = (data: unknown) => {
  return NextResponse.json({
    success: true,
    data,
  });
};

export const createExternalAPIUrl = (endpoint: string) => {
  if (!hasValidExternalAPIConfig()) {
    throw new Error('External API configuration is missing');
  }

  // Remove leading slash from endpoint if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}/${cleanEndpoint}`;
};
