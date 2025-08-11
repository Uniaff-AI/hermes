import { NextResponse } from 'next/server';
import { ENV_CONFIG, hasValidExternalAPIConfig } from '@/config/envConfig';

export const API_CONFIG = {
  BASE_URL: ENV_CONFIG.EXTERNAL_API_URL,
  EXTERNAL_API_KEY: ENV_CONFIG.EXTERNAL_API_KEY,
  VERSION: 'v1',
} as const;

export const INTERNAL_API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3004',
} as const;

export const getExternalAPIHeaders = (): Record<string, string> => {
  try {
    if (!hasValidExternalAPIConfig()) {
      throw new Error('External API configuration is missing');
    }

    return {
      'X-API-KEY': API_CONFIG.EXTERNAL_API_KEY!,
      'Content-Type': 'application/json',
    };
  } catch (error) {
    console.error('Error getting external API headers:', error);
    return {
      'Content-Type': 'application/json',
    };
  }
};

export const getInternalAPIHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

export const handleAPIError = (error: unknown, context: string) => {
  console.error(`Error in ${context}:`, error);

  let errorMessage = `Failed to ${context.toLowerCase()}`;
  let statusCode = 500;

  if (error instanceof Error) {
    if (error.message.includes('External API error:')) {
      const statusMatch = error.message.match(/External API error: (\d+)/);
      if (statusMatch) {
        statusCode = parseInt(statusMatch[1], 10);
        errorMessage = `External API returned ${statusCode} error`;
      }
    } else if (error.message.includes('Backend API error:')) {
      const statusMatch = error.message.match(/Backend API error: (\d+)/);
      if (statusMatch) {
        statusCode = parseInt(statusMatch[1], 10);
        errorMessage = `Backend API returned ${statusCode} error`;
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
  try {
    if (!hasValidExternalAPIConfig()) {
      throw new Error('External API configuration is missing');
    }

    const cleanEndpoint = endpoint.startsWith('/')
      ? endpoint.slice(1)
      : endpoint;
    return `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}/${cleanEndpoint}`;
  } catch (error) {
    console.error('Error creating external API URL:', error);
    const cleanEndpoint = endpoint.startsWith('/')
      ? endpoint.slice(1)
      : endpoint;
    return `https://api.hermes.uniaffcrm.com/v1/${cleanEndpoint}`;
  }
};

export const createInternalAPIUrl = (endpoint: string) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${INTERNAL_API_CONFIG.BASE_URL}/api/${cleanEndpoint}`;
};
